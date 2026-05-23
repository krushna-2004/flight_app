export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-xl w-64 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="w-24 h-8 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
