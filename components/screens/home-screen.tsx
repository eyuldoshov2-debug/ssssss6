'use client'

import { Card } from '@/components/ui/card'
import { Crown, Star, Gift, TrendingUp, Shield, Zap, Wallet, ChevronRight } from 'lucide-react'
import useSWR from 'swr'

interface HomeScreenProps {
  onNavigate: (tab: string) => void
  balance?: number
}

interface PublicStats {
  users: number
  orders: number
  rating: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function HomeScreen({ onNavigate, balance = 0 }: HomeScreenProps) {
  const { data: stats } = useSWR<PublicStats>('/api/public-stats', fetcher, {
    refreshInterval: 30000,
  })

  const usersDisplay = stats?.users ? formatNumber(stats.users) + '+' : '50K+'
  const ordersDisplay = stats?.orders ? formatNumber(stats.orders) + '+' : '100K+'
  const ratingDisplay = stats?.rating || 4.9

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Xush kelibsiz!
          </h1>
          <p className="text-muted-foreground">
            Telegram xizmatlari eng arzon narxlarda
          </p>
        </div>

        {/* Balance Card */}
        <Card 
          className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 mb-4 cursor-pointer hover:opacity-95 transition-opacity"
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

        {/* Stats Banner */}
        <Card className="p-4 bg-primary/10 border-primary/20 mb-4">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{usersDisplay}</p>
              <p className="text-xs text-muted-foreground">Foydalanuvchi</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{ordersDisplay}</p>
              <p className="text-xs text-muted-foreground">Buyurtma</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{ratingDisplay}</p>
              <p className="text-xs text-muted-foreground">Reyting</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="px-4 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Xizmatlar
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Premium Card */}
          <button
            onClick={() => onNavigate('premium')}
            className="text-left"
          >
            <Card className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-7 h-7 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Telegram Premium
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Premium obunani arzon narxda sotib oling
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                      30% chegirma
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </button>

          {/* Stars Card */}
          <button
            onClick={() => onNavigate('stars')}
            className="text-left"
          >
            <Card className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Telegram Stars
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stars valyutasini xarid qiling
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Eng arzon
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </button>

          {/* NFT Card */}
          <button
            onClick={() => onNavigate('nft')}
            className="text-left"
          >
            <Card className="p-5 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-chart-3/20 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-7 h-7 text-chart-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    NFT Sovg{"'"}alar
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Noyob NFT sovg{"'"}alarni sotib oling
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-chart-3/10 text-chart-3">
                      Yangi
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Nega bizni tanlash kerak?
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-card border-border text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-foreground font-medium">Arzon narx</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-xs text-foreground font-medium">Tez yetkazib</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <Shield className="w-6 h-6 mx-auto mb-2 text-chart-4" />
            <p className="text-xs text-foreground font-medium">Xavfsiz</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
