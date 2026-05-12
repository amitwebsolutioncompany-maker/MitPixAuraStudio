import {create} from 'zustand';

export const useBookingStore = create((set) => ({
  city: '',
  salon: null,
  employee: null,
  slot: null,
  setCity: (city) => set({city}),
  setSalon: (salon) => set({salon, employee: null, slot: null}),
  setEmployee: (employee) => set({employee, slot: null}),
  setSlot: (slot) => set({slot}),
  resetBooking: () => set({city: '', salon: null, employee: null, slot: null})
}));
