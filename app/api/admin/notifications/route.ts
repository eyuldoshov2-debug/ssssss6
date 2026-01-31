import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { title, message, image_url, target_users } = body

  if (!title || !message) {
    return NextResponse.json({ error: 'Title and message required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      title,
      message,
      image_url,
      target_users,
      is_sent: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { notification_id, is_sent, send_to_telegram } = body

  if (!notification_id) {
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Get notification details
  const { data: notification } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notification_id)
    .single()

  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
  }

  // If sending to Telegram, get all users and send
  if (send_to_telegram) {
    const { data: users } = await supabase.from('users').select('telegram_id')
    
    if (users && users.length > 0) {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
      const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
      
      const messageText = `<b>${notification.title}</b>\n\n${notification.message}`
      
      // Send to all users (in production, use batch/queue)
      for (const user of users) {
        try {
          await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: messageText,
              parse_mode: 'HTML',
            }),
          })
        } catch (e) {
          console.error(`Failed to send to ${user.telegram_id}:`, e)
        }
      }
    }
  }

  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_sent,
      sent_at: is_sent ? new Date().toISOString() : null,
    })
    .eq('id', notification_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
