import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart } from '../store/slices/cartSlice';

const CheckoutScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, total, subtotal, deliveryFee, restaurant } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.order);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Nakit');
  const [orderNotes, setOrderNotes] = useState('');

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Hata', 'Lütfen teslimat adresi girin');
      return;
    }

    try {
      const orderData = {
        restaurant_id: restaurant.id,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: total,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        notes: orderNotes,
      };

      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      Alert.alert(
        'Başarılı',
        'Siparişiniz alındı!',
        [{ text: 'Tamam', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      Alert.alert('Hata', error || 'Sipariş oluşturulamadı');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Sipariş vermek için giriş yapmalısınız</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sipariş Özeti</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restoran</Text>
          <Text style={styles.restaurantName}>{restaurant?.name}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sipariş Detayı</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.itemPrice}>{item.price * item.quantity} ₺</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teslimat Adresi</Text>
          <TextInput
            style={styles.input}
            placeholder="Adres girin"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme Yöntemi</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'Nakit' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('Nakit')}
            >
              <Text style={styles.paymentMethodText}>Nakit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'Kredi Kartı' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('Kredi Kartı')}
            >
              <Text style={styles.paymentMethodText}>Kredi Kartı</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sipariş Notu (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Notunuz"
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Ara Toplam</Text>
            <Text style={styles.priceValue}>{subtotal} ₺</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Teslimat Ücreti</Text>
            <Text style={styles.priceValue}>{deliveryFee} ₺</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{total} ₺</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderButtonText}>Siparişi Tamamla</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethod: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  paymentMethodActive: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  placeOrderButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    paddingHorizontal: 32,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    margin: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
