'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Home, ShoppingBag } from 'lucide-react'
import type { Order } from '@/lib/types'

interface OrderSuccessScreenProps {
  order: Order
  onGoHome: () => void
  onViewOrders: () => void
}

export function OrderSuccessScreen({
  order,
  onGoHome,
  onViewOrders,
}: OrderSuccessScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Success Icon */}
      <div className="w-24 h-24 rounded-full bg-chart-4/20 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-14 h-14 text-chart-4" />
      </div>

      {/* Success Message */}
      <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
        Buyurtma qabul qilindi!
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Buyurtmangiz muvaffaqiyatli amalga oshirildi
      </p>

      {/* Order Details */}
      <Card className="w-full max-w-sm p-4 bg-card border-border mb-8">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Buyurtma raqami</span>
            <span className="text-foreground font-mono">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Holati</span>
            <span className="text-chart-4 font-medium">Jarayonda</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To{"'"}lov</span>
            <span className="text-foreground">
              {order.total_price.toLocaleString()} so{"'"}m
            </span>
          </div>
          <div className="h-px bg-border" />
          <p className="text-xs text-muted-foreground text-center">
            Buyurtmangiz 5-15 daqiqa ichida yetkaziladi
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          onClick={onGoHome}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Home className="w-5 h-5 mr-2" />
          Bosh sahifaga
        </Button>
        <Button
          onClick={onViewOrders}
          variant="outline"
          className="w-full h-12 border-border text-foreground bg-transparent hover:bg-secondary"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Buyurtmalarni ko{"'"}rish
        </Button>
      </div>
    </div>
  )
}
