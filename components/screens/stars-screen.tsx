'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Check, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface StarsScreenProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
}

export function StarsScreen({ products, onSelectProduct }: StarsScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const starsProducts = products.filter((p) => p.type === 'stars')

  const handleSelect = (product: Product) => {
    setSelectedId(product.id)
  }

  const handleContinue = () => {
    const selected = starsProducts.find((p) => p.id === selectedId)
    if (selected) {
      onSelectProduct(selected)
    }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Telegram Stars</h1>
            <p className="text-sm text-muted-foreground">
              Stars miqdorini tanlang
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="px-4 mb-6">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium mb-1">
                Stars nima?
              </p>
              <p className="text-xs text-muted-foreground">
                Telegram Stars - bu Telegram ichidagi valyuta. Undan kontentga
                obuna bo{"'"}lish, botlarga to{"'"}lash va boshqa xizmatlar uchun foydalanish
                mumkin.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Packages */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Paketlar</h3>
        <div className="grid grid-cols-2 gap-3">
          {starsProducts.map((product) => {
            const isSelected = selectedId === product.id
            const pricePerStar = product.stars_amount
              ? (product.price / product.stars_amount).toFixed(0)
              : 0

            return (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="text-left"
              >
                <Card
                  className={cn(
                    'p-4 border-2 transition-all h-full',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30'
                  )}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center mb-3',
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-5 h-5 text-primary fill-primary" />
                      <span className="text-lg font-bold text-foreground">
                        {product.stars_amount?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {product.price.toLocaleString()} so{"'"}m
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ~{pricePerStar} so{"'"}m/star
                    </p>
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
