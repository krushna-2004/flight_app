import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { BookingsList } from '@/components/booking/BookingsList'
import type { BookingWithDetails } from '@/types'
import { Ticket } from 'lucide-react'

export default async function MyBookingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/my-bookings')

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flights (*),
      seats (*),
      passengers (*)
    `)
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
          <Ticket className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 text-sm">{bookings?.length ?? 0} booking{(bookings?.length ?? 0) !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
          Error loading bookings: {error.message}
        </div>
      )}

      {bookings && bookings.length > 0 ? (
        <BookingsList initialBookings={bookings as BookingWithDetails[]} userId={user.id} />
      ) : (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="font-display text-xl font-semibold text-slate-700 mb-2">No bookings yet</h2>
          <p className="text-slate-500 text-sm mb-6">Start by searching for a flight.</p>
          <a href="/" className="btn-primary inline-flex">Search Flights</a>
        </div>
      )}
    </div>
  )
}
