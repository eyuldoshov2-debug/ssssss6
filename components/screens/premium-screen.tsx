'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface PremiumScreenProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
}

const premiumFeatures = [
  'Reklamasiz xabarlar',
  '4GB fayl yuklash',
  'Tezroq yuklab olish',
  'Premium stikerlar',
  'Maxsus animatsiyalar',
  'Profil bezaklari',
]

export function PremiumScreen({ products, onSelectProduct }: PremiumScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const premiumProducts = products.filter((p) => p.type === 'premium')

  const handleSelect = (product: Product) => {
    setSelectedId(product.id)
  }

  const handleContinue = () => {
    const selected = premiumProducts.find((p) => p.id === selectedId)
    if (selected) {
      onSelectProduct(selected)
    }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Telegram Premium
            </h1>
            <p className="text-sm text-muted-foreground">
              Premium obunani tanlang
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 mb-6">
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-3">
            Premium imkoniyatlar
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {premiumFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Plans */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Tariflarni tanlang</h3>
        <div className="space-y-3">
          {premiumProducts.map((product) => {
            const isSelected = selectedId === product.id
            const discount = product.original_price
              ? Math.round(
                  ((product.original_price - product.price) / product.original_price) * 100
                )
              : 0

            return (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="w-full text-left"
              >
                <Card
                  className={cn(
                    'p-4 border-2 transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.duration_months} oylik obuna
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {product.price.toLocaleString()} so{"'"}m
                      </p>
                      {product.original_price && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground line-through">
                            {product.original_price.toLocaleString()}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                            -{discount}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
        <Button
          onClick={handleContinue}
          disabled={!selectedId}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <span>Davom etish</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
