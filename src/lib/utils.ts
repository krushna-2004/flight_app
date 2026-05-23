import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDuration, intervalToDuration } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatTime(date: string | Date) {
  return format(new Date(date), 'HH:mm')
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'dd MMM yyyy, HH:mm')
}

export function getFlightDuration(departs: string, arrives: string) {
  const duration = intervalToDuration({
    start: new Date(departs),
    end: new Date(arrives),
  })
  const hours = duration.hours ?? 0
  const minutes = duration.minutes ?? 0
  return `${hours}h ${minutes}m`
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const AIRPORTS = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa',
]

export const NATIONALITIES = [
  'Indian', 'American', 'British', 'Australian', 'Canadian',
  'French', 'German', 'Japanese', 'Chinese', 'Singaporean',
]
