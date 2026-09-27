export const initialOrdersState = { orders: [] };

export function ordersReducer(state, action) {
  switch (action.type) {
    case 'RESTORE_ORDERS': return { orders: action.payload };
    case 'PLACE_ORDER': return { orders: [action.payload, ...state.orders] };
    case 'UPDATE_STATUS': return { orders: state.orders.map((order) => order.id === action.payload.id ? { ...order, status: action.payload.status } : order) };
    default: return state;
  }
}
