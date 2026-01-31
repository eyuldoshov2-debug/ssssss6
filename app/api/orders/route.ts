import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { user_id, telegram_id, product_id, recipient_username, quantity, total_price, payment_method } = body

  if (!user_id || !product_id || !total_price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()

  // Get user info including balance
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, telegram_id, username, first_name, balance, total_spent')
    .eq('id', user_id)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if user has enough balance
  if ((user.balance || 0) < total_price) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  // Get product info
  const { data: product } = await supabase
    .from('products')
    .select('name, type')
    .eq('id', product_id)
    .single()

  // Deduct from balance
  const newBalance = (user.balance || 0) - total_price
  const newTotalSpent = (user.total_spent || 0) + total_price

  await supabase
    .from('users')
    .update({ balance: newBalance, total_spent: newTotalSpent })
    .eq('id', user_id)

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id,
      product_id,
      recipient_username,
      quantity: quantity || 1,
      total_price,
      payment_method: 'balance',
      status: 'pending',
    })
    .select(`
      *,
      product:products(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id,
    action: 'order_created',
    details: { order_id: data.id, product_id, total_price },
  })

  // Send notification to Telegram channel
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = "@ArzonStarLog"
  
  if (botToken) {
    const typeEmoji = product?.type === 'premium' ? '⭐' : product?.type === 'stars' ? '🌟' : '🎨'
    const message = `🛒 *Yangi buyurtma!*\n\n${typeEmoji} Mahsulot: *${product?.name || 'Noma\'lum'}*\n👤 Mijoz: @${user.username || user.first_name || user.telegram_id}\n🆔 ID: \`${user.telegram_id}\`\n📦 Miqdor: *${quantity || 1} ta*\n💰 Narxi: *${total_price.toLocaleString()} so'm*\n${recipient_username ? `📩 Qabul qiluvchi: @${recipient_username}\n` : ''}📋 Status: ⏳ Kutilmoqda\n\n🔗 #buyurtma_${data.id.slice(0, 8)}`

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: "Markdown",
      }),
    })
  }

  return NextResponse.json(data)
}
