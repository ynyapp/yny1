import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantDetail } from '../store/slices/restaurantSlice';
import { addToCart, removeFromCart } from '../store/slices/cartSlice';
import { restaurantService } from '../services/restaurantService';
import MenuItem from '../components/MenuItem';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const dispatch = useDispatch();
  const { selectedRestaurant: restaurant, loading } = useSelector((state) => state.restaurant);
  const { items: cartItems } = useSelector((state) => state.cart);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      await dispatch(fetchRestaurantDetail(restaurantId));
      const menuData = await restaurantService.getRestaurantMenu(restaurantId);
      
      // Group menu by category
      const grouped = (menuData || []).reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {});
      
      const sections = Object.keys(grouped).map(category => ({
        title: category,
        data: grouped[category],
      }));
      
      setMenu(sections);
    } catch (error) {
      console.error('Error loading restaurant:', error);
    }
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text>Restoran bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Hero Image */}
      <Image source={{ uri: restaurant.image }} style={styles.heroImage} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color="#FFA500" />
              <Text style={styles.statText}>{restaurant.rating}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statText}>{restaurant.priceRange}</Text>
            </View>
          </View>

          {restaurant.offers && restaurant.offers.length > 0 && (
            <View style={styles.offersContainer}>
              {restaurant.offers.map((offer, index) => (
                <View key={index} style={styles.offerBadge}>
                  <Text style={styles.offerText}>💰 {offer}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menü</Text>
          {menu.map((section, index) => (
            <View key={index} style={styles.menuSection}>
              <Text style={styles.categoryTitle}>{section.title}</Text>
              {section.data.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  onAdd={() => addToCart(item, restaurant)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Cart Button */}
      {getCartCount() > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
          </View>
          <Text style={styles.cartButtonText}>Sepete Git</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#333',
  },
  offersContainer: {
    gap: 8,
  },
  offerBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  offerText: {
    color: '#1976D2',
    fontSize: 13,
    fontWeight: '600',
  },
  menuContainer: {
    padding: 16,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuSection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  cartBadge: {
    backgroundColor: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RestaurantDetailScreen;
