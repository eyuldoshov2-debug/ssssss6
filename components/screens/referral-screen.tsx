"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Users, Gift, Copy, Check, UserPlus } from "lucide-react"
import useSWR from "swr"
import type { Referral } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ReferralScreenProps {
  telegramId: string
  onBack: () => void
}

export function ReferralScreen({ telegramId, onBack }: ReferralScreenProps) {
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const { data, mutate } = useSWR(`/api/referrals?telegram_id=${telegramId}`, fetcher)

  const referralLink = data?.referral_code ? `https://t.me/ArzonStarBot?start=${data.referral_code}` : ""

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitReferral = async () => {
    if (!referralCode) return

    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: telegramId,
          referral_code: referralCode,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("Referal kodi muvaffaqiyatli qo'shildi!")
        setReferralCode("")
        mutate()
      } else {
        setMessage(result.error || "Xatolik yuz berdi")
      }
    } catch {
      setMessage("Xatolik yuz berdi")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Referal dasturi</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">{data?.referral_count || 0}</div>
              <div className="text-sm opacity-80">Taklif qilinganlar</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">{(data?.total_bonus || 0).toLocaleString()}</div>
              <div className="text-sm opacity-80">Jami bonus (so'm)</div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <Gift className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">2% bonus oling!</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Do'stlaringizni taklif qiling va ular xarid qilganda 2% bonus oling!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sizning referal havolangiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button onClick={handleCopy} variant="outline" className="shrink-0 bg-transparent">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Ushbu havolani do'stlaringiz bilan ulashing</p>
          </CardContent>
        </Card>

        {/* Enter Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Referal kodini kiriting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Referal kodini kiriting"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            <Button onClick={handleSubmitReferral} disabled={!referralCode || isSubmitting} className="w-full">
              {isSubmitting ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </Button>
            {message && (
              <p className={`text-sm ${message.includes("muvaffaqiyatli") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Referrals List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Taklif qilinganlar</h2>
          {data?.referrals && data.referrals.length > 0 ? (
            data.referrals.map((referral: Referral & { referred_user?: { username?: string; first_name?: string; total_spent?: number } }) => (
              <Card key={referral.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {(referral.referred_user?.username || referral.referred_user?.first_name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">
                          @{referral.referred_user?.username || referral.referred_user?.first_name || "Foydalanuvchi"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sarflagan: {(referral.referred_user?.total_spent || 0).toLocaleString()} so'm
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+{referral.bonus_earned.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">bonus</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Hali hech kim taklif qilinmagan
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
