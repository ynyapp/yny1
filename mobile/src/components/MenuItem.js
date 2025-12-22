import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MenuItem = ({ item, onAdd, onRemove, quantity = 0 }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>₺{item.price}</Text>
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          )}
        </View>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}
      </View>
      
      {quantity > 0 ? (
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={onRemove}>
            <Ionicons name="remove" size={18} color="#DC2626" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={onAdd}>
            <Ionicons name="add" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>EKLE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
});

export default MenuItem;
