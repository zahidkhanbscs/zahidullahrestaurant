import { useMemo, useState } from 'react';
import {
  Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import { ORDER_STATUSES, useOrders } from '../context/OrdersContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';

const sections = ['Incoming Orders', 'Reservations', 'Menu Management'];
const categories = ['Starters', 'Mains', 'Desserts', 'Drinks'];

export default function ManagerDashboardScreen() {
  const { colors } = useTheme();
  const [section, setSection] = useState(sections[0]);
  const { orders, updateOrderStatus } = useOrders();
  const {
    menu, reservations, editMenuPrice, toggleMenuAvailability,
    addMenuItem, updateReservationStatus,
  } = useRestaurant();
  const pendingOrders = useMemo(() => orders.filter((order) => order.status !== 'Served'), [orders]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="Manager workspace"
          title="Operations dashboard"
          subtitle="Review service activity and make live customer-facing updates."
          right={<View style={[styles.live, { backgroundColor: colors.primarySoft }]}><View style={[styles.liveDot, { backgroundColor: colors.success }]} /><Text style={[styles.liveText, { color: colors.primary }]}>LIVE</Text></View>}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {sections.map((item) => {
            const selected = section === item;
            const count = item === 'Incoming Orders' ? pendingOrders.length : item === 'Reservations' ? reservations.filter((r) => r.status === 'Pending').length : menu.length;
            return (
              <Pressable
                key={item}
                onPress={() => setSection(item)}
                style={[styles.tab, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border }]}
              >
                <Text style={[styles.tabText, { color: selected ? '#FFFFFF' : colors.text }]}>{item}</Text>
                <Text style={[styles.tabCount, { color: selected ? colors.secondary : colors.accent }]}>{count}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {section === 'Incoming Orders' ? <OrdersManager orders={orders} colors={colors} updateOrderStatus={updateOrderStatus} /> : null}
        {section === 'Reservations' ? <ReservationsManager reservations={reservations} colors={colors} updateStatus={updateReservationStatus} /> : null}
        {section === 'Menu Management' ? (
          <MenuManager
            menu={menu}
            colors={colors}
            editMenuPrice={editMenuPrice}
            toggleMenuAvailability={toggleMenuAvailability}
            addMenuItem={addMenuItem}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function OrdersManager({ orders, colors, updateOrderStatus }) {
  if (!orders.length) return <EmptyManager title="No incoming orders" message="Customer orders will appear here immediately." colors={colors} />;
  return (
    <View>
      <Text style={[styles.sectionIntro, { color: colors.textMuted }]}>Update an order manually, or let the demo progression advance it every eight seconds.</Text>
      {orders.map((order) => {
        const index = ORDER_STATUSES.indexOf(order.status);
        const next = ORDER_STATUSES[Math.min(index + 1, ORDER_STATUSES.length - 1)];
        return (
          <View key={order.id} style={[styles.managerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{order.id}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>{order.type} · {order.items.length} item lines</Text>
              </View>
              <Text style={[styles.statusBadge, { color: colors.accent, backgroundColor: colors.accentSoft }]}>{order.status}</Text>
            </View>
            {order.items.map((item) => <Text key={item.id} style={[styles.orderItem, { color: colors.text }]}>{item.quantity} × {item.name}</Text>)}
            <View style={styles.rowBetween}>
              <Text style={[styles.orderTotal, { color: colors.accent }]}>Rs {Math.round(order.total).toLocaleString()}</Text>
              {order.status !== 'Served' ? <AppButton title={`Mark ${next}`} onPress={() => updateOrderStatus(order.id, next)} style={styles.smallButton} /> : <Text style={[styles.complete, { color: colors.success }]}>✓ Completed</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ReservationsManager({ reservations, colors, updateStatus }) {
  if (!reservations.length) return <EmptyManager title="No reservation requests" message="New customer requests will be listed here." colors={colors} />;
  return (
    <View>
      <Text style={[styles.sectionIntro, { color: colors.textMuted }]}>Accept or decline each request. Customer history updates instantly.</Text>
      {reservations.map((reservation) => (
        <View key={reservation.id} style={[styles.managerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View style={styles.grow}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{reservation.customerName}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{reservation.date} at {reservation.time} · {reservation.partySize} guests</Text>
              <Text style={[styles.tableInfo, { color: colors.primary }]}>{reservation.table.label} · {reservation.phone}</Text>
            </View>
            <Text style={[styles.statusBadge, { color: colors.accent, backgroundColor: colors.accentSoft }]}>{reservation.status}</Text>
          </View>
          {reservation.status === 'Pending' ? (
            <View style={styles.actionRow}>
              <AppButton title="Accept" onPress={() => updateStatus(reservation.id, 'Accepted')} style={styles.flexButton} />
              <AppButton title="Decline" variant="outline" onPress={() => updateStatus(reservation.id, 'Declined')} style={styles.flexButton} />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function MenuManager({ menu, colors, editMenuPrice, toggleMenuAvailability, addMenuItem }) {
  const [drafts, setDrafts] = useState({});
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Mains' });
  const [message, setMessage] = useState('');
  const savePrice = (item) => {
    const price = Number(drafts[item.id] ?? item.price);
    if (!Number.isFinite(price) || price <= 0) return;
    editMenuPrice(item.id, Math.round(price));
    setDrafts((current) => ({ ...current, [item.id]: '' }));
  };
  const submitNew = () => {
    if (form.name.trim().length < 2 || Number(form.price) <= 0) {
      setMessage('Enter a dish name and a valid positive price.');
      return;
    }
    addMenuItem(form);
    setForm({ name: '', description: '', price: '', category: 'Mains' });
    setMessage('New menu item added and published to the customer menu.');
  };
  return (
    <View>
      <View style={[styles.addCard, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
        <Text style={styles.addTitle}>Add a menu item</Text>
        <Text style={styles.addHelp}>New manager-created items use the app icon as a local fallback image.</Text>
        <ManagerInput value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} placeholder="Dish name" />
        <ManagerInput value={form.description} onChangeText={(description) => setForm((current) => ({ ...current, description }))} placeholder="Short description" />
        <ManagerInput value={form.price} onChangeText={(price) => setForm((current) => ({ ...current, price }))} placeholder="Price in PKR" keyboardType="number-pad" />
        <View style={styles.categoryRow}>
          {categories.map((category) => (
            <Pressable key={category} onPress={() => setForm((current) => ({ ...current, category }))} style={[styles.categoryButton, { backgroundColor: form.category === category ? colors.accent : 'rgba(255,255,255,0.12)' }]}>
              <Text style={styles.categoryButtonText}>{category}</Text>
            </Pressable>
          ))}
        </View>
        <AppButton title="Add & publish" onPress={submitNew} style={styles.publish} />
        {message ? <Text style={styles.addMessage}>{message}</Text> : null}
      </View>

      <Text style={[styles.sectionIntro, { color: colors.textMuted }]}>{menu.length} items · Price and availability changes persist with AsyncStorage.</Text>
      {menu.map((item) => (
        <View key={item.id} style={[styles.menuRow, { backgroundColor: colors.surface, borderColor: colors.border, opacity: item.isAvailable ? 1 : 0.66 }]}>
          <Image source={item.image} style={styles.menuImage} />
          <View style={styles.menuCopy}>
            <Text style={[styles.menuName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.category} · {item.isAvailable ? 'Available' : 'Hidden from ordering'}</Text>
            <View style={styles.priceEdit}>
              <Text style={[styles.rs, { color: colors.textMuted }]}>Rs</Text>
              <TextInput
                value={drafts[item.id] ?? String(item.price)}
                onChangeText={(value) => setDrafts((current) => ({ ...current, [item.id]: value }))}
                keyboardType="number-pad"
                style={[styles.priceInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <Pressable onPress={() => savePrice(item)} style={[styles.save, { backgroundColor: colors.accent }]}><Text style={styles.saveText}>Save</Text></Pressable>
            </View>
          </View>
          <Switch
            value={item.isAvailable}
            onValueChange={() => toggleMenuAvailability(item.id)}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            thumbColor={item.isAvailable ? colors.primary : colors.disabled}
          />
        </View>
      ))}
    </View>
  );
}

function ManagerInput(props) {
  return <TextInput {...props} placeholderTextColor="#C9D8DC" style={[styles.managerInput, { color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.24)' }]} />;
}

function EmptyManager({ title, message, colors }) {
  return (
    <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={styles.emptyIcon}>◇</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, paddingTop: 20, paddingBottom: 110 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  tabs: { gap: 8, paddingBottom: 17 },
  tab: { borderWidth: 1, borderRadius: 13, paddingVertical: 10, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tabText: { fontSize: 12, fontWeight: '900' },
  tabCount: { fontSize: 11, fontWeight: '900' },
  sectionIntro: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  managerCard: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  grow: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '900' },
  meta: { fontSize: 10, marginTop: 4 },
  statusBadge: { overflow: 'hidden', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8, fontSize: 9, fontWeight: '900' },
  orderItem: { fontSize: 12, marginTop: 10 },
  orderTotal: { fontSize: 15, fontWeight: '900', marginTop: 17 },
  smallButton: { minHeight: 38, marginTop: 10 },
  complete: { marginTop: 18, fontWeight: '800', fontSize: 12 },
  tableInfo: { fontSize: 11, fontWeight: '800', marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 14 },
  flexButton: { flex: 1, minHeight: 40 },
  addCard: { borderWidth: 1, borderRadius: 21, padding: 16, marginBottom: 17 },
  addTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  addHelp: { color: '#C9D8DC', fontSize: 10, lineHeight: 15, marginTop: 4, marginBottom: 8 },
  managerInput: { minHeight: 44, borderWidth: 1, borderRadius: 11, marginTop: 9, paddingHorizontal: 12, fontSize: 13 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  categoryButton: { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 9 },
  categoryButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  publish: { marginTop: 12 },
  addMessage: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginTop: 9, textAlign: 'center' },
  menuRow: { borderWidth: 1, borderRadius: 17, padding: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuImage: { width: 56, height: 56, borderRadius: 12 },
  menuCopy: { flex: 1 },
  menuName: { fontSize: 13, fontWeight: '900' },
  priceEdit: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rs: { fontSize: 10, marginRight: 4 },
  priceInput: { borderWidth: 1, borderRadius: 8, minWidth: 70, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 },
  save: { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 9, marginLeft: 6 },
  saveText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  empty: { borderWidth: 1, borderRadius: 20, padding: 28, alignItems: 'center' },
  emptyIcon: { fontSize: 35 },
  emptyTitle: { fontSize: 17, fontWeight: '900', marginTop: 8 },
  emptyText: { fontSize: 12, textAlign: 'center', marginTop: 5 },
});
