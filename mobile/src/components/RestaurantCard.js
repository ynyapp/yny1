import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RestaurantCard = ({ restaurant, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: restaurant.image }} style={styles.image} />
      
      {/* Badges */}
      <View style={styles.badgesContainer}>
        {restaurant.isPromoted && (
          <View style={styles.promotedBadge}>
            <Text style={styles.promotedText}>{restaurant.promotionText}</Text>
          </View>
        )}
        {restaurant.isGoldPartner && (
          <View style={styles.goldBadge}>
            <Text style={styles.goldText}>👑 Gold</Text>
          </View>
        )}
      </View>

      {/* Rating */}
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={14} color="#FFA500" />
        <Text style={styles.ratingText}>{restaurant.rating || 'N/A'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.cuisine} numberOfLines={1}>{restaurant.cuisine}</Text>
        
        {/* Offers */}
        {restaurant.offers && restaurant.offers.length > 0 && (
          <View style={styles.offerContainer}>
            <Text style={styles.offerText}>💰 {restaurant.offers[0]}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{restaurant.deliveryTime}</Text>
          </View>
          {restaurant.distance && (
            <Text style={styles.distance}>📍 {restaurant.distance} km</Text>
          )}
          <Text style={styles.price}>{restaurant.priceRange}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badgesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 8,
  },
  promotedBadge: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  promotedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  goldBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  goldText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  offerContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  offerText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  distance: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  price: {
    fontSize: 12,
    color: '#999',
  },
});

export default RestaurantCard;
