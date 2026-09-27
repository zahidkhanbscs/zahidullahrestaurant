import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';
import { useTheme } from '../context/ThemeContext';

function MenuItemCard({ item, isFavourite, onToggleFavourite, onAdd }) {
  const { colors } = useTheme();
  console.log(`MenuItemCard render: ${item.name}`);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: item.isAvailable ? 1 : 0.58 }]}>
      <View>
        <Image source={item.image} style={styles.image} />
        {!item.isAvailable ? (
          <View style={[styles.unavailableOverlay, { backgroundColor: colors.overlay }]}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          onPress={() => onToggleFavourite(item.id)}
          style={[styles.favourite, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.heart, { color: isFavourite ? colors.accent : colors.textMuted }]}>{isFavourite ? '♥' : '♡'}</Text>
        </Pressable>
        {item.isSpecial ? <Text style={[styles.badge, { backgroundColor: colors.accent }]}>{"CHEF'S PICK"}</Text> : null}
      </View>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.price, { color: colors.accent }]}>Rs {item.price.toLocaleString()}</Text>
        </View>
        <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.footer}>
          <Text style={[styles.category, { color: colors.primary, backgroundColor: colors.primarySoft }]}>{item.category}</Text>
          <AppButton
            title={item.isAvailable ? 'Add +' : 'Sold out'}
            disabled={!item.isAvailable}
            onPress={() => onAdd(item)}
            style={styles.addButton}
          />
        </View>
      </View>
    </View>
  );
}

export default React.memo(MenuItemCard);

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 16 },
  image: { width: '100%', height: 180 },
  unavailableOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  unavailableText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  favourite: { position: 'absolute', right: 12, top: 12, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  heart: { fontSize: 24, lineHeight: 27 },
  badge: { position: 'absolute', left: 12, top: 14, color: '#FFFFFF', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  content: { padding: 15 },
  nameRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  name: { flex: 1, fontSize: 18, fontWeight: '900' },
  price: { fontSize: 16, fontWeight: '900' },
  description: { fontSize: 13, lineHeight: 19, marginTop: 7 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  category: { overflow: 'hidden', borderRadius: 9, paddingVertical: 6, paddingHorizontal: 9, fontSize: 11, fontWeight: '800' },
  addButton: { minHeight: 38, borderRadius: 11, paddingHorizontal: 14 },
});
