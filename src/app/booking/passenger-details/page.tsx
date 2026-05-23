'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFlightStore } from '@/store/flightStore'
import { useUserStore } from '@/store/userStore'
import { formatCurrency, formatTime, NATIONALITIES, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, User } from 'lucide-react'

export default function PassengerDetailsPage() {
  const router = useRouter()
  const { selectedFlight, selectedSeat, passengerForm, setPassengerForm } = useFlightStore()
  const { user } = useUserStore()

  // Load user from Supabase on mount if not in store
  useEffect(() => {
    if (!user) {
      createClient().auth.getUser().then(({ data }) => {
        if (!data.user) router.push('/auth/login?redirectTo=/booking/passenger-details')
      })
    }
    if (!selectedFlight || !selectedSeat) router.push('/')
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/booking/confirm')
  }

  const totalPrice = (selectedFlight?.base_price ?? 0) + (selectedSeat?.extra_fee ?? 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {['Seat', 'Passenger', 'Confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
              i < 1 ? 'bg-sky-500 text-white' : i === 1 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500')}>
              {i + 1}
            </div>
            <span className={i === 1 ? 'text-slate-900 font-medium' : 'text-slate-400'}>{s}</span>
            {i < 2 && <div className="w-6 border-t border-slate-200" />}
          </div>
        ))}
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-slate-900">Passenger Details</h1>
            <p className="text-sm text-slate-500">
              {selectedFlight?.origin} → {selectedFlight?.destination} · {selectedFlight && formatTime(selectedFlight.departs_at)} · Seat {selectedSeat?.seat_number}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Full Name (as in passport)</label>
            <input
              type="text"
              required
              value={passengerForm.full_name}
              onChange={(e) => setPassengerForm({ full_name: e.target.value })}
              className="input-field"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="label">Passport Number</label>
            <input
              type="text"
              required
              value={passengerForm.passport_no}
              onChange={(e) => setPassengerForm({ passport_no: e.target.value })}
              className="input-field"
              placeholder="A1234567"
            />
            <p className="text-xs text-slate-400 mt-1">🔒 Not stored locally for your security</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nationality</label>
              <select
                required
                value={passengerForm.nationality}
                onChange={(e) => setPassengerForm({ nationality: e.target.value })}
                className="input-field appearance-none"
              >
                <option value="">Select</option>
                {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                required
                value={passengerForm.dob}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPassengerForm({ dob: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Price summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Base fare</span>
              <span>{formatCurrency(selectedFlight?.base_price ?? 0)}</span>
            </div>
            {(selectedSeat?.extra_fee ?? 0) > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Seat ({selectedSeat?.class})</span>
                <span>+{formatCurrency(selectedSeat?.extra_fee ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-slate-200 pt-2 mt-2">
              <span>Total</span>
              <span className="text-sky-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              Review Booking <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
