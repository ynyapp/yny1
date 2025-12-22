import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService } from '../services/restaurantService';
import RestaurantCard from '../components/RestaurantCard';

const HomeScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [restaurantsData, collectionsData] = await Promise.all([
        restaurantService.getRestaurants({ city: 'İstanbul', page_size: 20 }),
        restaurantService.getCollections(),
      ]);
      setRestaurants(restaurantsData.items || restaurantsData);
      setCollections(collectionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cuisineCategories = [
    { name: 'Pizza', icon: '🍕' },
    { name: 'Burger', icon: '🍔' },
    { name: 'Balık', icon: '🐟' },
    { name: 'Kebap', icon: '🥙' },
    { name: 'İtalyan', icon: '🍝' },
    { name: 'Tatlı', icon: '🍰' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#DC2626" />
          <Text style={styles.locationText}>İstanbul</Text>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Restoran, mutfak veya yemek ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => navigation.navigate('Search')}
          />
        </View>

        {/* Cuisine Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {cuisineCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => navigation.navigate('Search', { cuisine: category.name })}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Collections */}
        {collections.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Koleksiyonlar</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionsContent}
            >
              {collections.map((collection) => (
                <TouchableOpacity key={collection.id} style={styles.collectionCard}>
                  <Text style={styles.collectionTitle}>{collection.title}</Text>
                  <Text style={styles.collectionCount}>
                    {collection.restaurantCount} restoran
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popüler Restoranlar</Text>
          </View>
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
            />
          ))}
        </View>
      </ScrollView>
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
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 70,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  collectionsContent: {
    gap: 12,
  },
  collectionCard: {
    backgroundColor: '#DC2626',
    width: 150,
    height: 100,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'flex-end',
  },
  collectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  collectionCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
});

export default HomeScreen;
