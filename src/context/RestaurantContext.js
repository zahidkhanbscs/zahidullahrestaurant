import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialMenu } from '../data/menu';

const RestaurantContext = createContext(null);
const MENU_KEY = '@zahid_restaurant/menu';
const RESERVATIONS_KEY = '@zahid_restaurant/reservations';
const fallbackMenuImage = require('../../assets/icon.png');

export function RestaurantProvider({ children }) {
  const [menu, setMenu] = useState(initialMenu);
  const [reservations, setReservations] = useState([]);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const [storedMenu, storedReservations] = await Promise.all([
          AsyncStorage.getItem(MENU_KEY),
          AsyncStorage.getItem(RESERVATIONS_KEY),
        ]);
        if (!active) return;
        if (storedMenu) setMenu(JSON.parse(storedMenu));
        if (storedReservations) setReservations(JSON.parse(storedReservations));
      } catch (error) {
        console.warn('Could not restore restaurant data.', error);
      } finally {
        if (active) setIsRestoring(false);
      }
    }
    restore();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isRestoring) AsyncStorage.setItem(MENU_KEY, JSON.stringify(menu)).catch((error) => console.warn('Could not save menu.', error));
  }, [isRestoring, menu]);

  useEffect(() => {
    if (!isRestoring) AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations)).catch((error) => console.warn('Could not save reservations.', error));
  }, [isRestoring, reservations]);

  const editMenuPrice = useCallback((id, price) => {
    setMenu((current) => current.map((item) => item.id === id ? { ...item, price } : item));
  }, []);
  const toggleMenuAvailability = useCallback((id) => {
    setMenu((current) => current.map((item) => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item));
  }, []);
  const addMenuItem = useCallback((item) => {
    setMenu((current) => [...current, {
      id: `manager-${Date.now()}`,
      name: item.name.trim(),
      description: item.description.trim() || 'A new Zahid Restaurant creation.',
      price: Number(item.price),
      category: item.category,
      image: fallbackMenuImage,
      isSpecial: false,
      isAvailable: true,
    }]);
  }, []);
  const addReservation = useCallback((reservation) => setReservations((current) => [reservation, ...current]), []);
  const cancelReservation = useCallback((id) => {
    setReservations((current) => current.map((item) => item.id === id ? { ...item, status: 'Cancelled' } : item));
  }, []);
  const updateReservationStatus = useCallback((id, status) => {
    setReservations((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }, []);

  const value = useMemo(() => ({
    menu, reservations, isRestoring, editMenuPrice, toggleMenuAvailability,
    addMenuItem, addReservation, cancelReservation, updateReservationStatus,
  }), [addMenuItem, addReservation, cancelReservation, editMenuPrice, isRestoring, menu, reservations, toggleMenuAvailability, updateReservationStatus]);
  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used inside RestaurantProvider.');
  return context;
}
