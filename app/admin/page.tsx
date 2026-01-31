'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Crown,
  Star,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Bell,
  Send,
  Search,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order, User, Stats, Notification } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Tab = 'dashboard' | 'orders' | 'users' | 'notifications'

const statusConfig = {
  pending: { label: 'Kutilmoqda', icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
  processing: { label: 'Jarayonda', icon: Loader2, color: 'text-primary', bg: 'bg-primary/10' },
  completed: { label: 'Bajarildi', icon: CheckCircle2, color: 'text-chart-4', bg: 'bg-chart-4/10' },
  cancelled: { label: 'Bekor qilindi', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  refunded: { label: 'Qaytarildi', icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted' },
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [orderFilter, setOrderFilter] = useState<string>('')
  const [userSearch, setUserSearch] = useState('')
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', image_url: '' })
  const [isSending, setIsSending] = useState(false)

  // Fetch data
  const { data: stats } = useSWR<Stats>('/api/admin/stats', fetcher, { refreshInterval: 30000 })
  const { data: orders = [], isLoading: ordersLoading } = useSWR<Order[]>(
    `/api/admin/orders${orderFilter ? `?status=${orderFilter}` : ''}`,
    fetcher
  )
  const { data: users = [] } = useSWR<User[]>(
    `/api/admin/users${userSearch ? `?search=${userSearch}` : ''}`,
    fetcher
  )
  const { data: notifications = [] } = useSWR<Notification[]>('/api/admin/notifications', fetcher)

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status }),
    })
    mutate(`/api/admin/orders${orderFilter ? `?status=${orderFilter}` : ''}`)
  }

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) return
    setIsSending(true)

    await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationForm),
    })

    setNotificationForm({ title: '', message: '', image_url: '' })
    setIsSending(false)
    mutate('/api/admin/notifications')
  }

  const handleSendToTelegram = async (notificationId: string) => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notification_id: notificationId,
        is_sent: true,
        send_to_telegram: true,
      }),
    })
    mutate('/api/admin/notifications')
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: TrendingUp },
    { id: 'orders' as Tab, label: 'Buyurtmalar', icon: ShoppingBag },
    { id: 'users' as Tab, label: 'Foydalanuvchilar', icon: Users },
    { id: 'notifications' as Tab, label: 'Bildirishnomalar', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">ArzonStar Admin</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate('/api/admin/stats')}
              className="border-border text-foreground bg-transparent hover:bg-secondary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yangilash
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.total_users.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Foydalanuvchilar</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.total_orders.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Buyurtmalar</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {(stats?.total_revenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Jami daromad (so{"'"}m)</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.orders_today || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Bugungi buyurtmalar</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Today's Revenue */}
            <Card className="p-6 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-4">Bugungi daromad</h3>
              <p className="text-4xl font-bold text-primary">
                {(stats?.revenue_today || 0).toLocaleString()} so{"'"}m
              </p>
            </Card>

            {/* Recent Orders */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-4">So{"'"}nggi buyurtmalar</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => {
                  const status = statusConfig[order.status]
                  const StatusIcon = status.icon
                  const ProductIcon =
                    order.product?.type === 'premium' ? Crown : order.product?.type === 'stars' ? Star : Gift

                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-3">
                        <ProductIcon className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {order.product?.name || 'Mahsulot'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{order.user?.username || 'unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {order.total_price.toLocaleString()} so{"'"}m
                        </p>
                        <div className={cn('inline-flex items-center gap-1 text-xs', status.color)}>
                          <StatusIcon className={cn('w-3 h-3', order.status === 'processing' && 'animate-spin')} />
                          {status.label}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {['', 'pending', 'processing', 'completed', 'cancelled'].map((filter) => (
                <Button
                  key={filter}
                  variant={orderFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderFilter(filter)}
                  className={cn(
                    orderFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'border-border text-foreground bg-transparent hover:bg-secondary'
                  )}
                >
                  {filter === '' ? 'Barchasi' : statusConfig[filter as keyof typeof statusConfig]?.label}
                </Button>
              ))}
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const status = statusConfig[order.status]
                  const StatusIcon = status.icon
                  const ProductIcon =
                    order.product?.type === 'premium' ? Crown : order.product?.type === 'stars' ? Star : Gift

                  return (
                    <Card key={order.id} className="p-4 bg-card border-border">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                          <ProductIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-medium text-foreground">{order.product?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                #{order.id.slice(0, 8).toUpperCase()} • @{order.user?.username || 'unknown'}
                              </p>
                            </div>
                            <p className="font-semibold text-foreground whitespace-nowrap">
                              {order.total_price.toLocaleString()} so{"'"}m
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', status.bg, status.color)}>
                              <StatusIcon className={cn('w-3 h-3', order.status === 'processing' && 'animate-spin')} />
                              {status.label}
                            </div>
                            <div className="flex gap-2">
                              {order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                  Qabul qilish
                                </Button>
                              )}
                              {order.status === 'processing' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                  className="bg-chart-4 text-background hover:bg-chart-4/90"
                                >
                                  Yakunlash
                                </Button>
                              )}
                              {(order.status === 'pending' || order.status === 'processing') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  className="border-destructive text-destructive bg-transparent hover:bg-destructive/10"
                                >
                                  Bekor qilish
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Foydalanuvchi qidirish..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id} className="p-4 bg-card border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {user.photo_url ? (
                        <img src={user.photo_url || "/placeholder.svg"} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">@{user.username || 'no_username'}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {user.telegram_id} • {new Date(user.created_at).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    {user.is_admin && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Admin
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Create Notification */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-4">Yangi bildirishnoma</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-foreground">Sarlavha</Label>
                  <Input
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    placeholder="Bildirishnoma sarlavhasi"
                    className="mt-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-foreground">Xabar</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    placeholder="Bildirishnoma matni"
                    rows={4}
                    className="mt-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="image" className="text-foreground">Rasm URL (ixtiyoriy)</Label>
                  <Input
                    id="image"
                    value={notificationForm.image_url}
                    onChange={(e) => setNotificationForm({ ...notificationForm, image_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  onClick={handleSendNotification}
                  disabled={!notificationForm.title || !notificationForm.message || isSending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Yuborish
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Notifications History */}
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-4">Bildirishnomalar tarixi</h3>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Bildirishnomalar yo{"'"}q
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-3 rounded-lg bg-secondary">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-foreground">{notification.title}</p>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            notification.is_sent ? 'bg-chart-4/10 text-chart-4' : 'bg-accent/10 text-accent'
                          )}
                        >
                          {notification.is_sent ? 'Yuborilgan' : 'Kutilmoqda'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString('uz-UZ')}
                        </p>
                        {!notification.is_sent && (
                          <Button
                            size="sm"
                            onClick={() => handleSendToTelegram(notification.id)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Telegramga yuborish
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
