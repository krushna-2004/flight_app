import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">You&apos;re offline</h1>
        <p className="text-slate-500 mb-6">
          No internet connection detected. Your cached bookings are still available.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/my-bookings" className="btn-primary">View Cached Bookings</Link>
          <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
        </div>
      </div>
    </div>
  )
}
