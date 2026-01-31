'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { Onboarding } from '@/components/onboarding'
import { BottomNav } from '@/components/bottom-nav'
import { HomeScreen } from '@/components/screens/home-screen'
import { PremiumScreen } from '@/components/screens/premium-screen'
import { StarsScreen } from '@/components/screens/stars-screen'
import { NFTScreen } from '@/components/screens/nft-screen'
import { ProfileScreen } from '@/components/screens/profile-screen'
import { CheckoutScreen } from '@/components/screens/checkout-screen'
import { OrderSuccessScreen } from '@/components/screens/order-success-screen'
import { OrdersScreen } from '@/components/screens/orders-screen'
import { MyNFTsScreen } from '@/components/screens/my-nfts-screen'
import { BalanceScreen } from '@/components/screens/balance-screen'
import { ReferralScreen } from '@/components/screens/referral-screen'
import { TopUsersScreen } from '@/components/screens/top-users-screen'
import { AdminPanel } from '@/components/screens/admin-panel'
import type { Product, User, Order, UserNFT } from '@/lib/types'

// Telegram WebApp types
interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: TelegramUser
    start_param?: string
  }
  ready: () => void
  expand: () => void
  close: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

// User stats response type
interface UserStats {
  user: {
    id: string
    telegram_id: string
    username: string | null
    first_name: string | null
    last_name: string | null
    photo_url: string | null
    is_admin: boolean
    referral_code: string | null
    created_at: string
  }
  balance: number
  total_spent: number
  total_orders: number
  completed_orders: number
  pending_orders: number
  referral_count: number
  nft_count: number
}

// SSR-safe check for Telegram WebApp
function getTelegramWebApp() {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp || null
}

function getTelegramUser() {
  const webApp = getTelegramWebApp()
  return webApp?.initDataUnsafe?.user || null
}

