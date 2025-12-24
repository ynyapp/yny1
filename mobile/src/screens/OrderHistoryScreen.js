import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';

const OrderHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

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

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.restaurantName}>{item.restaurant_name || 'Restoran'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.orderDate}>
        {new Date(item.created_at).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>

      <View style={styles.orderItems}>
        {item.items?.slice(0, 2).map((orderItem, index) => (
          <Text key={index} style={styles.itemText}>
            {orderItem.quantity}x {orderItem.name || 'Ürün'}
          </Text>
        ))}
        {item.items?.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} ürün daha</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalPrice}>{item.total} ₺</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
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
        <Text style={styles.headerTitle}>Siparişlerim</Text>
        <View style={{ width: 24 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>Henüz sipariş yok</Text>
          <Text style={styles.emptySubtext}>İlk siparişinizi verin!</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Restoranları Keşfet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  browseButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;
