'use client'

import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/flightStore'
import { formatCurrency, cn } from '@/lib/utils'
import type { Flight } from '@/types'
import { CheckCircle, ArrowRight } from 'lucide-react'

interface SeatSelectionClientProps {
  flight: Flight
}

export function SeatSelectionClient({ flight }: SeatSelectionClientProps) {
  const router = useRouter()
  const { selectedSeat } = useFlightStore()

  const totalPrice = flight.base_price + (selectedSeat?.extra_fee ?? 0)

  return (
    <div className="card sticky top-24">
      <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Booking Summary</h3>

      {selectedSeat ? (
        <div className="space-y-3 mb-6 animate-fade-in">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-sky-700">Seat Selected</span>
            </div>
            <p className="text-3xl font-bold font-display text-slate-900">{selectedSeat.seat_number}</p>
            <p className="text-sm text-slate-500 capitalize mt-1">{selectedSeat.class} class</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Base fare</span>
              <span className="font-medium">{formatCurrency(flight.base_price)}</span>
            </div>
            {selectedSeat.extra_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Seat upgrade</span>
                <span className="font-medium">+{formatCurrency(selectedSeat.extra_fee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-base">
              <span>Total</span>
              <span className="text-sky-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm mb-6">
          <p>Select a seat from the map to continue</p>
        </div>
      )}

      <button
        disabled={!selectedSeat}
        onClick={() => router.push('/booking/passenger-details')}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
