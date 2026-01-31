'use client'

import { Card } from '@/components/ui/card'
import { ArrowLeft, Crown, Star, Gift, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order } from '@/lib/types'

interface OrdersScreenProps {
  orders: Order[]
  onBack: () => void
}

const statusConfig = {
  pending: {
    label: 'Kutilmoqda',
    icon: Clock,
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  processing: {
    label: 'Jarayonda',
    icon: Loader2,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  completed: {
    label: 'Bajarildi',
    icon: CheckCircle2,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
  },
  cancelled: {
    label: 'Bekor qilindi',
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  refunded: {
    label: "Qaytarildi",
    icon: XCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
}

export function OrdersScreen({ orders, onBack }: OrdersScreenProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Buyurtmalar tarixi</h1>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Buyurtmalar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status]
              const StatusIcon = status.icon
              const ProductIcon =
                order.product?.type === 'premium'
                  ? Crown
                  : order.product?.type === 'stars'
                    ? Star
                    : Gift
              const productColor =
                order.product?.type === 'premium'
                  ? 'text-accent'
                  : order.product?.type === 'stars'
                    ? 'text-primary'
                    : 'text-chart-3'

              return (
                <Card key={order.id} className="p-4 bg-card border-border">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        order.product?.type === 'premium'
                          ? 'bg-accent/20'
                          : order.product?.type === 'stars'
                            ? 'bg-primary/20'
                            : 'bg-chart-3/20'
                      )}
                    >
                      <ProductIcon className={cn('w-6 h-6', productColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">
                          {order.product?.name || 'Mahsulot'}
                        </p>
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {order.total_price.toLocaleString()} so{"'"}m
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        #{order.id.slice(0, 8).toUpperCase()} •{' '}
                        {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                      </p>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                          status.bg,
                          status.color
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            'w-3 h-3',
                            order.status === 'processing' && 'animate-spin'
                          )}
                        />
                        {status.label}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
