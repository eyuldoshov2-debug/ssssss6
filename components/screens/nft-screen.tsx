'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, ChevronRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface NFTScreenProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
}

export function NFTScreen({ products, onSelectProduct }: NFTScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const nftProducts = products.filter((p) => p.type === 'nft')

  const handleSelect = (product: Product) => {
    setSelectedId(product.id)
  }

  const handleContinue = () => {
    const selected = nftProducts.find((p) => p.id === selectedId)
    if (selected) {
      onSelectProduct(selected)
    }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-chart-3/20 flex items-center justify-center">
            <Gift className="w-6 h-6 text-chart-3" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">NFT Sovg{"'"}alar</h1>
            <p className="text-sm text-muted-foreground">
              Noyob raqamli sovg{"'"}alar
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="px-4 mb-6">
        <Card className="p-4 bg-chart-3/5 border-chart-3/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-chart-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium mb-1">
                NFT Sovg{"'"}a nima?
              </p>
              <p className="text-xs text-muted-foreground">
                Telegram NFT sovg{"'"}alari - bu noyob raqamli kollektsiyalar. Ularni
                do{"'"}stlaringizga yuborish yoki o{"'"}zingiz saqlashingiz mumkin.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* NFT Grid */}
      <div className="px-4 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Mavjud sovg{"'"}alar</h3>
        <div className="grid grid-cols-2 gap-3">
          {nftProducts.map((product) => {
            const isSelected = selectedId === product.id

            return (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="text-left"
              >
                <Card
                  className={cn(
                    'overflow-hidden border-2 transition-all',
                    isSelected
                      ? 'border-chart-3 bg-chart-3/5'
                      : 'border-border bg-card hover:border-chart-3/30'
                  )}
                >
                  {/* NFT Image Placeholder */}
                  <div className="aspect-square bg-secondary flex items-center justify-center relative">
                    <Gift className="w-16 h-16 text-chart-3/50" />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-chart-3 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-background"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-foreground text-sm mb-1 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-chart-3">
                      {product.price.toLocaleString()} so{"'"}m
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
          className="w-full h-12 bg-chart-3 text-background hover:bg-chart-3/90 disabled:opacity-50"
        >
          <span>Davom etish</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
