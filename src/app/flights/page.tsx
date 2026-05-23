import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FlightCard } from '@/components/flight/FlightCard'
import { FlightSearchForm } from '@/components/flight/FlightSearchForm'
import { Plane } from 'lucide-react'
import type { Flight } from '@/types'
import { formatDate } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{ origin?: string; destination?: string; date?: string; passengers?: string }>
}

export default async function FlightsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { origin, destination, date, passengers } = params

  let flights: Flight[] = []
  let error = ''

  if (origin && destination && date) {
    const supabase = await createServerSupabaseClient()
    const startOfDay = `${date}T00:00:00`
    const endOfDay = `${date}T23:59:59`

    const { data, error: dbError } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', origin)
      .eq('destination', destination)
      .gte('departs_at', startOfDay)
      .lte('departs_at', endOfDay)
      .neq('status', 'cancelled')
      .order('departs_at', { ascending: true })

    if (dbError) error = dbError.message
    else flights = data ?? []
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="mb-8">
        <FlightSearchForm />
      </div>

      {/* Results header */}
      {origin && destination && date && (
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {origin} → {destination}
          </h1>
          <p className="text-slate-500 mt-1">
            {formatDate(date)} · {passengers ?? 1} passenger{Number(passengers) > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">{error}</div>
      )}

      {/* Flight list */}
      {flights.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm text-slate-500">{flights.length} flight{flights.length !== 1 ? 's' : ''} found</p>
          {flights.map(f => <FlightCard key={f.id} flight={f} />)}
        </div>
      ) : origin && destination ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="font-display text-xl font-semibold text-slate-700 mb-2">No flights found</h2>
          <p className="text-slate-500 text-sm">Try a different date or route.</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400">Search for flights to get started.</p>
        </div>
      )}
    </div>
  )
}
