"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CreditCard, Upload, Wallet, Clock, CheckCircle, XCircle } from "lucide-react"
import useSWR, { mutate } from "swr"
import type { AdminCard, DepositRequest } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BalanceScreenProps {
  telegramId: string
  onBack: () => void
}

export function BalanceScreen({ telegramId, onBack }: BalanceScreenProps) {
  const [showTopUp, setShowTopUp] = useState(false)
  const [amount, setAmount] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { data: balanceData } = useSWR(`/api/balance?telegram_id=${telegramId}`, fetcher, { refreshInterval: 5000 })
  const { data: cards } = useSWR<AdminCard[]>("/api/admin/cards", fetcher)
  const { data: deposits } = useSWR<DepositRequest[]>(`/api/deposits?telegram_id=${telegramId}`, fetcher, { refreshInterval: 5000 })

  const activeCard = cards?.find((c) => c.is_active)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!amount || !receiptFile) return

    setIsSubmitting(true)

    try {
      // Upload receipt image (in production, use proper file upload)
      const formData = new FormData()
      formData.append("file", receiptFile)
      
      // For now, we'll use a placeholder URL
      const receiptUrl = URL.createObjectURL(receiptFile)

      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: telegramId,
          amount: Number.parseInt(amount),
          receipt_url: receiptUrl,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setAmount("")
        setReceiptFile(null)
        mutate(`/api/deposits?telegram_id=${telegramId}`)
      }
    } catch (error) {
      console.error("Error submitting deposit:", error)
    }

    setIsSubmitting(false)
  }

  const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Balans</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 pb-24">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-white/80">Joriy balans</span>
            </div>
            <div className="text-4xl font-bold mb-2">
              {(balanceData?.balance || 0).toLocaleString()} <span className="text-xl">so'm</span>
            </div>
            <div className="text-white/70 text-sm">
              Jami sarflangan: {(balanceData?.total_spent || 0).toLocaleString()} so'm
            </div>
          </CardContent>
        </Card>

        {!showTopUp ? (
          <>
            <Button className="w-full h-14 text-lg" onClick={() => setShowTopUp(true)}>
              <CreditCard className="mr-2 h-5 w-5" />
              Hisobni to'ldirish
            </Button>

            {/* Deposit History */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">To'lovlar tarixi</h2>
              {deposits && deposits.length > 0 ? (
                deposits.map((deposit) => (
                  <Card key={deposit.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {deposit.status === "pending" && <Clock className="h-5 w-5 text-yellow-500" />}
                          {deposit.status === "approved" && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {deposit.status === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                          <div>
                            <div className="font-semibold">{deposit.amount.toLocaleString()} so'm</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(deposit.created_at).toLocaleDateString("uz-UZ")}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            deposit.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : deposit.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {deposit.status === "pending" ? "Kutilmoqda" : deposit.status === "approved" ? "Tasdiqlandi" : "Rad etildi"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">To'lovlar tarixi yo'q</CardContent>
                </Card>
              )}
            </div>
          </>
        ) : submitted ? (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">So'rov yuborildi!</h2>
              <p className="text-muted-foreground">
                To'lov so'rovingiz admin tomonidan ko'rib chiqilmoqda. Tasdiqlangandan so'ng balansingizga qo'shiladi.
              </p>
              <Button
                onClick={() => {
                  setShowTopUp(false)
                  setSubmitted(false)
                }}
              >
                Orqaga qaytish
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setShowTopUp(false)} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Karta orqali to'lash
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCard ? (
                  <>
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="text-sm text-muted-foreground">To'lov kartasi</div>
                      <div className="text-2xl font-mono font-bold tracking-wider">
                        {activeCard.card_number.replace(/(\d{4})/g, "$1 ").trim()}
                      </div>
                      <div className="text-sm">
                        {activeCard.card_holder} • {activeCard.bank_name}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">To'lov miqdori</label>
                      <Input
                        type="number"
                        placeholder="Miqdorni kiriting"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        {quickAmounts.map((amt) => (
                          <Button key={amt} variant="outline" size="sm" onClick={() => setAmount(amt.toString())}>
                            {(amt / 1000).toFixed(0)}k
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chek rasmi</label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="receipt-upload"
                        />
                        <label htmlFor="receipt-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          {receiptFile ? (
                            <span className="text-green-600 font-medium">{receiptFile.name}</span>
                          ) : (
                            <span className="text-muted-foreground">Chek rasmini yuklang</span>
                          )}
                        </label>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12"
                      onClick={handleSubmit}
                      disabled={!amount || !receiptFile || isSubmitting}
                    >
                      {isSubmitting ? "Yuborilmoqda..." : "To'lov qildim"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Hozircha to'lov kartasi mavjud emas. Admin tomonidan qo'shilishini kuting.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
