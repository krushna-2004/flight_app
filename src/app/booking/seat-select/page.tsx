import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SeatMap } from '@/components/seat/SeatMap'
import { SeatSelectionClient } from '@/components/seat/SeatSelectionClient'
import type { Seat, Flight } from '@/types'
import { formatCurrency, formatTime, getFlightDuration } from '@/lib/utils'
import { Plane, Clock } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ flightId?: string }>
}

export default async function SeatSelectPage({ searchParams }: PageProps) {
  const { flightId } = await searchParams
  if (!flightId) redirect('/flights')

  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/booking/seat-select?flightId=${flightId}`)

  const [{ data: flight }, { data: seats }] = await Promise.all([
    supabase.from('flights').select('*').eq('id', flightId).single(),
    supabase.from('seats').select('*').eq('flight_id', flightId).order('seat_number'),
  ])

  if (!flight) redirect('/flights')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Flight summary header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-sky-600 rotate-45" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{flight.flight_no}</p>
              <p className="text-sm text-slate-500">{flight.aircraft_type}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold font-display">{formatTime(flight.departs_at)}</p>
              <p className="text-sm text-slate-500">{flight.origin}</p>
            </div>
            <div className="text-slate-400 flex items-center gap-1 text-sm">
              <Clock className="w-3.5 h-3.5" />
              {getFlightDuration(flight.departs_at, flight.arrives_at)}
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{formatTime(flight.arrives_at)}</p>
              <p className="text-sm text-slate-500">{flight.destination}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">Base price</p>
            <p className="text-xl font-bold text-sky-600 font-display">{formatCurrency(flight.base_price)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat map */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="font-display font-bold text-lg text-slate-900 mb-6">Select Your Seat</h2>
            <SeatMap flightId={flightId} initialSeats={(seats ?? []) as Seat[]} />
          </div>
        </div>

        {/* Sidebar — selected seat info + CTA */}
        <div className="lg:col-span-1">
          <SeatSelectionClient flight={flight as Flight} />
        </div>
      </div>
    </div>
  )
}
