import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'
import { InstallBanner } from '@/components/ui/InstallBanner'
import { AuthProvider } from '@/components/ui/AuthProvider'

export const metadata: Metadata = {
  title: 'SkyBook — Flight Management',
  description: 'Search, book, and manage your flights with ease.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'SkyBook' },
}

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <InstallBanner />
        </AuthProvider>
      </body>
    </html>
  )
}