import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { OrderStage, PaymentStatus } from '../types/order';

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedStage: OrderStage | 'all';
  onStageChange: (stage: OrderStage | 'all') => void;
  selectedPayment: PaymentStatus | 'all';
  onPaymentChange: (payment: PaymentStatus | 'all') => void;
}

const stageOptions: Array<{ value: OrderStage | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
];

const paymentOptions: Array<{ value: PaymentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
];

export function FilterBar({
  search,
  onSearchChange,
  selectedStage,
  onStageChange,
  selectedPayment,
  onPaymentChange,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          value={search}
          onChangeText={onSearchChange}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Toggle */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text style={styles.filterToggleText}>
          Filters {showFilters ? '▲' : '▼'}
        </Text>
        {(selectedStage !== 'all' || selectedPayment !== 'all') && (
          <View style={styles.filterBadge} />
        )}
      </TouchableOpacity>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filters}>
          {/* Stage Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Stage</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {stageOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.chip,
                      selectedStage === option.value && styles.chipSelected,
                    ]}
                    onPress={() => onStageChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedStage === option.value && styles.chipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Payment Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Payment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {paymentOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.chip,
                      selectedPayment === option.value && styles.chipSelected,
                    ]}
                    onPress={() => onPaymentChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedPayment === option.value && styles.chipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearIcon: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  filterToggleText: {
    fontSize: 14,
    color: '#666',
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  filters: {
    marginTop: 12,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  chipSelected: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});