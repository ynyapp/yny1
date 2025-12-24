import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    restaurant: null,
    subtotal: 0,
    deliveryFee: 15,
    serviceFee: 5,
    total: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { item, restaurant } = action.payload;
      
      // Check if different restaurant
      if (state.restaurant && state.restaurant.id !== restaurant.id) {
        state.items = [{ ...item, quantity: 1 }];
        state.restaurant = restaurant;
      } else {
        state.restaurant = restaurant;
        const existingItem = state.items.find(i => i.id === item.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.items.push({ ...item, quantity: 1 });
        }
      }
      
      // Recalculate totals
      state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.total = state.subtotal + state.deliveryFee + state.serviceFee;
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const existingItem = state.items.find(i => i.id === itemId);
      
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          state.items = state.items.filter(i => i.id !== itemId);
        }
      }
      
      if (state.items.length === 0) {
        state.restaurant = null;
      }
      
      // Recalculate totals
      state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.total = state.subtotal + state.deliveryFee + state.serviceFee;
    },
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(i => i.id === itemId);
      
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
      
      // Recalculate totals
      state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.total = state.subtotal + state.deliveryFee + state.serviceFee;
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
      state.subtotal = 0;
      state.total = state.deliveryFee + state.serviceFee;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
