'use client'

import { createContext, useContext } from 'react'
import type { User } from '@/lib/api'

export interface UserContextValue {
  user: User
  updateUser: (user: User) => void
}

export const UserContext = createContext<UserContextValue | null>(null)

export function useUser(): User {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside the dashboard')
  return ctx.user
}

export function useUpdateUser(): (user: User) => void {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUpdateUser must be used inside the dashboard')
  return ctx.updateUser
}
