'use client'

import { create } from 'zustand'
import type { User, Product, Order } from './types'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  isOnboarded: boolean
  setIsOnboarded: (value: boolean) => void
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  cart: { product: Product; quantity: number; recipientUsername?: string }[]
  addToCart: (product: Product, quantity?: number, recipientUsername?: string) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  orders: Order[]
  setOrders: (orders: Order[]) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isOnboarded: false,
  setIsOnboarded: (value) => set({ isOnboarded: value }),
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  cart: [],
  addToCart: (product, quantity = 1, recipientUsername) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id)
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }
      }
      return { cart: [...state.cart, { product, quantity, recipientUsername }] }
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),
  clearCart: () => set({ cart: [] }),
  orders: [],
  setOrders: (orders) => set({ orders }),
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
