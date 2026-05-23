import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-sky-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
        <p className="text-slate-500 mb-6">We sent a confirmation link to your inbox. Click it to activate your account.</p>
        <Link href="/auth/login" className="btn-secondary inline-flex">Back to Login</Link>
      </div>
    </div>
  )
}
