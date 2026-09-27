export const initialCartState = { items: [], promoCode: '', discountPercent: 0 };

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((entry) => entry.id === action.payload.id);
      if (existing) return { ...state, items: state.items.map((entry) => entry.id === action.payload.id ? { ...entry, quantity: entry.quantity + 1 } : entry) };
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1, note: '' }] };
    }
    case 'REMOVE_ITEM': return { ...state, items: state.items.filter((entry) => entry.id !== action.payload) };
    case 'INCREMENT': return { ...state, items: state.items.map((entry) => entry.id === action.payload ? { ...entry, quantity: entry.quantity + 1 } : entry) };
    case 'DECREMENT': return { ...state, items: state.items.map((entry) => entry.id === action.payload ? { ...entry, quantity: entry.quantity - 1 } : entry).filter((entry) => entry.quantity > 0) };
    case 'UPDATE_NOTE': return { ...state, items: state.items.map((entry) => entry.id === action.payload.id ? { ...entry, note: action.payload.note } : entry) };
    case 'CLEAR_CART': return initialCartState;
    case 'APPLY_PROMO': return { ...state, promoCode: action.payload.code, discountPercent: action.payload.discountPercent };
    case 'REMOVE_PROMO': return { ...state, promoCode: '', discountPercent: 0 };
    default: return state;
  }
}
