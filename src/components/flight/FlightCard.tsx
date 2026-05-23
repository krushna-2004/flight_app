'use client'

import { useRouter } from 'next/navigation'
import { Plane, Clock, ChevronRight } from 'lucide-react'
import { useFlightStore } from '@/store/flightStore'
import { formatTime, formatCurrency, getFlightDuration, cn } from '@/lib/utils'
import type { Flight } from '@/types'

interface FlightCardProps {
  flight: Flight
}

export function FlightCard({ flight }: FlightCardProps) {
  const router = useRouter()
  const { setSelectedFlight, setBookingStep } = useFlightStore()

  const handleSelect = () => {
    setSelectedFlight(flight)
    setBookingStep('seat-select')
    router.push(`/booking/seat-select?flightId=${flight.id}`)
  }

  const statusColor = {
    scheduled: 'badge-scheduled',
    delayed: 'badge-rescheduled',
    cancelled: 'badge-cancelled',
    completed: 'badge bg-slate-100 text-slate-600',
  }[flight.status]

  return (
    <div className="card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Airline/flight info */}
        <div className="flex items-center gap-3 md:w-32 flex-shrink-0">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <Plane className="w-5 h-5 text-sky-600 rotate-45" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">{flight.flight_no}</p>
            <p className="text-xs text-slate-500">{flight.aircraft_type}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex-1 flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold font-display text-slate-900">{formatTime(flight.departs_at)}</p>
            <p className="text-sm text-slate-500 font-medium">{flight.origin}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {getFlightDuration(flight.departs_at, flight.arrives_at)}
            </div>
            <div className="w-full flex items-center">
              <div className="flex-1 border-t border-dashed border-slate-300" />
              <Plane className="w-3.5 h-3.5 text-sky-400 rotate-90 mx-1" />
              <div className="flex-1 border-t border-dashed border-slate-300" />
            </div>
            <span className={cn('text-xs', statusColor)}>{flight.status}</span>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold font-display text-slate-900">{formatTime(flight.arrives_at)}</p>
            <p className="text-sm text-slate-500 font-medium">{flight.destination}</p>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:w-40 flex-shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="text-right">
            <p className="text-xs text-slate-500">from</p>
            <p className="text-2xl font-bold font-display text-sky-600">{formatCurrency(flight.base_price)}</p>
          </div>
          <button
            onClick={handleSelect}
            disabled={flight.status === 'cancelled'}
            className="btn-primary flex items-center gap-1 !py-2 !px-4 text-sm disabled:opacity-40"
          >
            Select <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
