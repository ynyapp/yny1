import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      setCartItems(parsed.items || []);
      setRestaurantId(parsed.restaurantId || null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items: cartItems, restaurantId }));
  }, [cartItems, restaurantId]);

  const addToCart = (item, restaurant) => {
    // If cart is from different restaurant, clear it
    if (restaurantId && restaurantId !== restaurant.id) {
      if (!window.confirm('Sepetinizde başka bir restorandan ürünler var. Sepeti temizlemek istiyor musunuz?')) {
        return;
      }
      setCartItems([]);
    }

    setRestaurantId(restaurant.id);

    const existingItem = cartItems.find(i => i.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1, restaurantName: restaurant.name }]);
    }
  };

  const removeFromCart = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item.quantity > 1) {
      setCartItems(cartItems.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ));
    } else {
      setCartItems(cartItems.filter(i => i.id !== itemId));
      if (cartItems.length === 1) {
        setRestaurantId(null);
      }
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getItemCount,
      restaurantId
    }}>
      {children}
    </CartContext.Provider>
  );
};