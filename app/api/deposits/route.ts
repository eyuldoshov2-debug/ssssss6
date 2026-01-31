import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const telegramId = searchParams.get("telegram_id")
  const status = searchParams.get("status")

  const supabase = await createClient()

  let query = supabase
    .from("deposit_requests")
    .select("*, user:users(id, telegram_id, username, first_name)")
    .order("created_at", { ascending: false })

  if (telegramId) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", telegramId)
      .single()

    if (user) {
      query = query.eq("user_id", user.id)
    }
  }

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { telegram_id, amount, receipt_url } = body

  if (!telegram_id || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, username, first_name")
    .eq("telegram_id", telegram_id)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("deposit_requests")
    .insert({
      user_id: user.id,
      amount,
      receipt_url,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send notification to Telegram channel
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = "@ArzonStarLog"
  
  if (botToken) {
    const message = `💰 *Yangi to'lov so'rovi!*\n\n👤 Foydalanuvchi: @${user.username || user.first_name || telegram_id}\n🆔 ID: \`${telegram_id}\`\n💵 Miqdor: *${amount.toLocaleString()} so'm*\n📋 Status: ⏳ Kutilmoqda\n\n🔗 Admin panelda ko'ring`

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

export async function PATCH(request: Request) {
  const body = await request.json()
  const { deposit_id, status, admin_note } = body

  if (!deposit_id || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createClient()

  // Get deposit info first
  const { data: deposit, error: depositError } = await supabase
    .from("deposit_requests")
    .select("*, user:users(id, telegram_id, username, first_name, balance, referrer_id)")
    .eq("id", deposit_id)
    .single()

  if (depositError || !deposit) {
    return NextResponse.json({ error: "Deposit not found" }, { status: 404 })
  }

  // Update deposit status
  const { error: updateError } = await supabase
    .from("deposit_requests")
    .update({ status, admin_note, updated_at: new Date().toISOString() })
    .eq("id", deposit_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // If approved, add balance to user
  if (status === "approved") {
    const newBalance = (deposit.user?.balance || 0) + deposit.amount
    await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", deposit.user_id)

    // If user has a referrer, give 2% bonus
    if (deposit.user?.referrer_id) {
      const bonus = Math.floor(deposit.amount * 0.02)
      if (bonus > 0) {
        // Get referrer's current balance
        const { data: referrer } = await supabase
          .from("users")
          .select("balance")
          .eq("id", deposit.user.referrer_id)
          .single()

        if (referrer) {
          await supabase
            .from("users")
            .update({ balance: (referrer.balance || 0) + bonus })
            .eq("id", deposit.user.referrer_id)

          // Update referral bonus earned
          await supabase
            .from("referrals")
            .update({ bonus_earned: supabase.rpc("increment_bonus", { row_id: deposit.user.referrer_id, bonus_amount: bonus }) })
            .eq("referred_id", deposit.user_id)
        }
      }
    }
  }

  // Send notification to channel
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const channelId = "@ArzonStarLog"
  
  if (botToken) {
    const statusEmoji = status === "approved" ? "✅" : "❌"
    const statusText = status === "approved" ? "Tasdiqlandi" : "Rad etildi"
    const message = `${statusEmoji} *To'lov ${statusText}!*\n\n👤 Foydalanuvchi: @${deposit.user?.username || deposit.user?.first_name}\n🆔 ID: \`${deposit.user?.telegram_id}\`\n💵 Miqdor: *${deposit.amount.toLocaleString()} so'm*\n📋 Status: ${statusEmoji} ${statusText}${admin_note ? `\n📝 Izoh: ${admin_note}` : ""}`

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

  return NextResponse.json({ success: true })
}
