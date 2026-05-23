'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users, ArrowLeftRight } from 'lucide-react'
import { useFlightStore } from '@/store/flightStore'
import { AIRPORTS } from '@/lib/utils'
import { format } from 'date-fns'

export function FlightSearchForm() {
  const router = useRouter()
  const { searchQuery, setSearchQuery } = useFlightStore()

  const [origin, setOrigin] = useState(searchQuery?.origin ?? '')
  const [destination, setDestination] = useState(searchQuery?.destination ?? '')
  const [date, setDate] = useState(searchQuery?.date ?? format(new Date(), 'yyyy-MM-dd'))
  const [passengers, setPassengers] = useState(searchQuery?.passengers ?? 1)
  const [error, setError] = useState('')

  const swap = () => {
    setOrigin(destination)
    setDestination(origin)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination) { setError('Please select origin and destination'); return }
    if (origin === destination) { setError('Origin and destination must be different'); return }
    setError('')
    setSearchQuery({ origin, destination, date, passengers })
    router.push(`/flights?origin=${origin}&destination=${destination}&date=${date}&passengers=${passengers}`)
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Origin */}
          <div className="md:col-span-3">
            <label className="label text-slate-700">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="input-field pl-9 appearance-none cursor-pointer"
              >
                <option value="">Select city</option>
                {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Swap button */}
          <div className="md:col-span-1 flex justify-center md:mb-1">
            <button type="button" onClick={swap}
              className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-sky-400 hover:text-sky-500 transition-colors bg-white">
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-3">
            <label className="label text-slate-700">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input-field pl-9 appearance-none cursor-pointer"
              >
                <option value="">Select city</option>
                {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="md:col-span-3">
            <label className="label text-slate-700">Departure Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="date" value={date}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setDate(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Passengers */}
          <div className="md:col-span-1">
            <label className="label text-slate-700">Pax</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}
                className="input-field pl-9 appearance-none cursor-pointer">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Search button */}
          <div className="md:col-span-1">
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              <span className="md:hidden">Search Flights</span>
              <span className="hidden md:inline">Go</span>
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        )}
      </form>
    </div>
  )
}
