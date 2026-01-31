'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Wallet,
  Crown,
  Star,
  Gift,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface CheckoutScreenProps {
  product: Product
  balance: number
  onBack: () => void
  onComplete: (recipientUsername?: string) => void
}

export function CheckoutScreen({ product, balance, onBack, onComplete }: CheckoutScreenProps) {
  const [recipientUsername, setRecipientUsername] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const ProductIcon =
    product.type === 'premium' ? Crown : product.type === 'stars' ? Star : Gift
  const productColor =
    product.type === 'premium'
      ? 'text-accent'
      : product.type === 'stars'
        ? 'text-primary'
        : 'text-chart-3'

  const hasEnoughBalance = balance >= product.price

  const handlePayment = async () => {
    if (!hasEnoughBalance) return
    setIsProcessing(true)
    await onComplete(recipientUsername || undefined)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">To{"'"}lov</h1>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 py-4">
        <Card className={cn(
          "p-4 border-2",
          hasEnoughBalance ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                hasEnoughBalance ? "bg-emerald-100" : "bg-red-100"
              )}>
                <Wallet className={cn("w-5 h-5", hasEnoughBalance ? "text-emerald-600" : "text-red-600")} />
              </div>
              <div>
                <p className={cn("text-sm", hasEnoughBalance ? "text-emerald-700" : "text-red-700")}>Joriy balans</p>
                <p className={cn("font-bold text-lg", hasEnoughBalance ? "text-emerald-800" : "text-red-800")}>
                  {balance.toLocaleString()} so{"'"}m
                </p>
              </div>
            </div>
            {!hasEnoughBalance && (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          {!hasEnoughBalance && (
            <p className="text-sm text-red-600 mt-3">
              Balansingizda yetarli mablag' yo'q. Hisobingizni to'ldiring.
            </p>
          )}
        </Card>
      </div>

      {/* Product Summary */}
      <div className="px-4 pb-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                product.type === 'premium'
                  ? 'bg-accent/20'
                  : product.type === 'stars'
                    ? 'bg-primary/20'
                    : 'bg-chart-3/20'
              )}
            >
              <ProductIcon className={cn('w-7 h-7', productColor)} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.type === 'premium'
                  ? `${product.duration_months} oylik obuna`
                  : product.type === 'stars'
                    ? `${product.stars_amount} Stars`
                    : 'NFT Sovg\'a'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-foreground">
                {product.price.toLocaleString()} so{"'"}m
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recipient Username */}
      <div className="px-4 mb-6">
        <Card className="p-4 bg-card border-border">
          <Label htmlFor="username" className="text-foreground mb-2 block">
            Qabul qiluvchi username (ixtiyoriy)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              placeholder="username"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              className="pl-8 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Bo{"'"}sh qoldiring - o{"'"}zingizga yetkaziladi
          </p>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="px-4 mb-6">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-3">Buyurtma xulosasi</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mahsulot</span>
              <span className="text-foreground">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Narxi</span>
              <span className="text-foreground">
                {product.price.toLocaleString()} so{"'"}m
              </span>
            </div>
            {product.original_price && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chegirma</span>
                <span className="text-chart-4">
                  -{(product.original_price - product.price).toLocaleString()} so{"'"}m
                </span>
              </div>
            )}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">To'lov usuli</span>
              <span className="text-foreground flex items-center gap-1">
                <Wallet className="w-4 h-4" /> Balans
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Qoldiq balans</span>
              <span className={hasEnoughBalance ? "text-emerald-600" : "text-red-600"}>
                {(balance - product.price).toLocaleString()} so{"'"}m
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Jami</span>
              <span className="font-bold text-primary">
                {product.price.toLocaleString()} so{"'"}m
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Pay Button */}
      <div className="px-4">
        <Button
          onClick={handlePayment}
          disabled={!hasEnoughBalance || isProcessing}
          className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Kutilmoqda...
            </>
          ) : hasEnoughBalance ? (
            `Balansdan to'lash - ${product.price.toLocaleString()} so'm`
          ) : (
            "Balansni to'ldiring"
          )}
        </Button>
      </div>
    </div>
  )
}
