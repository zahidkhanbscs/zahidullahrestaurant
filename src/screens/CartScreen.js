import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AppButton from '../components/AppButton';
import CartItemRow from '../components/CartItemRow';
import ScreenHeader from '../components/ScreenHeader';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const {
    items, subtotal, promoCode, discountPercent, increment, decrement,
    removeItem, updateNote, clearCart, applyPromo, removePromo,
  } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const discount = useMemo(() => subtotal * discountPercent / 100, [discountPercent, subtotal]);
  const previewTotal = useMemo(() => subtotal - discount, [discount, subtotal]);
  const renderItem = useCallback(({ item }) => (
    <CartItemRow
      item={item}
      onIncrement={increment}
      onDecrement={decrement}
      onRemove={removeItem}
      onUpdateNote={updateNote}
    />
  ), [decrement, increment, removeItem, updateNote]);

  const submitPromo = () => {
    const result = applyPromo(promoInput);
    setPromoMessage(result.message);
    if (result.success) setPromoInput('');
  };
  const confirmClear = () => Alert.alert('Clear cart?', 'This removes every item and the current promo.', [
    { text: 'Keep items', style: 'cancel' },
    { text: 'Clear', style: 'destructive', onPress: clearCart },
  ]);

  if (!items.length) {
    return (
      <View style={[styles.emptyScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyMark, { backgroundColor: colors.primarySoft }]}><Text style={styles.emptyIcon}>⌑</Text></View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is waiting</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Add an available dish from the menu to start an order.</Text>
        <AppButton title="Browse menu" onPress={() => navigation.getParent()?.navigate('Menu')} style={styles.browse} />
      </View>
    );
  }

  const footer = (
    <View>
      <View style={[styles.promoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo code</Text>
        {promoCode ? (
          <View style={[styles.applied, { backgroundColor: colors.primarySoft }]}>
            <View>
              <Text style={[styles.appliedCode, { color: colors.primary }]}>{promoCode}</Text>
              <Text style={[styles.appliedText, { color: colors.textMuted }]}>{discountPercent}% off your food subtotal</Text>
            </View>
            <Pressable onPress={removePromo}><Text style={[styles.removePromo, { color: colors.danger }]}>Remove</Text></Pressable>
          </View>
        ) : (
          <View style={styles.promoRow}>
            <TextInput
              value={promoInput}
              onChangeText={(value) => { setPromoInput(value.toUpperCase()); setPromoMessage(''); }}
              placeholder="e.g. ZAHID10"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              style={[styles.promoInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            />
            <AppButton title="Apply" onPress={submitPromo} disabled={!promoInput.trim()} style={styles.applyButton} />
          </View>
        )}
        {promoMessage ? <Text style={[styles.promoMessage, { color: promoMessage.includes('not valid') ? colors.danger : colors.success }]}>{promoMessage}</Text> : null}
        <Text style={[styles.hint, { color: colors.textMuted }]}>Demo codes: ZAHID10 or DINNER15</Text>
      </View>

      <View style={[styles.summary, { backgroundColor: colors.primary }]}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>Rs {subtotal.toLocaleString()}</Text></View>
        {discountPercent ? <View style={styles.summaryRow}><Text style={styles.discountLabel}>Promo discount</Text><Text style={styles.discountValue}>− Rs {discount.toLocaleString()}</Text></View> : null}
        <View style={styles.divider} />
        <View style={styles.summaryRow}><Text style={styles.totalLabel}>Preview total</Text><Text style={styles.totalValue}>Rs {previewTotal.toLocaleString()}</Text></View>
        <Text style={styles.feeNote}>Service charge and sales tax are calculated on the next screen.</Text>
        <AppButton title="Review order & checkout" onPress={() => navigation.navigate('OrderSummary')} style={styles.checkout} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <ScreenHeader
            eyebrow="Your order"
            title="Cart"
            subtitle="Adjust quantities and add instructions."
            right={<Pressable onPress={confirmClear}><Text style={[styles.clearText, { color: colors.danger }]}>Clear all</Text></Pressable>}
          />
        }
        ListFooterComponent={footer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingTop: 20, paddingBottom: 110 },
  clearText: { fontSize: 12, fontWeight: '900' },
  promoCard: { marginTop: 5, borderWidth: 1, borderRadius: 18, padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 11 },
  promoRow: { flexDirection: 'row', gap: 9 },
  promoInput: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, fontWeight: '800' },
  applyButton: { minHeight: 48 },
  applied: { borderRadius: 13, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appliedCode: { fontSize: 15, fontWeight: '900' },
  appliedText: { fontSize: 11, marginTop: 3 },
  removePromo: { fontSize: 12, fontWeight: '900' },
  promoMessage: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  hint: { fontSize: 11, marginTop: 9 },
  summary: { borderRadius: 21, padding: 18, marginTop: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#C9D8DC', fontSize: 13 },
  summaryValue: { color: '#FFFFFF', fontWeight: '800' },
  discountLabel: { color: '#F2C5AD', fontSize: 13 },
  discountValue: { color: '#F2C5AD', fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 5 },
  totalLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  totalValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  feeNote: { color: '#C9D8DC', fontSize: 10, lineHeight: 15 },
  checkout: { marginTop: 14 },
  emptyScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyMark: { width: 76, height: 76, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { fontSize: 22, fontWeight: '900', marginTop: 18 },
  emptyText: { maxWidth: 280, textAlign: 'center', lineHeight: 20, marginTop: 7 },
  browse: { marginTop: 20, minWidth: 180 },
});
