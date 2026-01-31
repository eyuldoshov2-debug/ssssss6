import { NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

export async function POST(request: Request) {
  const body = await request.json()
  const { user_id, channel_username } = body

  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 500 })
  }

  if (!user_id || !channel_username) {
    return NextResponse.json({ error: 'user_id and channel_username required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/getChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channel_username.startsWith('@') ? channel_username : `@${channel_username}`,
        user_id,
      }),
    })

    const result = await response.json()

    if (!result.ok) {
      // User not found in channel, bot doesn't have access, or invalid user ID
      // Log the error for debugging but return graceful response
      console.error('Telegram API error:', result.description)
      return NextResponse.json({ subscribed: false, error: result.description })
    }

    const status = result.result?.status
    const isSubscribed = ['member', 'administrator', 'creator'].includes(status)

    return NextResponse.json({ subscribed: isSubscribed, status })
  } catch (error) {
    console.error('Telegram API error:', error)
    return NextResponse.json({ error: 'Failed to check subscription' }, { status: 500 })
  }
}
