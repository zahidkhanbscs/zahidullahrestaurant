import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import FormField from '../components/FormField';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';
import { tables } from '../data/tables';

export const SERVICE_CHARGE_RATE = 0.05;
export const SALES_TAX_RATE = 0.15;

export default function OrderSummaryScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { items, discountPercent, promoCode, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [type, setType] = useState('Dine-in');
  const [selectedTable, setSelectedTable] = useState(tables[2]);
  const [pickupName, setPickupName] = useState(user.name);
  const [placing, setPlacing] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const serviceCharge = useMemo(() => subtotal * SERVICE_CHARGE_RATE, [subtotal]);
  const tax = useMemo(() => subtotal * SALES_TAX_RATE, [subtotal]);
  const discount = useMemo(() => subtotal * discountPercent / 100, [discountPercent, subtotal]);
  const grandTotal = useMemo(() => subtotal + serviceCharge + tax - discount, [discount, serviceCharge, subtotal, tax]);

  const place = async () => {
    if (type === 'Takeaway' && !pickupName.trim()) {
      Alert.alert('Pickup name needed', 'Enter the name used to collect this order.');
      return;
    }
    setPlacing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const order = placeOrder({
      customerId: user.id,
      items,
      total: grandTotal,
      type,
      fulfillmentInfo: type === 'Dine-in' ? selectedTable : { label: `Pickup for ${pickupName.trim()}` },
    });
    clearCart();
    setPlacing(false);
    Alert.alert('Order placed', `${order.id} is now Pending.`, [
      { text: 'Track order', onPress: () => navigation.getParent()?.navigate('Orders') },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <ScreenHeader eyebrow="Final check" title="Order summary" subtitle="Choose how you want to enjoy your meal." />
      <Text style={[styles.label, { color: colors.text }]}>Order type</Text>
      <View style={styles.typeRow}>
        {['Dine-in', 'Takeaway'].map((option) => {
          const selected = type === option;
          return (
            <Pressable
              key={option}
              onPress={() => setType(option)}
              style={[styles.typeCard, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border }]}
            >
              <Text style={styles.typeIcon}>{option === 'Dine-in' ? '◫' : '▱'}</Text>
              <Text style={[styles.typeTitle, { color: selected ? '#FFFFFF' : colors.text }]}>{option}</Text>
              <Text style={[styles.typeHelp, { color: selected ? '#C9D8DC' : colors.textMuted }]}>{option === 'Dine-in' ? 'Choose your table' : 'Collect at the counter'}</Text>
            </Pressable>
          );
        })}
      </View>

      {type === 'Dine-in' ? (
        <View style={[styles.fulfillment, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select a table</Text>
          <View style={styles.tableGrid}>
            {tables.slice(0, 5).map((table) => {
              const selected = selectedTable.id === table.id;
              return (
                <Pressable
                  key={table.id}
                  onPress={() => setSelectedTable(table)}
                  style={[styles.tableChip, { backgroundColor: selected ? colors.accentSoft : colors.background, borderColor: selected ? colors.accent : colors.border }]}
                >
                  <Text style={[styles.tableText, { color: selected ? colors.accent : colors.text }]}>{table.label}</Text>
                  <Text style={[styles.seats, { color: colors.textMuted }]}>{table.seats} seats</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={[styles.fulfillment, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pickup information</Text>
          <FormField label="Name for pickup" value={pickupName} onChangeText={setPickupName} placeholder="Pickup name" />
          <Text style={[styles.pickupNote, { color: colors.textMuted }]}>Estimated preparation: 20–25 minutes. Collect from the front counter.</Text>
        </View>
      )}

      <View style={[styles.itemsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Items ({items.length})</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.quantity} × {item.name}</Text>
            <Text style={[styles.itemPrice, { color: colors.text }]}>Rs {(item.price * item.quantity).toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.totals, { backgroundColor: colors.primary }]}>
        <PriceRow label="Subtotal" value={subtotal} />
        <PriceRow label="Service charge (5%)" value={serviceCharge} />
        <PriceRow label="Sales tax (15%)" value={tax} />
        {discount ? <PriceRow label={`Promo ${promoCode} (${discountPercent}%)`} value={-discount} accent /> : null}
        <View style={styles.rule} />
        <View style={styles.grandRow}><Text style={styles.grandLabel}>Grand total</Text><Text style={styles.grandValue}>Rs {Math.round(grandTotal).toLocaleString()}</Text></View>
      </View>
      <AppButton title={`Place ${type.toLowerCase()} order`} onPress={place} loading={placing} disabled={!items.length} style={styles.place} />
    </ScrollView>
  );
}

function PriceRow({ label, value, accent }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, accent && styles.promo]}>{label}</Text>
      <Text style={[styles.priceValue, accent && styles.promo]}>{value < 0 ? '− ' : ''}Rs {Math.round(Math.abs(value)).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 20, paddingBottom: 45 },
  label: { fontSize: 13, fontWeight: '900', marginBottom: 9 },
  typeRow: { flexDirection: 'row', gap: 11 },
  typeCard: { flex: 1, borderWidth: 1.5, borderRadius: 18, padding: 15 },
  typeIcon: { fontSize: 25 },
  typeTitle: { fontSize: 16, fontWeight: '900', marginTop: 9 },
  typeHelp: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  fulfillment: { borderWidth: 1, borderRadius: 18, padding: 15, marginTop: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12 },
  tableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tableChip: { width: '48%', borderWidth: 1, borderRadius: 12, padding: 10 },
  tableText: { fontSize: 12, fontWeight: '800' },
  seats: { fontSize: 10, marginTop: 3 },
  pickupNote: { fontSize: 11, lineHeight: 16, marginTop: 10 },
  itemsCard: { borderWidth: 1, borderRadius: 18, padding: 15, marginTop: 15 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  itemName: { flex: 1, fontSize: 13 },
  itemPrice: { fontSize: 13, fontWeight: '800' },
  totals: { borderRadius: 20, padding: 18, marginTop: 15 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { color: '#CAD9DD', fontSize: 13 },
  priceValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  promo: { color: '#F1B695' },
  rule: { height: 1, backgroundColor: 'rgba(255,255,255,0.22)', marginVertical: 5 },
  grandRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  grandLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  grandValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  place: { marginTop: 17 },
});
