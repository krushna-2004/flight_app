import { FlightSearchForm } from '@/components/flight/FlightSearchForm'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white/80 text-sm font-medium mb-6">
            ✈️ &nbsp;Book flights in seconds
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Your Journey,<br />
            <span className="text-sky-300">Perfectly Booked</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
            Search hundreds of flights, pick your perfect seat, and manage bookings — all in one place.
          </p>
        </div>

        {/* Search form card */}
        <div className="animate-slide-up">
          <FlightSearchForm />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 text-center text-white/80">
          {[
            { label: 'Destinations', value: '50+' },
            { label: 'Daily Flights', value: '200+' },
            { label: 'Happy Travellers', value: '1M+' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-white font-display">{s.value}</div>
              <div className="text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
