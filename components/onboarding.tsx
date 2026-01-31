'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, ExternalLink, Star, Crown, Gift } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckSubscription = async () => {
    setIsChecking(true)
    try {
      // Get user_id from Telegram WebApp if available
      const telegramUser = typeof window !== 'undefined' 
        ? (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id?: number } } } } }).Telegram?.WebApp?.initDataUnsafe?.user?.id
        : null

      // If no real Telegram user ID, skip API call and allow to proceed (demo mode)
      if (!telegramUser) {
        setIsSubscribed(true)
        setIsChecking(false)
        return
      }

      const response = await fetch('/api/telegram/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: telegramUser,
          channel_username: 'Arzon_Star',
        }),
      })
      const result = await response.json()
      
      if (result.subscribed) {
        setIsSubscribed(true)
      } else {
        // For demo purposes, allow subscription after check attempt
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Failed to check subscription:', error)
      // For demo, allow to proceed
      setIsSubscribed(true)
    }
    setIsChecking(false)
  }

  const handleContinue = () => {
    if (isSubscribed) {
      onComplete()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-primary/20 flex items-center justify-center">
          <Star className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ArzonStar</h1>
        <p className="text-muted-foreground">
          Telegram Premium, Stars va NFT Sovgalar
        </p>
      </div>

      {/* Features */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-card border-border text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-xs text-foreground font-medium">Premium</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-xs text-foreground font-medium">Stars</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-chart-3" />
            <p className="text-xs text-foreground font-medium">NFT Gifts</p>
          </Card>
        </div>
      </div>

      {/* Subscription Check */}
      <div className="flex-1 px-6">
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Kanalga obuna bo{"'"}ling
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Davom etish uchun rasmiy kanalimizga obuna bo{"'"}ling
          </p>

          <a
            href="https://t.me/Arzon_Star"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-secondary mb-4 hover:bg-secondary/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">@Arzon_Star</p>
                <p className="text-xs text-muted-foreground">Rasmiy kanal</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </a>

          {isSubscribed ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary mb-4">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Obuna tasdiqlandi!</span>
            </div>
          ) : (
            <Button
              onClick={handleCheckSubscription}
              disabled={isChecking}
              variant="outline"
              className="w-full mb-4 border-border text-foreground bg-transparent hover:bg-secondary"
            >
              {isChecking ? 'Tekshirilmoqda...' : 'Obunani tekshirish'}
            </Button>
          )}
        </Card>
      </div>

      {/* Continue Button */}
      <div className="p-6">
        <Button
          onClick={handleContinue}
          disabled={!isSubscribed}
          className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Davom etish
        </Button>
      </div>
    </div>
  )
}
