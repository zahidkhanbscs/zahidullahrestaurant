import { useCallback } from 'react';
import { reservationTimeSlots, tables } from '../data/tables';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

function toLocalDate(date, time) {
  return new Date(`${date}T${time}:00`);
}

export function useReservation() {
  const { user } = useAuth();
  const { reservations, addReservation, cancelReservation } = useRestaurant();

  const getAvailableTable = useCallback((date, time, partySize) => {
    const reservedTableIds = reservations
      .filter((entry) => entry.date === date && entry.time === time && !['Cancelled', 'Declined'].includes(entry.status))
      .map((entry) => entry.table.id);
    return tables.find((table) =>
      table.seats >= Number(partySize) &&
      !table.blockedSlots.includes(time) &&
      !reservedTableIds.includes(table.id)
    ) || null;
  }, [reservations]);

  const isSlotAvailable = useCallback((date, time, partySize) => Boolean(getAvailableTable(date, time, partySize)), [getAvailableTable]);

  const validateReservation = useCallback((values) => {
    const errors = {};
    const partySize = Number(values.partySize);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) errors.date = 'Use the date format YYYY-MM-DD.';
    const requestedAt = toLocalDate(values.date, values.time || '00:00');
    if (Number.isNaN(requestedAt.getTime())) errors.date = 'Enter a valid calendar date.';
    else if (requestedAt.getTime() < Date.now() + 60 * 60 * 1000) errors.time = 'Reservation must be at least one hour ahead.';
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 12) errors.partySize = 'Party size must be between 1 and 12.';
    if (!/^03\d{2}-\d{7}$/.test(values.phone)) errors.phone = 'Use Pakistan format 03XX-XXXXXXX.';
    if (!values.time) errors.time = 'Select an available time.';
    else if (!errors.date && !errors.partySize && !getAvailableTable(values.date, values.time, partySize)) errors.time = 'No suitable table is available for this slot.';
    return errors;
  }, [getAvailableTable]);

  const createReservation = useCallback((values) => {
    const table = getAvailableTable(values.date, values.time, Number(values.partySize));
    if (!table) throw new Error('That table is no longer available.');
    const reservation = {
      id: `RSV-${Date.now().toString().slice(-6)}`,
      customerId: user.id,
      customerName: user.name,
      date: values.date,
      time: values.time,
      partySize: Number(values.partySize),
      phone: values.phone,
      table,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    addReservation(reservation);
    return reservation;
  }, [addReservation, getAvailableTable, user]);

  return { reservationTimeSlots, getAvailableTable, isSlotAvailable, validateReservation, createReservation, cancelReservation };
}
