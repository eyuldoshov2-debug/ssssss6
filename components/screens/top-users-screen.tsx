"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react"
import useSWR from "swr"
import type { TopUser } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TopUsersScreenProps {
  onBack: () => void
}

export function TopUsersScreen({ onBack }: TopUsersScreenProps) {
  const { data: users } = useSWR<TopUser[]>("/api/top-users", fetcher)

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{index + 1}</span>
  }

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
    if (index === 1) return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
    if (index === 2) return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
    return ""
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Top 30 foydalanuvchilar</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 pb-24">
        {/* Top 3 Podium */}
        {users && users.length >= 3 && (
          <div className="flex items-end justify-center gap-2 mb-6 pt-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                {users[1].photo_url ? (
                  <img src={users[1].photo_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  (users[1].username || users[1].first_name || "U")[0].toUpperCase()
                )}
              </div>
              <div className="mt-2 text-center">
                <Medal className="h-6 w-6 text-gray-400 mx-auto" />
                <div className="text-sm font-medium truncate max-w-[80px]">
                  @{users[1].username || users[1].first_name || "User"}
                </div>
                <div className="text-xs text-muted-foreground">{users[1].total_spent.toLocaleString()}</div>
              </div>
              <div className="w-20 h-16 bg-gray-200 rounded-t-lg mt-2" />
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-4 ring-yellow-300">
                {users[0].photo_url ? (
                  <img src={users[0].photo_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  (users[0].username || users[0].first_name || "U")[0].toUpperCase()
                )}
              </div>
              <div className="mt-2 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
                <div className="text-sm font-bold truncate max-w-[100px]">
                  @{users[0].username || users[0].first_name || "User"}
                </div>
                <div className="text-xs font-semibold text-yellow-600">{users[0].total_spent.toLocaleString()} so'm</div>
              </div>
              <div className="w-24 h-24 bg-yellow-200 rounded-t-lg mt-2" />
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                {users[2].photo_url ? (
                  <img src={users[2].photo_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                ) : (
                  (users[2].username || users[2].first_name || "U")[0].toUpperCase()
                )}
              </div>
              <div className="mt-2 text-center">
                <Award className="h-5 w-5 text-amber-600 mx-auto" />
                <div className="text-sm font-medium truncate max-w-[80px]">
                  @{users[2].username || users[2].first_name || "User"}
                </div>
                <div className="text-xs text-muted-foreground">{users[2].total_spent.toLocaleString()}</div>
              </div>
              <div className="w-16 h-12 bg-amber-200 rounded-t-lg mt-2" />
            </div>
          </div>
        )}

        {/* Rest of the list */}
        {users && users.length > 3 ? (
          users.slice(3).map((user, index) => (
            <Card key={user.id} className={getRankBg(index + 3)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {getRankIcon(index + 3)}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {user.photo_url ? (
                      <img src={user.photo_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (user.username || user.first_name || "U")[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">@{user.username || user.first_name || "Foydalanuvchi"}</div>
                    <div className="text-sm text-muted-foreground">ID: {user.telegram_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{user.total_spent.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">so'm</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : users && users.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">Hali hech kim xarid qilmagan</CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
