import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Order, OrderStage, PaymentStatus } from '../types/order';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onUpdateStage?: (stage: OrderStage) => void;
}

const stageColors: Record<OrderStage, string> = {
  unpaid: '#FF9800',
  processing: '#2196F3',
  shipped: '#9C27B0',
  delivered: '#4CAF50',
};

const paymentColors: Record<PaymentStatus, string> = {
  paid: '#4CAF50',
  unpaid: '#FF9800',
};

function getCustomerInfo(order: Order): { name: string; email: string } {
  if (!order.customer) {
    return { name: 'Deleted Customer', email: '' };
  }
  if (typeof order.customer === 'string') {
    return { name: 'Guest', email: '' };
  }
  return {
    name: order.customer.name || order.customer.email || 'Unknown',
    email: order.customer.email || '',
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
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

export function OrderCard({ order, onPress, onUpdateStage }: OrderCardProps) {
  const { name: customerName, email: customerEmail } = getCustomerInfo(order);
  const firstItem = order.items[0];

  const displayProductName = firstItem?.product
    ? (typeof firstItem.product === 'string' ? 'Product' : firstItem.product.name)
    : 'Deleted Product';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.customerEmail}>{customerEmail}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: stageColors[order.stage] }]}>
          <Text style={styles.badgeText}>{order.stage}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {firstItem && (
          <View style={styles.itemRow}>
            {firstItem.image && (
              <Image source={{ uri: firstItem.image }} style={styles.itemImage} />
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>
                {displayProductName}
              </Text>
              {order.items.length > 1 && (
                <Text style={styles.moreItems}>+{order.items.length - 1} more items</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.dateTotal}>
            <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
            <Text style={styles.total}>{formatCurrency(order.total, order.currency)}</Text>
          </View>

          <View style={styles.badges}>
            <View style={[styles.badgeSmall, { backgroundColor: paymentColors[order.paymentStatus] }]}>
              <Text style={styles.badgeSmallText}>{order.paymentStatus}</Text>
            </View>
          </View>
        </View>
      </View>

      {onUpdateStage && (
        <View style={styles.actions}>
          {order.stage === 'processing' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
              onPress={() => onUpdateStage('shipped')}
            >
              <Text style={styles.actionButtonText}>Mark as Shipped</Text>
            </TouchableOpacity>
          )}
          {order.stage === 'shipped' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => onUpdateStage('delivered')}
            >
              <Text style={styles.actionButtonText}>Mark as Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTotal: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeSmallText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});