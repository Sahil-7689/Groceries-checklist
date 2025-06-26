import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';

interface GroceryItem {
  id: string;
  name: string;
  purchased: boolean;
}

const HomeScreen = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [input, setInput] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const addItem = () => {
    if (input.trim() === '') return;
    setItems([
      ...items,
      { id: Date.now().toString(), name: input.trim(), purchased: false },
    ]);
    setInput('');
  };

  const togglePurchased = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const onLongPressItem = (id: string) => {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const onSelectItem = (id: string) => {
    if (!selectionMode) return;
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      if (newSet.size === 0) setSelectionMode(false);
      return newSet;
    });
  };

  const deleteSelected = () => {
    setItems(items.filter(item => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const shareList = async () => {
    if (items.length === 0) return;
    
    const purchasedItems = items.filter(item => item.purchased);
    const unpurchasedItems = items.filter(item => !item.purchased);
    
    let shareText = '🛒 Grocery List\n\n';
    
    if (unpurchasedItems.length > 0) {
      shareText += '📝 To Buy:\n';
      unpurchasedItems.forEach(item => {
        shareText += `• ${item.name}\n`;
      });
      shareText += '\n';
    }
    
    if (purchasedItems.length > 0) {
      shareText += '✅ Purchased:\n';
      purchasedItems.forEach(item => {
        shareText += `• ${item.name}\n`;
      });
    }
    
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to general sharing
        await Linking.openURL(`mailto:?subject=Grocery List&body=${encodeURIComponent(shareText)}`);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="basket-outline" size={48} color="#10b981" />
      </View>
      <Text style={styles.emptyTitle}>Your list is empty</Text>
      <Text style={styles.emptySubtitle}>Start adding items to your grocery list</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#4ade80', '#10b981']}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Grocery List</Text>
          <TouchableOpacity style={styles.shareButton} onPress={shareList}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main content */}
      <View style={styles.mainContent}>
        {items.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <View
                  style={[
                    styles.itemCard,
                    item.purchased && styles.completedItem,
                    selectionMode && isSelected && styles.selectedItemRow,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => selectionMode ? onSelectItem(item.id) : togglePurchased(item.id)}
                    onLongPress={() => onLongPressItem(item.id)}
                    style={styles.checkboxContainer}
                  >
                    <Ionicons
                      name={item.purchased ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={item.purchased ? '#10b981' : '#9ca3af'}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.itemText,
                      item.purchased && styles.completedText,
                      selectionMode && isSelected && styles.selectedText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {!selectionMode && (
                    <TouchableOpacity onPress={() => deleteItem(item.id)}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: selectionMode && selectedIds.size > 0 ? 130 : 80 }}
          />
        )}
      </View>

      {/* Delete Selected Button */}
      {selectionMode && selectedIds.size > 0 && (
        <View style={styles.deleteSelectedFooter}>
          <TouchableOpacity style={styles.deleteSelectedButton} onPress={deleteSelected}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.deleteSelectedText}>Delete Selected ({selectedIds.size})</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Footer */}
      <View style={styles.inputFooter}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add new item"
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addItem}
          />
        </View>
        <TouchableOpacity 
          style={[styles.addButton, input.trim() === '' && styles.addButtonDisabled]} 
          onPress={addItem}
          disabled={input.trim() === ''}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Background Cart */}
      <View style={styles.backgroundCart}>
        <Ionicons name="cart-outline" size={120} color="#f0f0f0" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#dcfce7',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedItem: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
  },
  selectedItemRow: {
    backgroundColor: '#dbeafe',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  selectedText: {
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
  deleteSelectedFooter: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  deleteSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  inputFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 4,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginRight: 12,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  backgroundCart: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    opacity: 0.3,
    zIndex: -1,
  },
});

export default HomeScreen; 