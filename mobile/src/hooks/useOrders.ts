import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Order, OrderQueryParams, UpdateOrderStageInput } from '../types/order';

async function fetchOrders(
  params: OrderQueryParams,
  token: string | null
): Promise<Order[]> {
  if (!token) throw new Error('Not authenticated');
  try {
    const response = await apiService.getOrders(params, token);
    console.log('[useOrders] fetchOrders success:', { orderCount: response.orders.length });
    return response.orders;
  } catch (err) {
    console.error('[useOrders] fetchOrders error:', err);
    throw err;
  }
}

async function fetchOrder(id: string): Promise<Order> {
  try {
    const response = await apiService.getOrder(id);
    console.log('[useOrders] fetchOrder success:', { id });
    return response;
  } catch (err) {
    console.error('[useOrders] fetchOrder error:', { id, err });
    throw err;
  }
}

async function updateOrderStage(
  { id, data }: { id: string; data: UpdateOrderStageInput },
  token: string | null
): Promise<Order> {
  if (!token) throw new Error('Not authenticated');
  const response = await apiService.updateOrderStage(id, data, token);
  return response;
}

async function deleteOrder(
  id: string,
  token: string | null
): Promise<void> {
  if (!token) throw new Error('Not authenticated');
  await apiService.deleteOrder(id, token);
}

export function useOrders(params: OrderQueryParams = {}) {
  const { token } = useAuth();
  console.log('[useOrders] useOrders called, params:', params, 'hasToken:', !!token);

  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params, token),
    enabled: !!token,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStageInput }) =>
      updateOrderStage({ id, data }, token),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', updatedOrder._id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDeleteOrder() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrder(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrdersWithPolling(params: OrderQueryParams = {}) {
  const ordersQuery = useOrders(params);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('[useOrdersWithPolling] AppState changed:', { from: appState.current, to: nextAppState });
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[useOrdersWithPolling] App became active, refetching orders');
        ordersQuery.refetch();
      }
      appState.current = nextAppState;
    });

    return () => {
      console.log('[useOrdersWithPolling] Cleaning up AppState subscription');
      subscription.remove();
    };
  }, []);

  return ordersQuery;
}