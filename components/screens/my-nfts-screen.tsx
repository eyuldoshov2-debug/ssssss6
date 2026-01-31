'use client'

import { Card } from '@/components/ui/card'
import { ArrowLeft, Gift } from 'lucide-react'
import type { UserNFT } from '@/lib/types'

interface MyNFTsScreenProps {
  nfts: UserNFT[]
  onBack: () => void
}

export function MyNFTsScreen({ nfts, onBack }: MyNFTsScreenProps) {
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
          <h1 className="text-lg font-semibold text-foreground">Mening NFT{"'"}larim</h1>
        </div>
      </div>

      {/* NFTs Grid */}
      <div className="p-4">
        {nfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-chart-3/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-chart-3" />
            </div>
            <p className="text-muted-foreground mb-2">NFT topilmadi</p>
            <p className="text-sm text-muted-foreground">
              NFT sotib oling va bu yerda ko{"'"}ring
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {nfts.map((nft) => (
              <Card key={nft.id} className="overflow-hidden bg-card border-border">
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  {nft.nft_image ? (
                    <img
                      src={nft.nft_image || "/placeholder.svg"}
                      alt={nft.nft_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gift className="w-12 h-12 text-chart-3/50" />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-foreground text-sm truncate">
                    {nft.nft_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(nft.purchase_date).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
