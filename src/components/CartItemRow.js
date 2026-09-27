import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function CartItemRow({ item, onIncrement, onDecrement, onRemove, onUpdateNote }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.top}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.copy}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.price, { color: colors.accent }]}>Rs {(item.price * item.quantity).toLocaleString()}</Text>
        </View>
        <Pressable onPress={() => onRemove(item.id)} hitSlop={10}>
          <Text style={[styles.remove, { color: colors.danger }]}>Remove</Text>
        </Pressable>
      </View>
      <View style={styles.controls}>
        <View style={[styles.stepper, { borderColor: colors.border }]}>
          <Pressable style={styles.step} onPress={() => onDecrement(item.id)}><Text style={[styles.symbol, { color: colors.primary }]}>−</Text></Pressable>
          <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
          <Pressable style={styles.step} onPress={() => onIncrement(item.id)}><Text style={[styles.symbol, { color: colors.primary }]}>+</Text></Pressable>
        </View>
        <Text style={[styles.unit, { color: colors.textMuted }]}>Rs {item.price.toLocaleString()} each</Text>
      </View>
      <TextInput
        value={item.note}
        onChangeText={(note) => onUpdateNote(item.id, note)}
        placeholder="Special instructions (optional)"
        placeholderTextColor={colors.textMuted}
        style={[styles.note, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
      />
    </View>
  );
}

export default React.memo(CartItemRow);

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 13, borderWidth: 1, marginBottom: 13 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  image: { width: 66, height: 66, borderRadius: 12 },
  copy: { flex: 1 },
  name: { fontSize: 15, fontWeight: '900' },
  price: { fontSize: 14, fontWeight: '800', marginTop: 5 },
  remove: { fontSize: 12, fontWeight: '800' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  stepper: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  step: { width: 38, height: 36, alignItems: 'center', justifyContent: 'center' },
  symbol: { fontSize: 21, fontWeight: '800' },
  quantity: { minWidth: 26, textAlign: 'center', fontWeight: '900' },
  unit: { fontSize: 12 },
  note: { marginTop: 12, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
});
