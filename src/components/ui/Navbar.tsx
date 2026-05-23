'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plane, Menu, X, LogOut, User, Ticket } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import { useFlightStore } from '@/store/flightStore'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useUserStore()
  const { resetAll } = useFlightStore()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    logout()
    resetAll()
    router.push('/')
    setMobileOpen(false)
  }

  const navLinks = [
    { href: '/', label: 'Search Flights', icon: Plane },
    { href: '/my-bookings', label: 'My Bookings', icon: Ticket },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center group-hover:bg-sky-600 transition-colors">
            <Plane className="w-4 h-4 text-white rotate-45" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900">SkyBook</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors',
                pathname === l.href ? 'text-sky-600' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-sky-600" />
                </div>
                <span className="font-medium truncate max-w-32">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
              <Link href="/auth/register" className="btn-primary text-sm !py-2 !px-4">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 animate-fade-in">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700">
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="flex gap-3">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-sm text-slate-600">Sign in</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm !py-2 !px-4">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
