import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import restaurantReducer from './slices/restaurantSlice';
import reviewReducer from './slices/reviewSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import reservationReducer from './slices/reservationSlice';
import userReducer from './slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  restaurant: restaurantReducer,
  review: reviewReducer,
  order: orderReducer,
  cart: cartReducer,
  reservation: reservationReducer,
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart'], // Only persist auth and cart
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
