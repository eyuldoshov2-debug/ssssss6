import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegram_id')
    const userId = searchParams.get('user_id')

    if (!telegramId && !userId) {
      return NextResponse.json(
        { error: 'telegram_id or user_id required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Get user first - use maybeSingle() to handle case when user doesn't exist
    let user
    if (userId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (error) {
        console.error('[v0] Error fetching user by id:', error)
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
      }
      user = data
    } else if (telegramId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle()
      
      if (error) {
        console.error('[v0] Error fetching user by telegram_id:', error)
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
      }
      user = data
    }

    // If user doesn't exist yet, return empty stats (user will be created on first POST to /api/users)
    if (!user) {
      return NextResponse.json({
        user: null,
        balance: 0,
        total_spent: 0,
        total_orders: 0,
        completed_orders: 0,
        pending_orders: 0,
        referral_count: 0,
        nft_count: 0,
      })
    }

    // Get order statistics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total_price, created_at')
      .eq('user_id', user.id)

    if (ordersError) {
      console.error('[v0] Error fetching orders:', ordersError)
    }

    const ordersList = orders || []
    const completedOrders = ordersList.filter((o) => o.status === 'completed')
    const pendingOrders = ordersList.filter((o) => o.status === 'pending')
    const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total_price || 0), 0)

    // Get referral count
    const { count: referralCount } = await supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', user.id)

    // Get NFT count
    const { count: nftCount } = await supabase
      .from('user_nfts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Check if user is admin based on environment variable
    const adminTelegramId = process.env.ADMIN_TELEGRAM_ID
    const isAdmin = user.is_admin || (adminTelegramId && user.telegram_id === adminTelegramId)

    const stats = {
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url,
        is_admin: isAdmin,
        referral_code: user.referral_code,
        created_at: user.created_at,
      },
      balance: user.balance || 0,
      total_spent: user.total_spent || totalSpent,
      total_orders: ordersList.length,
      completed_orders: completedOrders.length,
      pending_orders: pendingOrders.length,
      referral_count: referralCount || 0,
      nft_count: nftCount || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[v0] User stats API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
