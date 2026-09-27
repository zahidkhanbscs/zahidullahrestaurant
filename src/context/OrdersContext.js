import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { initialOrdersState, ordersReducer } from '../reducers/ordersReducer';

const OrdersContext = createContext(null);
const ORDERS_KEY = '@zahid_restaurant/orders';
export const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];
const DEMO_STEP_MS = 8000;

export function OrdersProvider({ children }) {
  const [state, dispatch] = useReducer(ordersReducer, initialOrdersState);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(ORDERS_KEY)
      .then((saved) => {
        if (active && saved) dispatch({ type: 'RESTORE_ORDERS', payload: JSON.parse(saved) });
      })
      .catch((error) => console.warn('Could not restore orders.', error))
      .finally(() => { if (active) setIsRestoring(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isRestoring) AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(state.orders)).catch((error) => console.warn('Could not save orders.', error));
  }, [isRestoring, state.orders]);

  useEffect(() => {
    const timers = state.orders.map((order) => {
      const index = ORDER_STATUSES.indexOf(order.status);
      if (index < 0 || index === ORDER_STATUSES.length - 1) return null;
      return setTimeout(() => {
        dispatch({ type: 'UPDATE_STATUS', payload: { id: order.id, status: ORDER_STATUSES[index + 1] } });
      }, DEMO_STEP_MS);
    }).filter(Boolean);
    return () => timers.forEach(clearTimeout);
  }, [state.orders]);

  const placeOrder = useCallback((details) => {
    const order = {
      id: `ZR-${Date.now().toString().slice(-6)}`,
      customerId: details.customerId,
      items: details.items,
      total: details.total,
      type: details.type,
      fulfillmentInfo: details.fulfillmentInfo,
      status: 'Pending',
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'PLACE_ORDER', payload: order });
    return order;
  }, []);
  const updateOrderStatus = useCallback((id, status) => dispatch({ type: 'UPDATE_STATUS', payload: { id, status } }), []);
  const value = useMemo(() => ({ orders: state.orders, isRestoring, placeOrder, updateOrderStatus }), [isRestoring, placeOrder, state.orders, updateOrderStatus]);
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used inside OrdersProvider.');
  return context;
}
