export const tables = [
  { id: 'T1', label: 'Window Table 1', seats: 2, blockedSlots: ['21:00'] },
  { id: 'T2', label: 'Window Table 2', seats: 2, blockedSlots: ['21:00'] },
  { id: 'T3', label: 'Garden Table', seats: 4, blockedSlots: ['21:00'] },
  { id: 'T4', label: 'Family Booth', seats: 6, blockedSlots: ['21:00'] },
  { id: 'T5', label: 'Celebration Table', seats: 8, blockedSlots: ['21:00'] },
  { id: 'T6', label: 'Grand Table', seats: 12, blockedSlots: ['21:00'] },
];
export const reservationTimeSlots = Array.from({ length: 11 }, (_, index) => `${String(12 + index).padStart(2, '0')}:00`);
