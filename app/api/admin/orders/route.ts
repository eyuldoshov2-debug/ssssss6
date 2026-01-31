import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')

  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`
      *,
      product:products(*),
      user:users(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { order_id, status } = body

  if (!order_id || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', order_id)
    .select(`
      *,
      product:products(*),
      user:users(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    action: 'order_status_updated',
    details: { order_id, new_status: status },
  })

  // Send notification to Telegram channel
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = "@ArzonStarLog"
  
  if (botToken && data) {
    const user = data.user as { telegram_id?: string; username?: string; first_name?: string } | null
    const product = data.product as { name?: string; type?: string } | null
    
    const statusEmoji = status === 'completed' ? '✅' : status === 'cancelled' ? '❌' : status === 'processing' ? '⏳' : '📋'
    const statusText = status === 'completed' ? 'Bajarildi' : status === 'cancelled' ? 'Bekor qilindi' : status === 'processing' ? 'Jarayonda' : status
    const typeEmoji = product?.type === 'premium' ? '⭐' : product?.type === 'stars' ? '🌟' : '🎨'
    
    const message = `${statusEmoji} *Buyurtma yangilandi!*\n\n${typeEmoji} Mahsulot: *${product?.name || 'Noma\'lum'}*\n👤 Mijoz: @${user?.username || user?.first_name || 'Foydalanuvchi'}\n🆔 ID: \`${user?.telegram_id || 'N/A'}\`\n💰 Narxi: *${data.total_price.toLocaleString()} so'm*\n📋 Status: ${statusEmoji} ${statusText}\n\n🔗 #buyurtma_${data.id.slice(0, 8)}`

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
