import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a direct Supabase client for API routes
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

const adminTelegramId = process.env.ADMIN_TELEGRAM_ID

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('telegram_id')

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[v0] GET users error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] GET users exception:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telegram_id, username, first_name, last_name, photo_url } = body

    if (!telegram_id) {
      return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Check if user exists - use maybeSingle() to avoid error when user doesn't exist
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegram_id)
      .maybeSingle()

    if (fetchError) {
      console.error('[v0] POST users fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const isAdmin = adminTelegramId ? telegram_id === adminTelegramId : false

    if (existingUser) {
      // Update existing user (also update is_admin status in case it changed)
      const { data, error } = await supabase
        .from('users')
        .update({
          username,
          first_name,
          last_name,
          photo_url,
          is_admin: isAdmin || existingUser.is_admin, // Keep admin if already set, or set if matches env var
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', telegram_id)
        .select()
        .single()

      if (error) {
        console.error('[v0] POST users update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // Generate referral code for new user
    const referralCode = `REF${telegram_id.slice(-6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create new user with balance fields
    const { data, error } = await supabase
      .from('users')
      .insert({
        telegram_id,
        username,
        first_name,
        last_name,
        photo_url,
        is_subscribed: false,
        is_admin: isAdmin,
        balance: 0,
        total_spent: 0,
        referral_code: referralCode,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] POST users insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log activity (don't fail if this errors)
    try {
      await supabase.from('activity_logs').insert({
        user_id: data.id,
        action: 'user_created',
        details: { telegram_id, username },
      })
    } catch (logError) {
      console.error('[v0] Activity log error:', logError)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Users API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
