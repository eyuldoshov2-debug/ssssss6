export type ProductType = 'premium' | 'stars' | 'nft'

export interface Product {
  id: string
  type: ProductType
  name: string
  description: string | null
  price: number
  original_price: number | null
  duration_months: number | null
  stars_amount: number | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

export interface User {
  id: string
  telegram_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  photo_url: string | null
  is_subscribed: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type PaymentMethod = 'click' | 'payme' | 'telegram'

export interface Order {
  id: string
  user_id: string
  product_id: string
  recipient_username: string | null
  quantity: number
  total_price: number
  status: OrderStatus
  payment_method: PaymentMethod | null
  payment_id: string | null
  created_at: string
  updated_at: string
  product?: Product
  user?: User
}

export interface UserNFT {
  id: string
  user_id: string
  nft_name: string
  nft_image: string | null
  purchase_date: string
  order_id: string | null
}

export interface Notification {
  id: string
  title: string
  message: string
  image_url: string | null
  target_users: string[] | null
  is_sent: boolean
  sent_at: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

export interface Stats {
  total_users: number
  total_orders: number
  total_revenue: number
  orders_today: number
  revenue_today: number
  weekly_revenue?: number
  monthly_revenue?: number
}

// Balance and Deposits
export type DepositStatus = 'pending' | 'approved' | 'rejected'

export interface DepositRequest {
  id: string
  user_id: string
  amount: number
  receipt_url: string | null
  status: DepositStatus
  admin_note: string | null
  created_at: string
  updated_at: string
  user?: User
}

export interface AdminCard {
  id: string
  card_number: string
  card_holder: string
  bank_name: string
  is_active: boolean
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  bonus_earned: number
  created_at: string
  referred_user?: User
}

export interface TopUser {
  id: string
  telegram_id: string
  username: string | null
  first_name: string | null
  total_spent: number
  photo_url: string | null
}
