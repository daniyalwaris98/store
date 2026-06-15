import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { StageProgress } from '../../components/StageProgress';
import { useOrder, useUpdateOrderStage, useDeleteOrder } from '../../hooks/useOrders';
import { OrderStage, Order } from '../../types/order';

const stageOptions: OrderStage[] = ['unpaid', 'processing', 'shipped', 'delivered'];

function getCustomerInfo(order: Order): { name: string; email: string; phone?: string } {
  if (!order.customer) {
    return { name: 'Deleted Customer', email: '' };
  }
  if (typeof order.customer === 'string') {
    return { name: 'Guest', email: '' };
  }
  return {
    name: order.customer.name || order.customer.email || 'Unknown',
    email: order.customer.email || '',
    phone: (order.customer as any).phone,
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number, currency: string = 'PKR'): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const orderId = Array.isArray(id) ? id[0] : id;

  const { data: order, isLoading, isError, error } = useOrder(orderId);
  const updateStageMutation = useUpdateOrderStage();
  const deleteMutation = useDeleteOrder();

  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<OrderStage | null>(null);
  const [stageNote, setStageNote] = useState('');

  const handleUpdateStage = useCallback(() => {
    if (!order) return;
    setSelectedStage(null);
    setStageNote('');
    setShowStageModal(true);
  }, [order]);

  const confirmStageUpdate = useCallback(() => {
    if (!order || !selectedStage) return;

    updateStageMutation.mutate(
      { id: order._id, data: { stage: selectedStage, note: stageNote || undefined } },
      {
        onSuccess: () => {
          setShowStageModal(false);
          setStageNote('');
          setSelectedStage(null);
        },
        onError: (err) => {
          Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update stage');
        },
      }
    );
  }, [order, selectedStage, stageNote, updateStageMutation]);

  const handleDelete = useCallback(() => {
    if (!order) return;

    Alert.alert(
      'Delete Order',
      `Are you sure you want to delete order #${order.orderNumber.slice(-8)}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(order._id, {
              onSuccess: () => {
                router.back();
              },
              onError: (err) => {
                Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete order');
              },
            });
          },
        },
      ]
    );
  }, [order, deleteMutation, router]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to Load Order</Text>
        <Text style={styles.errorSubtitle}>
          {error instanceof Error ? error.message : 'Please try again'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { name: customerName, email: customerEmail, phone: customerPhone } = getCustomerInfo(order);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Order Details',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stage Progress */}
        <StageProgress
          currentStage={order.stage}
          onUpdateStage={handleUpdateStage}
        />

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item, index) => {
            const displayProductName = item.product
              ? (typeof item.product === 'string' ? 'Product' : item.product.name)
              : 'Deleted Product';
            return (
              <View key={index} style={styles.itemCard}>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{displayProductName}</Text>
                  {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                    <Text style={styles.itemVariant}>
                      {Object.entries(item.variantOptions)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </Text>
                  )}
                  {item.customMeasurements && Object.keys(item.customMeasurements).length > 0 && (
                    <View style={styles.measurements}>
                      {Object.entries(item.customMeasurements).map(([key, value]) => (
                        <Text key={key} style={styles.measurementText}>
                          {key}: {value}
                        </Text>
                      ))}
                    </View>
                  )}
                  <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                  <View style={styles.itemPricing}>
                    <Text style={styles.itemPrice}>
                      {formatCurrency(item.price, order.currency)} x {item.quantity}
                    </Text>
                    <Text style={styles.itemTotal}>
                      {formatCurrency(item.price * item.quantity, order.currency)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.subtotal, order.currency)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.shippingCost, order.currency)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(order.total, order.currency)}</Text>
            </View>
          </View>
        </View>

        {/* Stage History */}
        {order.stageHistory && order.stageHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stage History</Text>
            <View style={styles.timeline}>
              {order.stageHistory.map((entry, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStage}>{entry.stage}</Text>
                    <Text style={styles.timelineDate}>{formatDate(entry.timestamp)}</Text>
                    {entry.note && <Text style={styles.timelineNote}>{entry.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{customerEmail || '-'}</Text>
          </View>
          {customerPhone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{customerPhone}</Text>
            </View>
          )}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.city}
              {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
            </Text>
            <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
            {order.shippingAddress.postalCode && (
              <Text style={styles.addressText}>{order.shippingAddress.postalCode}</Text>
            )}
          </View>
        )}

        {/* Order Meta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{order.orderNumber.slice(-8)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <View style={[styles.badge, order.paymentStatus === 'paid' ? styles.badgeGreen : styles.badgeYellow]}>
              <Text style={styles.badgeText}>{order.paymentStatus}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fulfillment</Text>
            <Text style={styles.infoValue}>{order.fulfillmentStatus}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Order</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Update Stage Modal */}
      <Modal
        visible={showStageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Stage</Text>

            <Text style={styles.modalLabel}>Select New Stage</Text>
            <View style={styles.stageOptions}>
              {stageOptions.map((stage) => (
                <TouchableOpacity
                  key={stage}
                  style={[
                    styles.stageOption,
                    selectedStage === stage && styles.stageOptionSelected,
                  ]}
                  onPress={() => setSelectedStage(stage)}
                >
                  <Text
                    style={[
                      styles.stageOptionText,
                      selectedStage === stage && styles.stageOptionTextSelected,
                    ]}
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note..."
              value={stageNote}
              onChangeText={setStageNote}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStageModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmStageUpdate}
                disabled={!selectedStage || updateStageMutation.isPending}
              >
                {updateStageMutation.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemVariant: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  measurements: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  measurementText: {
    fontSize: 12,
    color: '#666',
  },
  itemSku: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totals: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  timelineNote: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeGreen: {
    backgroundColor: '#E8F5E9',
  },
  badgeYellow: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  stageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  stageOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  stageOptionSelected: {
    backgroundColor: '#2196F3',
  },
  stageOptionText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  stageOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 24,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});