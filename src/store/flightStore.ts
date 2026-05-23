import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Flight, Seat, SearchParams } from '@/types'

type BookingStep = 'search' | 'results' | 'seat-select' | 'passenger-details' | 'confirm'

interface PassengerForm {
  full_name: string
  passport_no: string
  nationality: string
  dob: string
}

interface FlightStore {
  // Search
  searchQuery: SearchParams | null
  setSearchQuery: (query: SearchParams) => void

  // Selected flight
  selectedFlight: Flight | null
  setSelectedFlight: (flight: Flight | null) => void

  // Selected seat (optimistic)
  selectedSeat: Seat | null
  setSelectedSeat: (seat: Seat | null) => void

  // Booking step
  bookingStep: BookingStep
  setBookingStep: (step: BookingStep) => void

  // Passenger form
  passengerForm: PassengerForm
  setPassengerForm: (data: Partial<PassengerForm>) => void

  // Reset
  resetBooking: () => void
  resetAll: () => void
}

const defaultPassengerForm: PassengerForm = {
  full_name: '',
  passport_no: '',
  nationality: '',
  dob: '',
}

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: null,
      selectedFlight: null,
      selectedSeat: null,
      bookingStep: 'search',
      passengerForm: defaultPassengerForm,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setBookingStep: (step) => set({ bookingStep: step }),
      setPassengerForm: (data) =>
        set((state) => ({ passengerForm: { ...state.passengerForm, ...data } })),

      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: 'search',
          passengerForm: defaultPassengerForm,
        }),

      resetAll: () =>
        set({
          searchQuery: null,
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: 'search',
          passengerForm: defaultPassengerForm,
        }),
    }),
    {
      name: 'flight-store',
      storage: createJSONStorage(() => localStorage),
      // Exclude sensitive passport info from localStorage
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep,
        passengerForm: {
          full_name: state.passengerForm.full_name,
          nationality: state.passengerForm.nationality,
          dob: state.passengerForm.dob,
          // passport_no intentionally excluded
        },
      }),
    }
  )
)
