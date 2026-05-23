'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import type { BookingWithDetails, Flight } from '@/types'
import { Plane, Clock, ChevronDown, ChevronUp, X, RefreshCw } from 'lucide-react'

interface BookingsListProps {
  initialBookings: BookingWithDetails[]
  userId: string
}

export function BookingsList({ initialBookings, userId }: BookingsListProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingWithDetails | null>(null)
  const [altFlights, setAltFlights] = useState<Flight[]>([])
  const [selectedNewFlight, setSelectedNewFlight] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleCancel = async () => {
    if (!cancelTarget) return
    setLoading(true)
    setError('')
    try {
      const { error: rpcError } = await supabase.rpc('cancel_booking', {
        p_booking_id: cancelTarget,
        p_user_id: userId,
      })
      if (rpcError) throw new Error(rpcError.message)
      setBookings(prev => prev.map(b => b.id === cancelTarget ? { ...b, status: 'cancelled' as const } : b))
      setCancelTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed')
    } finally {
      setLoading(false)
    }
  }

  const openReschedule = async (booking: BookingWithDetails) => {
    setRescheduleTarget(booking)
    setError('')
    const { data } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', booking.flights.origin)
      .eq('destination', booking.flights.destination)
      .neq('id', booking.flight_id)
      .neq('status', 'cancelled')
      .order('departs_at', { ascending: true })
    setAltFlights((data ?? []) as Flight[])
  }

  const handleReschedule = async () => {
    if (!rescheduleTarget || !selectedNewFlight) return
    setLoading(true)
    setError('')
    try {
      // Pick first available seat on new flight
      const { data: seat } = await supabase
        .from('seats')
        .select('id')
        .eq('flight_id', selectedNewFlight)
        .eq('is_available', true)
        .eq('class', rescheduleTarget.seats.class)
        .limit(1)
        .single()

      if (!seat) throw new Error('No available seat on the selected flight')

      const { error: rpcError } = await supabase.rpc('reschedule_booking', {
        p_booking_id: rescheduleTarget.id,
        p_user_id: userId,
        p_new_flight_id: selectedNewFlight,
        p_new_seat_id: seat.id,
      })
      if (rpcError) throw new Error(rpcError.message)
      router.refresh()
      setRescheduleTarget(null)
      setSelectedNewFlight('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reschedule failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="card overflow-hidden">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* PNR + status */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div>
                  <p className="text-xs text-slate-500">PNR</p>
                  <p className="font-display font-bold text-lg tracking-wider text-slate-900">{booking.pnr_code}</p>
                </div>
                <span className={cn(
                  'badge',
                  booking.status === 'confirmed' ? 'badge-confirmed' :
                  booking.status === 'rescheduled' ? 'badge-rescheduled' : 'badge-cancelled'
                )}>
                  {booking.status}
                </span>
              </div>

              {/* Route */}
              <div className="flex-1 flex items-center gap-4">
                <div className="text-center">
                  <p className="font-bold text-xl font-display">{booking.flights.origin}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(booking.flights.departs_at)}</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <Plane className="w-4 h-4 text-sky-400 rotate-90" />
                  <p className="text-xs text-slate-400">{booking.flights.flight_no}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-xl font-display">{booking.flights.destination}</p>
                  <p className="text-xs text-slate-500">Seat {booking.seats.seat_number}</p>
                </div>
              </div>

              {/* Price + actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className="font-bold text-sky-600 text-lg font-display">{formatCurrency(booking.total_price)}</p>
                <div className="flex gap-2">
                  {booking.status !== 'cancelled' && (
                    <>
                      <button onClick={() => openReschedule(booking)}
                        className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Reschedule">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button onClick={() => setCancelTarget(booking.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    {expandedId === booking.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {expandedId === booking.id && (
              <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {booking.passengers.map((p) => (
                    <div key={p.id} className="md:col-span-2">
                      <p className="text-slate-500 text-xs mb-1">Passenger</p>
                      <p className="font-semibold">{p.full_name}</p>
                      <p className="text-slate-500">{p.nationality}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Class</p>
                    <p className="font-semibold capitalize">{booking.seats.class}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Aircraft</p>
                    <p className="font-semibold">{booking.flights.aircraft_type}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Booked at</p>
                    <p className="font-semibold">{formatDateTime(booking.booked_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cancel dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone. Cancellations within 2 hours of departure are not permitted."
        confirmLabel="Yes, Cancel"
        onConfirm={handleCancel}
        onCancel={() => { setCancelTarget(null); setError('') }}
        loading={loading}
      />

      {/* Reschedule dialog */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRescheduleTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-1">Reschedule Flight</h3>
            <p className="text-sm text-slate-500 mb-4">
              {rescheduleTarget.flights.origin} → {rescheduleTarget.flights.destination}
            </p>

            {altFlights.length > 0 ? (
              <select value={selectedNewFlight} onChange={e => setSelectedNewFlight(e.target.value)}
                className="input-field mb-4">
                <option value="">Select new flight</option>
                {altFlights.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.flight_no} · {formatDateTime(f.departs_at)} · {formatCurrency(f.base_price)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-slate-500 mb-4">No alternative flights available on this route.</p>
            )}

            {error && <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setRescheduleTarget(null); setError('') }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReschedule} disabled={!selectedNewFlight || loading} className="btn-primary flex-1">
                {loading ? 'Processing…' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
