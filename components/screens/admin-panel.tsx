"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  CreditCard,
  Package,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Check,
  X,
  ImageIcon,
  TrendingUp,
  Clock,
} from "lucide-react"
import useSWR, { mutate } from "swr"
import type { Product, AdminCard, DepositRequest, Stats } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("stats")

  const { data: stats } = useSWR<Stats>("/api/admin/stats", fetcher, { refreshInterval: 10000 })
  const { data: products } = useSWR<Product[]>("/api/products", fetcher)
  const { data: cards } = useSWR<AdminCard[]>("/api/admin/cards", fetcher)
  const { data: deposits } = useSWR<DepositRequest[]>("/api/deposits?status=pending", fetcher, { refreshInterval: 5000 })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full justify-start px-4 h-12 bg-transparent border-b rounded-none">
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary/10">
            <TrendingUp className="w-4 h-4 mr-1" /> Statistika
          </TabsTrigger>
          <TabsTrigger value="deposits" className="data-[state=active]:bg-primary/10">
            <Clock className="w-4 h-4 mr-1" /> To'lovlar
            {deposits && deposits.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{deposits.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="cards" className="data-[state=active]:bg-primary/10">
            <CreditCard className="w-4 h-4 mr-1" /> Kartalar
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-primary/10">
            <Package className="w-4 h-4 mr-1" /> Mahsulotlar
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 p-4 pb-24 overflow-auto">
          <TabsContent value="stats" className="mt-0 space-y-4">
            <StatsTab stats={stats} />
          </TabsContent>

          <TabsContent value="deposits" className="mt-0 space-y-4">
            <DepositsTab deposits={deposits || []} />
          </TabsContent>

          <TabsContent value="cards" className="mt-0 space-y-4">
            <CardsTab cards={cards || []} />
          </TabsContent>

          <TabsContent value="products" className="mt-0 space-y-4">
            <ProductsTab products={products || []} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function StatsTab({ stats }: { stats?: Stats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <Users className="h-8 w-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats?.total_users || 0}</div>
            <div className="text-sm opacity-80">Jami foydalanuvchilar</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-4">
            <Package className="h-8 w-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{stats?.total_orders || 0}</div>
            <div className="text-sm opacity-80">Jami buyurtmalar</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Daromadlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-muted-foreground">Bugun</span>
            <span className="font-bold text-green-600">{(stats?.revenue_today || 0).toLocaleString()} so'm</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-muted-foreground">Haftalik</span>
            <span className="font-bold text-green-600">{(stats?.weekly_revenue || 0).toLocaleString()} so'm</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-muted-foreground">Oylik</span>
            <span className="font-bold text-green-600">{(stats?.monthly_revenue || 0).toLocaleString()} so'm</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <span className="font-medium">Jami</span>
            <span className="font-bold text-primary text-lg">{(stats?.total_revenue || 0).toLocaleString()} so'm</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DepositsTab({ deposits }: { deposits: DepositRequest[] }) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleAction = async (depositId: string, status: "approved" | "rejected") => {
    setProcessing(depositId)
    try {
      await fetch("/api/deposits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deposit_id: depositId, status }),
      })
      mutate("/api/deposits?status=pending")
    } catch (error) {
      console.error("Failed to process deposit:", error)
    }
    setProcessing(null)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Kutilayotgan to'lovlar</h2>
      {deposits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Kutilayotgan to'lovlar yo'q</CardContent>
        </Card>
      ) : (
        deposits.map((deposit) => (
          <Card key={deposit.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">
                    @{(deposit.user as { username?: string; first_name?: string })?.username || (deposit.user as { first_name?: string })?.first_name || "Foydalanuvchi"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(deposit.created_at).toLocaleString("uz-UZ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">{deposit.amount.toLocaleString()} so'm</div>
                </div>
              </div>
              {deposit.receipt_url && (
                <div className="mb-3">
                  <a href={deposit.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Chekni ko'rish
                  </a>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction(deposit.id, "approved")}
                  disabled={processing === deposit.id}
                >
                  <Check className="w-4 h-4 mr-1" /> Tasdiqlash
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleAction(deposit.id, "rejected")}
                  disabled={processing === deposit.id}
                >
                  <X className="w-4 h-4 mr-1" /> Rad etish
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function CardsTab({ cards }: { cards: AdminCard[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [bankName, setBankName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!cardNumber || !cardHolder || !bankName) return
    setIsSubmitting(true)
    try {
      await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_number: cardNumber, card_holder: cardHolder, bank_name: bankName }),
      })
      setCardNumber("")
      setCardHolder("")
      setBankName("")
      setShowAdd(false)
      mutate("/api/admin/cards")
    } catch (error) {
      console.error("Failed to add card:", error)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Kartani o'chirmoqchimisiz?")) return
    await fetch(`/api/admin/cards?id=${id}`, { method: "DELETE" })
    mutate("/api/admin/cards")
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    })
    mutate("/api/admin/cards")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">To'lov kartalari</h2>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-1" /> Qo'shish
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>Karta raqami</Label>
              <Input placeholder="8600 1234 5678 9012" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </div>
            <div>
              <Label>Karta egasi</Label>
              <Input placeholder="ESHMATOV TOSHMAT" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
            </div>
            <div>
              <Label>Bank nomi</Label>
              <Input placeholder="Uzcard / Humo" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <Button onClick={handleAdd} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </CardContent>
        </Card>
      )}

      {cards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Kartalar qo'shilmagan</CardContent>
        </Card>
      ) : (
        cards.map((card) => (
          <Card key={card.id} className={!card.is_active ? "opacity-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-lg">{card.card_number.replace(/(\d{4})/g, "$1 ").trim()}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggle(card.id, card.is_active)}>
                    {card.is_active ? "O'chirish" : "Yoqish"}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(card.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {card.card_holder} - {card.bank_name}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function ProductsTab({ products }: { products: Product[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editImage, setEditImage] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({
    type: "nft" as "premium" | "stars" | "nft",
    name: "",
    price: "",
    image_url: "",
    description: "",
    duration_months: "",
    stars_amount: "",
  })

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditName(product.name)
    setEditPrice(product.price.toString())
    setEditImage(product.image_url || "")
  }

  const handleSave = async (id: string) => {
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: editName,
        price: Number.parseInt(editPrice),
        image_url: editImage || null,
      }),
    })
    setEditingId(null)
    mutate("/api/products")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return
    await fetch(`/api/products?id=${id}`, { method: "DELETE" })
    mutate("/api/products")
  }

  const handleAddProduct = async () => {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newProduct.type,
        name: newProduct.name,
        price: Number.parseInt(newProduct.price),
        image_url: newProduct.image_url || null,
        description: newProduct.description || null,
        duration_months: newProduct.duration_months ? Number.parseInt(newProduct.duration_months) : null,
        stars_amount: newProduct.stars_amount ? Number.parseInt(newProduct.stars_amount) : null,
      }),
    })
    setShowAdd(false)
    setNewProduct({ type: "nft", name: "", price: "", image_url: "", description: "", duration_months: "", stars_amount: "" })
    mutate("/api/products")
  }

  const groupedProducts = {
    premium: products.filter((p) => p.type === "premium"),
    stars: products.filter((p) => p.type === "stars"),
    nft: products.filter((p) => p.type === "nft"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mahsulotlar</h2>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-1" /> Qo'shish
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>Turi</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newProduct.type}
                onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as "premium" | "stars" | "nft" })}
              >
                <option value="premium">Premium</option>
                <option value="stars">Stars</option>
                <option value="nft">NFT</option>
              </select>
            </div>
            <div>
              <Label>Nomi</Label>
              <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            </div>
            <div>
              <Label>Narxi (so'm)</Label>
              <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
            </div>
            {newProduct.type === "nft" && (
              <div>
                <Label>Rasm URL</Label>
                <Input value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} />
              </div>
            )}
            {newProduct.type === "premium" && (
              <div>
                <Label>Muddat (oy)</Label>
                <Input type="number" value={newProduct.duration_months} onChange={(e) => setNewProduct({ ...newProduct, duration_months: e.target.value })} />
              </div>
            )}
            {newProduct.type === "stars" && (
              <div>
                <Label>Stars miqdori</Label>
                <Input type="number" value={newProduct.stars_amount} onChange={(e) => setNewProduct({ ...newProduct, stars_amount: e.target.value })} />
              </div>
            )}
            <Button onClick={handleAddProduct} className="w-full">
              Qo'shish
            </Button>
          </CardContent>
        </Card>
      )}

      {(["premium", "stars", "nft"] as const).map((type) => (
        <div key={type} className="space-y-3">
          <h3 className="font-semibold text-muted-foreground uppercase text-sm">
            {type === "premium" ? "Premium" : type === "stars" ? "Stars" : "NFT"}
          </h3>
          {groupedProducts[type].map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                {editingId === product.id ? (
                  <div className="space-y-3">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nomi" />
                    <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Narxi" />
                    {product.type === "nft" && (
                      <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="Rasm URL" />
                    )}
                    <div className="flex gap-2">
                      <Button onClick={() => handleSave(product.id)} className="flex-1">
                        Saqlash
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)} className="flex-1">
                        Bekor qilish
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.price.toLocaleString()} so'm</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        Tahrirlash
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
