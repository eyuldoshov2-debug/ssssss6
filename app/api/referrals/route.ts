import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const telegramId = searchParams.get("telegram_id")

  if (!telegramId) {
    return NextResponse.json({ error: "telegram_id is required" }, { status: 400 })
  }

  const supabase = await createClient()

  // Get user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, referral_code")
    .eq("telegram_id", telegramId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Get referrals
  const { data: referrals, error: referralsError } = await supabase
    .from("referrals")
    .select("*, referred_user:users!referrals_referred_id_fkey(id, telegram_id, username, first_name, total_spent)")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })

  if (referralsError) {
    return NextResponse.json({ error: referralsError.message }, { status: 500 })
  }

  // Calculate total bonus
  const totalBonus = referrals?.reduce((sum, r) => sum + (r.bonus_earned || 0), 0) || 0

  return NextResponse.json({
    referral_code: user.referral_code,
    referrals: referrals || [],
    total_bonus: totalBonus,
    referral_count: referrals?.length || 0,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { telegram_id, referral_code } = body

  if (!telegram_id || !referral_code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createClient()

  // Find referrer by referral code
  const { data: referrer, error: referrerError } = await supabase
    .from("users")
    .select("id, telegram_id")
    .eq("referral_code", referral_code)
    .single()

  if (referrerError || !referrer) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
  }

  // Get current user
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, referrer_id")
    .eq("telegram_id", telegram_id)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Check if user already has a referrer
  if (user.referrer_id) {
    return NextResponse.json({ error: "You already have a referrer" }, { status: 400 })
  }

  // Check if user is trying to refer themselves
  if (referrer.telegram_id === telegram_id) {
    return NextResponse.json({ error: "You cannot refer yourself" }, { status: 400 })
  }

  // Update user's referrer
  await supabase
    .from("users")
    .update({ referrer_id: referrer.id })
    .eq("id", user.id)

  // Create referral record
  const { error: referralError } = await supabase
    .from("referrals")
    .insert({
      referrer_id: referrer.id,
      referred_id: user.id,
      bonus_earned: 0,
    })

  if (referralError) {
    return NextResponse.json({ error: referralError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
