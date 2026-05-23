import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import type { BookingWithDetails } from '@/types'

interface UserStore {
  session: Session | null
  user: User | null
  cachedBookings: BookingWithDetails[]

  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  setCachedBookings: (bookings: BookingWithDetails[]) => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      cachedBookings: [],

      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),

      logout: () => set({ session: null, user: null, cachedBookings: [] }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      // Persist only session token, not full user profile or bookings
      partialize: (state) => ({
        session: state.session
          ? { access_token: state.session.access_token, refresh_token: state.session.refresh_token }
          : null,
        cachedBookings: state.cachedBookings,
      }),
    }
  )
)
