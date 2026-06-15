import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FilterBar } from '../../components/FilterBar';
import { OrderCard } from '../../components/OrderCard';
import { useOrdersWithPolling, useUpdateOrderStage } from '../../hooks/useOrders';
import { Order, OrderStage, PaymentStatus, OrderQueryParams } from '../../types/order';

export default function OrdersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<OrderStage | 'all'>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentStatus | 'all'>('all');

  const updateStageMutation = useUpdateOrderStage();

  const queryParams: OrderQueryParams = useMemo(() => {
    const params: OrderQueryParams = {
      limit: 50,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (selectedStage !== 'all') {
      params.stage = selectedStage;
    }

    if (selectedPayment !== 'all') {
      params.status = selectedPayment;
    }

    return params;
  }, [search, selectedStage, selectedPayment]);

  const { data: orders = [], isLoading, isError, error, refetch, isFetching } = useOrdersWithPolling(queryParams);

  const handleOrderPress = useCallback((order: Order) => {
    router.push(`/orders/${order._id}`);
  }, [router]);

  const handleUpdateStage = useCallback((order: Order, newStage: OrderStage) => {
    Alert.alert(
      `Mark as ${newStage.charAt(0).toUpperCase() + newStage.slice(1)}?`,
      `This will update order #${order.orderNumber.slice(-8)} to ${newStage}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateStageMutation.mutate(
              { id: order._id, data: { stage: newStage } },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Order stage updated');
                },
                onError: (err) => {
                  Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update stage');
                },
              }
            );
          },
        },
      ]
    );
  }, [updateStageMutation]);

  const renderOrder = useCallback(({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={() => handleOrderPress(item)}
      onUpdateStage={(stage) => handleUpdateStage(item, stage)}
    />
  ), [handleOrderPress, handleUpdateStage]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Orders Found</Text>
      <Text style={styles.emptySubtitle}>
        {search || selectedStage !== 'all' || selectedPayment !== 'all'
          ? 'Try adjusting your filters'
          : 'New orders will appear here'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.orderCount}>{orders.length} orders</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to Load Orders</Text>
        <Text style={styles.errorSubtitle}>
          {error instanceof Error ? error.message : 'Please try again'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        selectedPayment={selectedPayment}
        onPaymentChange={setSelectedPayment}
      />

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={orders.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={orders.length === 0 ? styles.emptyList : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});