import Link from 'next/link'
import { Plane } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Plane className="w-10 h-10 text-sky-400 rotate-45" />
        </div>
        <h1 className="font-display text-6xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="font-display text-xl font-semibold text-slate-700 mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8">Looks like this flight route doesn't exist.</p>
        <Link href="/" className="btn-primary inline-flex">Back to Home</Link>
      </div>
    </div>
  )
}
