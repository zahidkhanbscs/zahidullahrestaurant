import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import MenuItemCard from '../components/MenuItemCard';
import ScreenHeader from '../components/ScreenHeader';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useTheme } from '../context/ThemeContext';
import { menuCategories } from '../data/menu';
import { useDebounce } from '../hooks/useDebounce';

const sortOptions = [
  { key: 'default', label: 'Featured' },
  { key: 'low', label: 'Price Low to High' },
  { key: 'high', label: 'Price High to Low' },
  { key: 'name', label: 'Name A-Z' },
  { key: 'favourites', label: 'Favourites Only' },
];

export default function MenuScreen() {
  const { colors } = useTheme();
  const { menu } = useRestaurant();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [favourites, setFavourites] = useState(() => new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [notice, setNotice] = useState('');
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const previousQueryRef = useRef('');
  const renderCount = useRenderCount();
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Array.isArray(menu)) {
        setError('');
        setLoading(false);
      } else {
        setError('The menu could not be loaded.');
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [loadAttempt, menu]);

  const retryLoad = useCallback(() => {
    setError('');
    setLoading(true);
    setLoadAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const cleaned = debouncedQuery.trim();
    if (cleaned && cleaned.toLowerCase() !== previousQueryRef.current.toLowerCase()) {
      setRecentSearches((current) => [cleaned, ...current.filter((entry) => entry.toLowerCase() !== cleaned.toLowerCase())].slice(0, 5));
      previousQueryRef.current = cleaned;
    }
  }, [debouncedQuery]);

  const filteredMenu = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    let result = menu.filter((item) => {
      const categoryMatches = category === 'All' || item.category === category;
      const searchMatches = !needle || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(needle);
      const favouriteMatches = sort !== 'favourites' || favourites.has(item.id);
      return categoryMatches && searchMatches && favouriteMatches;
    });
    if (sort === 'low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'high') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [category, debouncedQuery, favourites, menu, sort]);

  const toggleFavourite = useCallback((id) => {
    setFavourites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const handleAdd = useCallback((item) => {
    addItem(item);
    setNotice(`${item.name} added to cart`);
    setTimeout(() => setNotice(''), 1600);
  }, [addItem]);
  const applyRecent = useCallback((value) => {
    setQuery(value);
    searchInputRef.current?.focus();
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError('');
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);
  const renderItem = useCallback(({ item }) => (
    <MenuItemCard
      item={item}
      isFavourite={favourites.has(item.id)}
      onToggleFavourite={toggleFavourite}
      onAdd={handleAdd}
    />
  ), [favourites, handleAdd, toggleFavourite]);

  const header = (
    <View>
      <ScreenHeader eyebrow="Zahid Restaurant" title="Explore our menu" subtitle="Freshly prepared plates with bold, modern flavour." />
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: focused ? colors.primary : colors.border }]}>
        <Text style={[styles.searchIcon, { color: colors.accent }]}>⌕</Text>
        <TextInput
          ref={searchInputRef}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search dishes, flavours, categories…"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
        />
        {query ? <Pressable onPress={() => setQuery('')}><Text style={[styles.clear, { color: colors.textMuted }]}>×</Text></Pressable> : null}
      </View>
      {focused && !query && recentSearches.length ? (
        <View style={[styles.recentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.recentTitle, { color: colors.textMuted }]}>RECENT SEARCHES</Text>
          {recentSearches.map((entry) => (
            <Pressable key={entry} onPress={() => applyRecent(entry)} style={styles.recentRow}>
              <Text style={[styles.clock, { color: colors.accent }]}>↺</Text>
              <Text style={[styles.recentText, { color: colors.text }]}>{entry}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {menuCategories.map((item) => {
          const selected = category === item;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border }]}
            >
              <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={[styles.sortLabel, { color: colors.textMuted }]}>SORT & FILTER</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sorts}>
        {sortOptions.map((option) => {
          const selected = sort === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setSort(option.key)}
              style={[styles.sortChip, { backgroundColor: selected ? colors.accentSoft : 'transparent', borderColor: selected ? colors.accent : colors.border }]}
            >
              <Text style={[styles.sortText, { color: selected ? colors.accent : colors.textMuted }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.resultRow}>
        <Text style={[styles.count, { color: colors.text }]}>{filteredMenu.length} {filteredMenu.length === 1 ? 'item' : 'items'}</Text>
        <Text style={[styles.renderCount, { color: colors.primary, backgroundColor: colors.primarySoft }]}>Render #{renderCount}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingTitle, { color: colors.text }]}>Preparing today’s menu</Text>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>One delicious moment…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={[styles.loadingTitle, { color: colors.text }]}>Menu unavailable</Text>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>{error}</Text>
        <Pressable onPress={retryLoad} style={[styles.retry, { backgroundColor: colors.accent }]}><Text style={styles.retryText}>Retry</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={filteredMenu}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No dishes found</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Try another search, category, or show all favourites.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
        onScroll={(event) => setShowBackToTop(event.nativeEvent.contentOffset.y > 300)}
        scrollEventThrottle={80}
      />
      {notice ? <Text style={[styles.notice, { backgroundColor: colors.primary }]}>{notice}</Text> : null}
      {showBackToTop ? (
        <Pressable onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} style={[styles.backTop, { backgroundColor: colors.accent }]}>
          <Text style={styles.backTopText}>↑ Top</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function useRenderCount() {
  const renderCountRef = useRef(0);
  // The assignment explicitly asks for a ref-backed counter that increments per render.
  /* eslint-disable react-hooks/refs */
  renderCountRef.current += 1;
  return renderCountRef.current;
  /* eslint-enable react-hooks/refs */
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 110 },
  center: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { fontSize: 19, fontWeight: '900', marginTop: 16, textAlign: 'center' },
  loadingText: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  errorIcon: { backgroundColor: '#C65D2E', color: '#FFFFFF', width: 48, height: 48, borderRadius: 24, textAlign: 'center', lineHeight: 48, fontSize: 25, fontWeight: '900' },
  retry: { borderRadius: 13, paddingVertical: 12, paddingHorizontal: 25, marginTop: 18 },
  retryText: { color: '#FFFFFF', fontWeight: '900' },
  searchBox: { minHeight: 52, borderWidth: 1.5, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  searchIcon: { fontSize: 25, marginRight: 8, transform: [{ rotate: '-20deg' }] },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 12 },
  clear: { fontSize: 26, paddingLeft: 8 },
  recentBox: { borderWidth: 1, borderRadius: 15, marginTop: 7, padding: 13 },
  recentTitle: { fontSize: 10, letterSpacing: 1.2, fontWeight: '900', marginBottom: 5 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  clock: { fontSize: 17 },
  recentText: { fontSize: 14, fontWeight: '600' },
  chips: { gap: 9, paddingVertical: 16 },
  chip: { borderRadius: 999, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 16 },
  chipText: { fontSize: 13, fontWeight: '800' },
  sortLabel: { fontSize: 10, letterSpacing: 1.2, fontWeight: '900' },
  sorts: { gap: 8, paddingTop: 8, paddingBottom: 15 },
  sortChip: { borderRadius: 10, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 10 },
  sortText: { fontSize: 11, fontWeight: '800' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  count: { fontSize: 15, fontWeight: '900' },
  renderCount: { overflow: 'hidden', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', borderWidth: 1, borderRadius: 20, padding: 30, marginTop: 8 },
  emptyIcon: { fontSize: 38 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginTop: 8 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 5 },
  notice: { position: 'absolute', left: 20, right: 20, bottom: 84, color: '#FFFFFF', textAlign: 'center', padding: 12, borderRadius: 12, fontWeight: '800', overflow: 'hidden' },
  backTop: { position: 'absolute', right: 18, bottom: 24, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 15 },
  backTopText: { color: '#FFFFFF', fontWeight: '900' },
});
