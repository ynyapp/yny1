import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetail, cancelOrder } from '../store/slices/orderSlice';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const { selectedOrder: order, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrderDetail(orderId));
  }, [orderId, dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'pending':
        return '#FFA500';
      case 'Confirmed':
      case 'confirmed':
        return '#4CAF50';
      case 'Preparing':
      case 'preparing':
        return '#2196F3';
      case 'On the way':
      case 'on_the_way':
        return '#9C27B0';
      case 'Delivered':
      case 'delivered':
        return '#4CAF50';
      case 'Cancelled':
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
      case 'pending':
        return 'Beklemede';
      case 'Confirmed':
      case 'confirmed':
        return 'Onaylandı';
      case 'Preparing':
      case 'preparing':
        return 'Hazırlanıyor';
      case 'On the way':
      case 'on_the_way':
        return 'Yolda';
      case 'Delivered':
      case 'delivered':
        return 'Teslim Edildi';
      case 'Cancelled':
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sipariş Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
          <Text style={styles.statusSubtext}>
            Sipariş No: #{order.id?.slice(0, 8)}
          </Text>
        </View>

        {/* Restaurant Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restoran</Text>
          <View style={styles.restaurantInfo}>
            <Ionicons name="restaurant" size={20} color="#DC2626" />
            <Text style={styles.restaurantName}>{order.restaurant_name || 'Restoran'}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sipariş İçeriği</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name || 'Ürün'}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.price * item.quantity} ₺</Text>
            </View>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teslimat Bilgileri</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.infoText}>{order.delivery_address || 'Adres bilgisi yok'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#666" />
            <Text style={styles.infoText}>
              {new Date(order.created_at).toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Ara Toplam</Text>
            <Text style={styles.priceValue}>{order.subtotal || order.total - 20} ₺</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Teslimat</Text>
            <Text style={styles.priceValue}>15 ₺</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Servis Ücreti</Text>
            <Text style={styles.priceValue}>5 ₺</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{order.total} ₺</Text>
          </View>
          <View style={styles.paymentMethod}>
            <Ionicons name="card" size={20} color="#666" />
            <Text style={styles.paymentText}>{order.payment_method || 'Nakit'}</Text>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sipariş Notu</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#999',
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
    color: '#333',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#DC2626',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
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
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  paymentText: {
    fontSize: 14,
    marginLeft: 12,
    color: '#666',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default OrderDetailScreen;
