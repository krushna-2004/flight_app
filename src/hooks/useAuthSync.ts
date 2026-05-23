'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'

/**
 * Call this once in a top-level client component (e.g. layout or Providers)
 * to keep the Zustand user store in sync with Supabase auth state.
 */
export function useAuthSync() {
  const { setSession, setUser, logout } = useUserStore()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setSession(session); setUser(session.user) }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) { setSession(session); setUser(session.user) }
      else logout()
    })

    return () => subscription.unsubscribe()
  }, [])
}
