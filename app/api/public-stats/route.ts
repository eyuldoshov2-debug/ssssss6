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

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Foydalanuvchilar sonini olish
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      console.error('Users count error:', usersError)
    }

    // Buyurtmalar sonini olish
    const { count: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    if (ordersError) {
      console.error('Orders count error:', ordersError)
    }

    // O'rtacha reytingni olish (products jadvalidan)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('rating')

    if (productsError) {
      console.error('Products error:', productsError)
    }

    // O'rtacha reytingni hisoblash
    let avgRating = 4.9
    if (products && products.length > 0) {
      const ratings = products.map(p => p.rating || 0).filter(r => r > 0)
      if (ratings.length > 0) {
        avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      }
    }

    return NextResponse.json({
      users: usersCount || 0,
      orders: ordersCount || 0,
      rating: Number(avgRating.toFixed(1)),
    })
  } catch (error) {
    console.error('Public stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
