'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/flightStore'
import { formatCurrency, cn } from '@/lib/utils'
import type { Seat, SeatClass } from '@/types'

interface SeatMapProps {
  flightId: string
  initialSeats: Seat[]
}

const CLASS_ORDER: SeatClass[] = ['first', 'business', 'economy']
const CLASS_LABELS: Record<SeatClass, string> = {
  first: '✦ First Class',
  business: '◆ Business',
  economy: '● Economy',
}
const CLASS_COLORS: Record<SeatClass, string> = {
  first: 'bg-amber-500',
  business: 'bg-sky-500',
  economy: 'bg-slate-400',
}

function groupByRow(seats: Seat[]) {
  const rows: Record<string, Seat[]> = {}
  for (const seat of seats) {
    const row = seat.seat_number.match(/\d+/)?.[0] ?? '0'
    if (!rows[row]) rows[row] = []
    rows[row].push(seat)
  }
  return rows
}

export function SeatMap({ flightId, initialSeats }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const { selectedSeat, setSelectedSeat } = useFlightStore()
  const supabase = createClient()

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`seats-${flightId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'seats', filter: `flight_id=eq.${flightId}` },
        (payload) => {
          setSeats((prev) =>
            prev.map((s) => (s.id === payload.new.id ? (payload.new as Seat) : s))
          )
          // Deselect if seat was taken by someone else
          if (selectedSeat?.id === payload.new.id && !payload.new.is_available) {
            setSelectedSeat(null)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [flightId, selectedSeat])

  const handleSeatClick = useCallback((seat: Seat) => {
    if (!seat.is_available) return
    // Optimistic selection
    setSelectedSeat(seat.id === selectedSeat?.id ? null : seat)
  }, [selectedSeat, setSelectedSeat])

  const seatsByClass = CLASS_ORDER.map((cls) => ({
    cls,
    rows: groupByRow(seats.filter((s) => s.class === cls)),
  }))

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { label: 'Available', color: 'bg-white border-2 border-slate-300' },
          { label: 'Selected', color: 'bg-sky-500 border-2 border-sky-600' },
          { label: 'Occupied', color: 'bg-slate-200 border-2 border-slate-300' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn('w-5 h-5 rounded', color)} />
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Seat map — scrollable */}
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-2xl bg-slate-50 border border-slate-200 p-4">
        <div className="min-w-[340px]">
          {seatsByClass.map(({ cls, rows }) => (
            <div key={cls} className="mb-8 last:mb-0">
              {/* Class header */}
              <div className={cn('text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-4 inline-flex items-center gap-2', CLASS_COLORS[cls])}>
                {CLASS_LABELS[cls]}
                {seats.find(s => s.class === cls) &&
                  <span className="opacity-80">
                    +{formatCurrency(seats.find(s => s.class === cls)!.extra_fee)}
                  </span>
                }
              </div>

              {/* Rows */}
              {Object.entries(rows)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([rowNum, rowSeats]) => {
                  const sorted = [...rowSeats].sort((a, b) =>
                    a.seat_number.localeCompare(b.seat_number)
                  )
                  // Split into left (A-C) and right (D-F)
                  const left = sorted.filter(s => /[ABC]$/.test(s.seat_number))
                  const right = sorted.filter(s => /[DEF]$/.test(s.seat_number))

                  return (
                    <div key={rowNum} className="flex items-center gap-2 mb-2">
                      <span className="w-6 text-center text-xs text-slate-400 font-mono flex-shrink-0">{rowNum}</span>
                      <div className="flex gap-1">
                        {left.map(seat => <SeatButton key={seat.id} seat={seat} selected={selectedSeat?.id === seat.id} onSelect={handleSeatClick} />)}
                      </div>
                      <div className="w-6 flex-shrink-0" /> {/* Aisle */}
                      <div className="flex gap-1">
                        {right.map(seat => <SeatButton key={seat.id} seat={seat} selected={selectedSeat?.id === seat.id} onSelect={handleSeatClick} />)}
                      </div>
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface SeatButtonProps {
  seat: Seat
  selected: boolean
  onSelect: (seat: Seat) => void
}

function SeatButton({ seat, selected, onSelect }: SeatButtonProps) {
  const isOccupied = !seat.is_available

  return (
    <div className="relative group">
      <button
        disabled={isOccupied}
        onClick={() => onSelect(seat)}
        aria-label={`Seat ${seat.seat_number} — ${seat.class}${isOccupied ? ' (occupied)' : ''}`}
        className={cn(
          'w-8 h-8 rounded-t-lg text-xs font-semibold transition-all duration-150 touch-manipulation',
          isOccupied
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300'
            : selected
            ? 'bg-sky-500 text-white border-2 border-sky-700 scale-110 shadow-md shadow-sky-200'
            : 'bg-white text-slate-700 border-2 border-slate-300 hover:border-sky-400 hover:bg-sky-50 cursor-pointer'
        )}
      >
        {seat.seat_number.replace(/\d+/, '')}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
        <div className="bg-slate-900 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-lg">
          <p className="font-semibold">{seat.seat_number}</p>
          <p className="capitalize text-slate-300">{seat.class}</p>
          {seat.extra_fee > 0 && <p className="text-sky-400">+{formatCurrency(seat.extra_fee)}</p>}
          {isOccupied && <p className="text-red-400">Occupied</p>}
        </div>
        <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  )
}
