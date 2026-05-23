'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/flightStore'
import { useUserStore } from '@/store/userStore'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { CheckCircle, Plane, ArrowLeft, Loader2 } from 'lucide-react'

export default function ConfirmPage() {
  const router = useRouter()
  const { selectedFlight, selectedSeat, passengerForm, resetBooking } = useFlightStore()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<{ pnr: string; bookingId: string } | null>(null)

  useEffect(() => {
    if (!selectedFlight || !selectedSeat || !user) router.push('/')
  }, [])

  const handleConfirm = async () => {
    if (!selectedFlight || !selectedSeat || !user) return
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const totalPrice = selectedFlight.base_price + selectedSeat.extra_fee

      const { data, error: rpcError } = await supabase.rpc('reserve_seat', {
        p_user_id: user.id,
        p_flight_id: selectedFlight.id,
        p_seat_id: selectedSeat.id,
        p_total_price: totalPrice,
        p_full_name: passengerForm.full_name,
        p_passport_no: passengerForm.passport_no,
        p_nationality: passengerForm.nationality,
        p_dob: passengerForm.dob,
      })

      if (rpcError) throw new Error(rpcError.message)

      setConfirmed({ pnr: data.pnr_code, bookingId: data.booking_id })
      resetBooking()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card animate-slide-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-8">Your flight has been successfully booked.</p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">PNR Code</p>
            <p className="text-4xl font-bold font-display text-sky-600 tracking-widest">{confirmed.pnr}</p>
            <p className="text-xs text-slate-400 mt-2">Save this code for check-in</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/my-bookings')} className="btn-primary flex-1">
              View My Bookings
            </button>
            <button onClick={() => router.push('/')} className="btn-secondary flex-1">
              Book Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalPrice = (selectedFlight?.base_price ?? 0) + (selectedSeat?.extra_fee ?? 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">Review & Confirm</h1>

      {/* Flight details */}
      <div className="card mb-4">
        <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Plane className="w-4 h-4 text-sky-500" /> Flight Details
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Flight</p>
            <p className="font-semibold">{selectedFlight?.flight_no}</p>
          </div>
          <div>
            <p className="text-slate-500">Route</p>
            <p className="font-semibold">{selectedFlight?.origin} → {selectedFlight?.destination}</p>
          </div>
          <div>
            <p className="text-slate-500">Departure</p>
            <p className="font-semibold">{selectedFlight && formatDateTime(selectedFlight.departs_at)}</p>
          </div>
          <div>
            <p className="text-slate-500">Seat</p>
            <p className="font-semibold">{selectedSeat?.seat_number} <span className="capitalize text-slate-500">({selectedSeat?.class})</span></p>
          </div>
        </div>
      </div>

      {/* Passenger details */}
      <div className="card mb-4">
        <h2 className="font-semibold text-slate-700 mb-4">Passenger Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-slate-500">Name</p><p className="font-semibold">{passengerForm.full_name}</p></div>
          <div><p className="text-slate-500">Passport</p><p className="font-semibold">{passengerForm.passport_no}</p></div>
          <div><p className="text-slate-500">Nationality</p><p className="font-semibold">{passengerForm.nationality}</p></div>
          <div><p className="text-slate-500">DOB</p><p className="font-semibold">{passengerForm.dob}</p></div>
        </div>
      </div>

      {/* Price */}
      <div className="card mb-6 bg-sky-50 border-sky-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Total Amount</p>
            <p className="text-3xl font-bold font-display text-sky-600">{formatCurrency(totalPrice)}</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>{selectedFlight?.base_price && formatCurrency(selectedFlight.base_price)} base</p>
            {(selectedSeat?.extra_fee ?? 0) > 0 && <p>+{formatCurrency(selectedSeat?.extra_fee ?? 0)} seat</p>}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">⚠️ {error}</div>
      )}

      <div className="flex gap-3">
        <button onClick={() => router.back()} className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</> : '✓ Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
