import { NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

export async function POST(request: Request) {
  const body = await request.json()
  const { chat_id, text, parse_mode = 'HTML' } = body

  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 500 })
  }

  if (!chat_id || !text) {
    return NextResponse.json({ error: 'chat_id and text required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode,
      }),
    })

    const result = await response.json()

    if (!result.ok) {
      return NextResponse.json({ error: result.description }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Telegram API error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
