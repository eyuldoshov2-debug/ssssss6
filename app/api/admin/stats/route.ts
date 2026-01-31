import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Get total orders
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_price')
    .eq('status', 'completed')

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_price, 0) || 0

  // Get today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: ordersToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  const { data: revenueTodayData } = await supabase
    .from('orders')
    .select('total_price')
    .eq('status', 'completed')
    .gte('created_at', today.toISOString())

  const revenueToday = revenueTodayData?.reduce((sum, order) => sum + order.total_price, 0) || 0

  // Get weekly stats
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)

  const { data: revenueWeekData } = await supabase
    .from('orders')
    .select('total_price')
    .eq('status', 'completed')
    .gte('created_at', weekAgo.toISOString())

  const weeklyRevenue = revenueWeekData?.reduce((sum, order) => sum + order.total_price, 0) || 0

  // Get monthly stats
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  monthAgo.setHours(0, 0, 0, 0)

  const { data: revenueMonthData } = await supabase
    .from('orders')
    .select('total_price')
    .eq('status', 'completed')
    .gte('created_at', monthAgo.toISOString())

  const monthlyRevenue = revenueMonthData?.reduce((sum, order) => sum + order.total_price, 0) || 0

  return NextResponse.json({
    total_users: totalUsers || 0,
    total_orders: totalOrders || 0,
    total_revenue: totalRevenue,
    orders_today: ordersToday || 0,
    revenue_today: revenueToday,
    weekly_revenue: weeklyRevenue,
    monthly_revenue: monthlyRevenue,
  })
}
