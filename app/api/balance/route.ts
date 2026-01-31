import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const telegramId = searchParams.get("telegram_id")

  if (!telegramId) {
    return NextResponse.json({ error: "telegram_id is required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from("users")
    .select("id, balance, total_spent")
    .eq("telegram_id", telegramId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ balance: user?.balance || 0, total_spent: user?.total_spent || 0 })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { telegram_id, amount, action } = body

  if (!telegram_id || !amount || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, balance")
    .eq("telegram_id", telegram_id)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  let newBalance = user.balance || 0
  if (action === "add") {
    newBalance += amount
  } else if (action === "subtract") {
    if (newBalance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }
    newBalance -= amount
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, balance: newBalance })
}
