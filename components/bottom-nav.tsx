'use client'

import { Home, Crown, Star, Gift, User, Wallet, Users, Trophy, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isAdmin?: boolean
}

const tabs = [
  { id: 'home', label: 'Bosh sahifa', icon: Home },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'stars', label: 'Stars', icon: Star },
  { id: 'nft', label: 'NFT', icon: Gift },
  { id: 'profile', label: 'Profil', icon: User },
]

const secondaryTabs = [
  { id: 'balance', label: 'Balans', icon: Wallet },
  { id: 'referral', label: 'Referal', icon: Users },
  { id: 'top30', label: 'Top 30', icon: Trophy },
]

export function BottomNav({ activeTab, onTabChange, isAdmin }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom">
      {/* Secondary tabs row */}
      <div className="flex items-center justify-around h-12 max-w-lg mx-auto border-b border-border/50 bg-muted/30">
        {secondaryTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-xs',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
        {isAdmin && (
          <button
            onClick={() => onTabChange('admin')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-xs',
              activeTab === 'admin' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="font-medium">Admin</span>
          </button>
        )}
      </div>
      {/* Main tabs row */}
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-1', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