function getStartParam() {
  const webApp = getTelegramWebApp()
  return webApp?.initDataUnsafe?.start_param || null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Screen =
  | 'onboarding'
  | 'main'
  | 'checkout'
  | 'success'
  | 'orders'
  | 'nfts'
  | 'balance'
  | 'referral'
  | 'top30'
  | 'admin'

export function TelegramApp() {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [telegramId, setTelegramId] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch products - ensure it's always an array
  const { data: productsData } = useSWR<Product[]>('/api/products', fetcher)
  const products = Array.isArray(productsData) ? productsData : []

  // Fetch user orders - ensure it's always an array
  const { data: ordersData } = useSWR<Order[]>(
    user ? `/api/orders?user_id=${user.id}` : null,
    fetcher,
    { refreshInterval: 10000 }
  )
  const userOrders = Array.isArray(ordersData) ? ordersData : []

  // Fetch user NFTs - ensure it's always an array
  const { data: userNFTsData } = useSWR<UserNFT[]>(
    user ? `/api/users/${user.id}/nfts` : null,
    fetcher
  )
  const userNFTs = Array.isArray(userNFTsData) ? userNFTsData : []

  // Fetch user stats (balance, orders count, total spent) - real-time sync
  const { data: userStats } = useSWR<UserStats>(
    telegramId ? `/api/user-stats?telegram_id=${telegramId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  // Derive balance and stats from user stats API response
  const balance = userStats?.balance || 0
  const totalSpent = userStats?.total_spent || 0
  const completedOrdersCount = userStats?.completed_orders || 0
  
  // Admin check - use stats API response which checks ADMIN_TELEGRAM_ID env var
  const isAdmin = userStats?.user?.is_admin || user?.is_admin || false

  // Initialize user from Telegram WebApp - SSR-safe
  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return
    if (isInitialized) return

    const initUser = async () => {
      // Get user from Telegram WebApp using SSR-safe helpers
      const tgUser = getTelegramUser()
      const startParam = getStartParam()

      // Tell Telegram the app is ready and expand it
      const webApp = getTelegramWebApp()
      if (webApp) {
        webApp.ready()
        webApp.expand()
      }

      // Build user data from Telegram or use fallback for testing
      const userData = tgUser
        ? {
            telegram_id: tgUser.id.toString(),
            username: tgUser.username || null,
            first_name: tgUser.first_name || null,
            last_name: tgUser.last_name || null,
            photo_url: tgUser.photo_url || null,
          }
        : {
            // Fallback for testing outside Telegram
            telegram_id: '123456789',
            username: 'test_user',
            first_name: 'Test',
            last_name: 'User',
            photo_url: null,
          }

      setTelegramId(userData.telegram_id)
      setIsInitialized(true)

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        })

        const responseText = await response.text()

        if (!response.ok) {
          console.error('[v0] User API error:', response.status, responseText)
          return
        }

        let parsedUser
        try {
          parsedUser = JSON.parse(responseText)
        } catch {
          console.error('[v0] Failed to parse user response:', responseText)
          return
        }

        if (parsedUser && !parsedUser.error) {
          setUser(parsedUser)

          // If there's a referral code in start_param, apply it
          if (startParam && startParam.length > 0) {
            await fetch('/api/referrals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegram_id: userData.telegram_id,
                referral_code: startParam,
              }),
            })
          }
        } else if (parsedUser?.error) {
          console.error('[v0] User API returned error:', parsedUser.error)
        }
      } catch (error) {
        console.error('[v0] Failed to initialize user:', error)
      }
    }

    initUser()
  }, [isInitialized])

  const handleOnboardingComplete = useCallback(() => {
    setScreen('main')
  }, [])

  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
    setScreen('checkout')
  }, [])

  const handleCheckoutBack = useCallback(() => {
    setSelectedProduct(null)
    setScreen('main')
  }, [])

  const handleCheckoutComplete = useCallback(
    async (recipientUsername?: string) => {
      if (!selectedProduct || !user) return

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            telegram_id: telegramId,
            product_id: selectedProduct.id,
            recipient_username: recipientUsername,
            quantity: 1,
            total_price: selectedProduct.price,
            payment_method: 'balance',
          }),
        })

        const order = await response.json()
        if (order && !order.error) {
          setLastOrder(order)
          setScreen('success')
          // Refresh orders and user stats (balance)
          mutate(`/api/orders?user_id=${user.id}`)
          mutate(`/api/user-stats?telegram_id=${telegramId}`)
        } else {
          // Show error - insufficient balance
          alert(order.error || 'Xatolik yuz berdi. Balansingizni tekshiring.')
        }
      } catch (error) {
        console.error('Failed to create order:', error)
      }
    },
    [selectedProduct, user, telegramId]
  )

  const handleGoHome = useCallback(() => {
    setSelectedProduct(null)
    setLastOrder(null)
    setActiveTab('home')
    setScreen('main')
  }, [])

  const handleViewOrders = useCallback(() => {
    setScreen('orders')
  }, [])

  const handleViewNFTs = useCallback(() => {
    setScreen('nfts')
  }, [])

  const handleBackFromOrders = useCallback(() => {
    setScreen('main')
    setActiveTab('profile')
  }, [])

  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'balance') {
      setScreen('balance')
    } else if (tab === 'referral') {
      setScreen('referral')
    } else if (tab === 'top30') {
      setScreen('top30')
    } else if (tab === 'admin') {
      setScreen('admin')
    } else {
      setScreen('main')
      setActiveTab(tab)
    }
  }, [])

  const handleBackToMain = useCallback(() => {
    setScreen('main')
  }, [])

  // Render based on current screen
  if (screen === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  if (screen === 'checkout' && selectedProduct) {
    return (
      <CheckoutScreen
        product={selectedProduct}
        balance={balance}
        onBack={handleCheckoutBack}
        onComplete={handleCheckoutComplete}
      />
    )
  }

  if (screen === 'success' && lastOrder) {
    return (
      <OrderSuccessScreen
        order={lastOrder}
        onGoHome={handleGoHome}
        onViewOrders={handleViewOrders}
      />
    )
  }

  if (screen === 'orders') {
    return <OrdersScreen orders={userOrders} onBack={handleBackFromOrders} />
  }

  if (screen === 'nfts') {
    return <MyNFTsScreen nfts={userNFTs} onBack={handleBackFromOrders} />
  }

  if (screen === 'balance') {
    return <BalanceScreen telegramId={telegramId} onBack={handleBackToMain} />
  }

  if (screen === 'referral') {
    return <ReferralScreen telegramId={telegramId} onBack={handleBackToMain} />
  }

  if (screen === 'top30') {
    return <TopUsersScreen onBack={handleBackToMain} />
  }

  if (screen === 'admin' && isAdmin) {
    return <AdminPanel onBack={handleBackToMain} />
  }

  // Main app with tabs
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto pb-28">
        {activeTab === 'home' && <HomeScreen onNavigate={handleTabChange} balance={balance} />}
        {activeTab === 'premium' && (
          <PremiumScreen products={products} onSelectProduct={handleSelectProduct} />
        )}
        {activeTab === 'stars' && (
          <StarsScreen products={products} onSelectProduct={handleSelectProduct} />
        )}
        {activeTab === 'nft' && (
          <NFTScreen products={products} onSelectProduct={handleSelectProduct} />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen
            user={user}
            orders={userOrders}
            balance={balance}
            totalSpent={totalSpent}
            completedOrdersCount={completedOrdersCount}
            onViewOrders={handleViewOrders}
            onViewNFTs={handleViewNFTs}
            onNavigate={handleTabChange}
          />
        )}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} isAdmin={isAdmin} />
    </div>
  )
}
