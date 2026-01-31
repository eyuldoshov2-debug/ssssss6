'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User,
  ShoppingBag,
  Gift,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  Wallet,
  Users,
  Trophy,
} from 'lucide-react'
import type { User as UserType, Order } from '@/lib/types'

interface ProfileScreenProps {
  user: UserType | null
  orders: Order[]
  balance: number
  totalSpent?: number
  completedOrdersCount?: number
  onViewOrders: () => void
  onViewNFTs: () => void
  onNavigate: (tab: string) => void
}

export function ProfileScreen({
  user,
  orders,
  balance,
  totalSpent: propTotalSpent,
  completedOrdersCount: propCompletedOrders,
  onViewOrders,
  onViewNFTs,
  onNavigate,
}: ProfileScreenProps) {
  
  // Statistika hisoblash
  const completedOrders = propCompletedOrders ?? orders.filter((o) => o.status === 'completed').length
  const totalSpent = propTotalSpent ?? orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total_price, 0)

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.first_name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">
                {user?.first_name || 'Foydalanuvchi'}{' '}
                {user?.last_name || ''}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{user?.username || 'username'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Balance Card */}
      <div className="px-4 mb-4">
        <Card 
          className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => onNavigate('balance')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Joriy balans</p>
                <p className="text-2xl font-bold">{balance.toLocaleString()} so{"'"}m</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/70" />
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-primary">{completedOrders}</p>
            <p className="text-xs text-muted-foreground">Buyurtmalar</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-accent">
              {totalSpent.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Jami sarflangan (so{"'"}m)</p>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <Card 
            className="p-3 bg-card border-border text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onNavigate('balance')}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-foreground">Balans</p>
          </Card>
          
          <Card 
            className="p-3 bg-card border-border text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onNavigate('referral')}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-foreground">Referal</p>
          </Card>

          <Card 
            className="p-3 bg-card border-border text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onNavigate('top30')}
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs font-medium text-foreground">Top 30</p>
          </Card>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mb-4">
        <h3 className="font-semibold text-foreground mb-3">Mening hisobim</h3>
        <Card className="bg-card border-border overflow-hidden">
          <button
            onClick={onViewOrders}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span className="text-foreground">Buyurtmalar tarixi</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="h-px bg-border ml-12" />
          <button
            onClick={onViewNFTs}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-purple-500" />
              <span className="text-foreground">Mening NFT{"'"}larim</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </div>

      {/* Support */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Yordam</h3>
        <Card className="bg-card border-border overflow-hidden">
          <a
            href="https://t.me/arzonstarhelp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Qo{"'"}llab-quvvatlash</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </a>
          <div className="h-px bg-border ml-12" />
          <a
            href="@Arzon_Star"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-accent" />
              <span className="text-foreground">FAQ / Yordam</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </a>
        </Card>
      </div>
    </div>
  )
}