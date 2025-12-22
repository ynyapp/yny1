import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [cartItems, restaurant]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const { items, rest } = JSON.parse(cartData);
        setCartItems(items || []);
        setRestaurant(rest || null);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify({ items: cartItems, rest: restaurant }));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item, restaurantData) => {
    // Check if different restaurant
    if (restaurant && restaurant.id !== restaurantData.id) {
      // Clear cart and start new
      setCartItems([{ ...item, quantity: 1 }]);
      setRestaurant(restaurantData);
      return;
    }

    setRestaurant(restaurantData);
    const existingItem = cartItems.find(i => i.id === item.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cartItems.find(i => i.id === itemId);
    
    if (existingItem.quantity > 1) {
      setCartItems(cartItems.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ));
    } else {
      const newItems = cartItems.filter(i => i.id !== itemId);
      setCartItems(newItems);
      if (newItems.length === 0) {
        setRestaurant(null);
      }
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      restaurant,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
