import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import OrderStatusStep from '../components/OrderStatusStep';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { ORDER_STATUSES, useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';

function elapsedLabel(timestamp, now) {
  const minutes = Math.max(0, Math.floor((now - new Date(timestamp).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  return `${minutes} minutes ago`;
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { orders } = useOrders();
  const [now, setNow] = useState(0);
  const customerOrders = useMemo(() => orders.filter((order) => order.customerId === user.id), [orders, user.id]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <ScreenHeader eyebrow="Live updates" title="Your orders" subtitle="Demo orders advance automatically every eight seconds." />
      {!customerOrders.length ? (
        <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.emptyIcon}>◎</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Place an order from your cart and its live progress will appear here.</Text>
        </View>
      ) : customerOrders.map((order) => {
        const currentIndex = ORDER_STATUSES.indexOf(order.status);
        return (
          <View key={order.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.orderTop}>
              <View>
                <Text style={[styles.id, { color: colors.text }]}>{order.id}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>{order.type} · {elapsedLabel(order.timestamp, now)}</Text>
              </View>
              <Text style={[styles.status, { color: colors.accent, backgroundColor: colors.accentSoft }]}>{order.status}</Text>
            </View>
            <View style={styles.progress}>
              {ORDER_STATUSES.map((status, index) => (
                <OrderStatusStep
                  key={status}
                  label={status}
                  state={index < currentIndex ? 'complete' : index === currentIndex ? 'active' : 'future'}
                  isLast={index === ORDER_STATUSES.length - 1}
                />
              ))}
            </View>
            <View style={[styles.details, { backgroundColor: colors.background }]}>
              {order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={[styles.itemText, { color: colors.text }]}>{item.quantity} × {item.name}</Text>
                  <Text style={[styles.itemPrice, { color: colors.textMuted }]}>Rs {(item.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
            </View>
            <View style={styles.orderBottom}>
              <View>
                <Text style={[styles.fulfillmentLabel, { color: colors.textMuted }]}>{order.type === 'Dine-in' ? 'TABLE' : 'PICKUP'}</Text>
                <Text style={[styles.fulfillment, { color: colors.text }]}>{order.fulfillmentInfo?.label || 'Restaurant counter'}</Text>
              </View>
              <View style={styles.totalWrap}>
                <Text style={[styles.fulfillmentLabel, { color: colors.textMuted }]}>TOTAL</Text>
                <Text style={[styles.total, { color: colors.accent }]}>Rs {Math.round(order.total).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 20, paddingBottom: 110 },
  empty: { borderWidth: 1, borderRadius: 22, padding: 30, alignItems: 'center', marginTop: 10 },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { fontSize: 19, fontWeight: '900', marginTop: 8 },
  emptyText: { textAlign: 'center', marginTop: 6, lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: 21, padding: 15, marginBottom: 15 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  id: { fontSize: 17, fontWeight: '900' },
  meta: { fontSize: 11, marginTop: 4 },
  status: { overflow: 'hidden', paddingVertical: 6, paddingHorizontal: 9, borderRadius: 9, fontSize: 11, fontWeight: '900' },
  progress: { flexDirection: 'row', marginVertical: 20 },
  details: { borderRadius: 13, padding: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 7 },
  itemText: { flex: 1, fontSize: 12 },
  itemPrice: { fontSize: 11, fontWeight: '700' },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  fulfillmentLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  fulfillment: { fontSize: 12, fontWeight: '800', marginTop: 3 },
  totalWrap: { alignItems: 'flex-end' },
  total: { fontSize: 15, fontWeight: '900', marginTop: 3 },
});
