import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { promoCodes } from '../data/promoCodes';
import { cartReducer, initialCartState } from '../reducers/cartReducer';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const itemCount = useMemo(() => state.items.reduce((sum, item) => sum + item.quantity, 0), [state.items]);
  const subtotal = useMemo(() => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0), [state.items]);
  const addItem = useCallback((item) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const increment = useCallback((id) => dispatch({ type: 'INCREMENT', payload: id }), []);
  const decrement = useCallback((id) => dispatch({ type: 'DECREMENT', payload: id }), []);
  const updateNote = useCallback((id, note) => dispatch({ type: 'UPDATE_NOTE', payload: { id, note } }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const removePromo = useCallback(() => dispatch({ type: 'REMOVE_PROMO' }), []);
  const applyPromo = useCallback((rawCode) => {
    const code = rawCode.trim().toUpperCase();
    const discountPercent = promoCodes[code];
    if (!discountPercent) return { success: false, message: 'That promo code is not valid.' };
    dispatch({ type: 'APPLY_PROMO', payload: { code, discountPercent } });
    return { success: true, message: `${discountPercent}% discount applied.` };
  }, []);
  const value = useMemo(() => ({
    ...state, itemCount, subtotal, addItem, removeItem, increment, decrement,
    updateNote, clearCart, applyPromo, removePromo,
  }), [addItem, applyPromo, clearCart, decrement, increment, itemCount, removeItem, removePromo, state, subtotal, updateNote]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
