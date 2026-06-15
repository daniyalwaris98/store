// Order Types - mirrored from website admin

export type OrderStage = 'unpaid' | 'processing' | 'shipped' | 'delivered';
export type PaymentStatus = 'unpaid' | 'paid';
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';

export interface Address {
  label?: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface OrderItem {
  product: string | null | { _id: string; name: string; gallery?: Array<{ url: string; type: string }> };
  variantId?: string;
  variantOptions?: Record<string, string>;
  customMeasurements?: Record<string, string>;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface StageHistory {
  stage: string;
  note?: string;
  timestamp: string;
}

export interface Customer {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  addresses?: Address[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string | null | Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  country: string;
  stage: OrderStage;
  stageHistory: StageHistory[];
  paymentMethod: 'cod';
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: Address;
}

export interface OrderQueryParams {
  status?: PaymentStatus;
  stage?: OrderStage;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface UpdateOrderStageInput {
  stage: OrderStage;
  note?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}