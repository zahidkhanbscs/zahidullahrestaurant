import { useMemo, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import AppButton from '../components/AppButton';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';
import { useDebounce } from '../hooks/useDebounce';
import { useForm } from '../hooks/useForm';
import { useReservation } from '../hooks/useReservation';

function tomorrowString() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

const initialReservation = { date: tomorrowString(), time: '18:00', partySize: '2', phone: '' };

export default function ReservationScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { reservations } = useRestaurant();
  const {
    reservationTimeSlots, getAvailableTable, isSlotAvailable,
    validateReservation, createReservation, cancelReservation,
  } = useReservation();
  const form = useForm(initialReservation, validateReservation);
  const [confirmation, setConfirmation] = useState(null);
  const [success, setSuccess] = useState('');
  const debouncedPhone = useDebounce(form.values.phone, 400);
  const phoneLooksValid = /^03\d{2}-\d{7}$/.test(debouncedPhone);
  const availableTable = useMemo(
    () => form.values.time ? getAvailableTable(form.values.date, form.values.time, Number(form.values.partySize)) : null,
    [form.values.date, form.values.partySize, form.values.time, getAvailableTable]
  );
  const myReservations = useMemo(
    () => reservations.filter((item) => item.customerId === user.id),
    [reservations, user.id]
  );

  const submit = () => {
    if (!form.validateForm()) return;
    try {
      setConfirmation(createReservation(form.values));
      setSuccess('Reservation request sent successfully.');
      form.resetForm({ ...initialReservation, date: tomorrowString() });
    } catch (error) {
      form.setErrors((current) => ({ ...current, form: error.message }));
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Plan ahead" title="Reserve a table" subtitle="Hourly seating from 12:00 to 22:00." />
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FormField
            label="Date"
            value={form.values.date}
            onChangeText={(value) => form.setFieldValue('date', value)}
            error={form.errors.date}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
          <View style={styles.partyHeader}>
            <Text style={[styles.label, { color: colors.text }]}>Party size</Text>
            <Text style={[styles.capacity, { color: colors.textMuted }]}>1–12 guests</Text>
          </View>
          <View style={[styles.partyControl, { backgroundColor: colors.background, borderColor: form.errors.partySize ? colors.danger : colors.border }]}>
            <Pressable
              style={styles.partyButton}
              onPress={() => form.setFieldValue('partySize', String(Math.max(1, Number(form.values.partySize || 1) - 1)))}
            >
              <Text style={[styles.partySymbol, { color: colors.primary }]}>−</Text>
            </Pressable>
            <Text style={[styles.partyNumber, { color: colors.text }]}>{form.values.partySize}</Text>
            <Pressable
              style={styles.partyButton}
              onPress={() => form.setFieldValue('partySize', String(Math.min(12, Number(form.values.partySize || 1) + 1)))}
            >
              <Text style={[styles.partySymbol, { color: colors.primary }]}>+</Text>
            </Pressable>
          </View>
          {form.errors.partySize ? <Text style={[styles.error, { color: colors.danger }]}>{form.errors.partySize}</Text> : null}

          <Text style={[styles.label, styles.timeLabel, { color: colors.text }]}>Choose a time</Text>
          <View style={styles.slots}>
            {reservationTimeSlots.map((time) => {
              const enabled = isSlotAvailable(form.values.date, time, Number(form.values.partySize));
              const selected = form.values.time === time;
              return (
                <Pressable
                  key={time}
                  disabled={!enabled}
                  onPress={() => form.setFieldValue('time', time)}
                  style={[styles.slot, {
                    backgroundColor: selected ? colors.primary : colors.background,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: enabled ? 1 : 0.38,
                  }]}
                >
                  <Text style={[styles.slotText, { color: selected ? '#FFFFFF' : colors.text }]}>{time}</Text>
                </Pressable>
              );
            })}
          </View>
          {form.errors.time ? <Text style={[styles.error, { color: colors.danger }]}>{form.errors.time}</Text> : null}
          <Text style={[styles.disabledNote, { color: colors.textMuted }]}>Greyed slots have no table large enough. 21:00 is blocked for dining-room reset.</Text>

          <FormField
            label="Pakistan phone number"
            value={form.values.phone}
            onChangeText={(value) => form.setFieldValue('phone', value)}
            error={form.errors.phone}
            placeholder="03XX-XXXXXXX"
            keyboardType="phone-pad"
            maxLength={12}
            style={styles.phone}
          />
          {phoneLooksValid ? <Text style={[styles.verified, { color: colors.success }]}>✓ Phone format verified after debounce</Text> : null}

          {availableTable ? (
            <View style={[styles.tableResult, { backgroundColor: colors.primarySoft }]}>
              <Text style={styles.tableIcon}>◫</Text>
              <View>
                <Text style={[styles.tableLabel, { color: colors.primary }]}>AVAILABLE TABLE</Text>
                <Text style={[styles.tableName, { color: colors.text }]}>{availableTable.label} · seats {availableTable.seats}</Text>
              </View>
            </View>
          ) : null}
          {form.errors.form ? <Text style={[styles.error, { color: colors.danger }]}>{form.errors.form}</Text> : null}
          <AppButton title="Request reservation" onPress={submit} style={styles.submit} />
          {success ? <Text style={[styles.success, { color: colors.success }]}>{success}</Text> : null}
        </View>

        <Text style={[styles.myTitle, { color: colors.text }]}>My reservations</Text>
        {!myReservations.length ? (
          <Text style={[styles.noReservations, { color: colors.textMuted }]}>Your reservation requests will appear here.</Text>
        ) : myReservations.map((reservation) => (
          <View key={reservation.id} style={[styles.reservationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.reservationTop}>
              <View>
                <Text style={[styles.reservationDate, { color: colors.text }]}>{reservation.date} · {reservation.time}</Text>
                <Text style={[styles.reservationMeta, { color: colors.textMuted }]}>{reservation.partySize} guests · {reservation.table.label}</Text>
              </View>
              <Text style={[styles.status, {
                color: reservation.status === 'Declined' || reservation.status === 'Cancelled' ? colors.danger : colors.accent,
                backgroundColor: reservation.status === 'Declined' || reservation.status === 'Cancelled' ? colors.accentSoft : colors.primarySoft,
              }]}>{reservation.status}</Text>
            </View>
            {!['Cancelled', 'Declined'].includes(reservation.status) ? (
              <Pressable onPress={() => cancelReservation(reservation.id)}><Text style={[styles.cancel, { color: colors.danger }]}>Cancel reservation</Text></Pressable>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <Modal transparent visible={Boolean(confirmation)} animationType="fade" onRequestClose={() => setConfirmation(null)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}><Text style={styles.check}>✓</Text></View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Reservation received</Text>
            <Text style={[styles.modalText, { color: colors.textMuted }]}>
              {confirmation ? `${confirmation.date} at ${confirmation.time} for ${confirmation.partySize} guests. ${confirmation.table.label} is held while the manager reviews it.` : ''}
            </Text>
            <AppButton title="Done" onPress={() => setConfirmation(null)} style={styles.done} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, paddingTop: 20, paddingBottom: 110 },
  formCard: { borderWidth: 1, borderRadius: 21, padding: 16 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 7 },
  partyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  capacity: { fontSize: 11 },
  partyControl: { flexDirection: 'row', borderWidth: 1, borderRadius: 13, alignItems: 'center', alignSelf: 'flex-start' },
  partyButton: { width: 55, height: 45, alignItems: 'center', justifyContent: 'center' },
  partySymbol: { fontSize: 23, fontWeight: '800' },
  partyNumber: { minWidth: 42, textAlign: 'center', fontSize: 18, fontWeight: '900' },
  timeLabel: { marginTop: 17 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: '22.8%', borderWidth: 1, borderRadius: 11, alignItems: 'center', paddingVertical: 10 },
  slotText: { fontSize: 12, fontWeight: '800' },
  disabledNote: { fontSize: 10, lineHeight: 15, marginTop: 8 },
  phone: { marginTop: 17 },
  error: { fontSize: 12, marginTop: 5 },
  verified: { fontSize: 11, fontWeight: '700', marginTop: 6 },
  tableResult: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 13, marginTop: 16 },
  tableIcon: { fontSize: 23 },
  tableLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  tableName: { fontSize: 13, fontWeight: '800', marginTop: 3 },
  submit: { marginTop: 17 },
  success: { fontSize: 12, textAlign: 'center', marginTop: 10, fontWeight: '800' },
  myTitle: { fontSize: 20, fontWeight: '900', marginTop: 24, marginBottom: 11 },
  noReservations: { fontSize: 13 },
  reservationCard: { borderWidth: 1, borderRadius: 17, padding: 14, marginBottom: 11 },
  reservationTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  reservationDate: { fontSize: 14, fontWeight: '900' },
  reservationMeta: { fontSize: 11, marginTop: 4 },
  status: { overflow: 'hidden', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8, fontSize: 10, fontWeight: '900' },
  cancel: { fontSize: 11, fontWeight: '800', marginTop: 13 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center' },
  checkCircle: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  check: { color: '#FFFFFF', fontSize: 27, fontWeight: '900' },
  modalTitle: { fontSize: 21, fontWeight: '900', marginTop: 16 },
  modalText: { textAlign: 'center', lineHeight: 20, marginTop: 8 },
  done: { alignSelf: 'stretch', marginTop: 20 },
});
