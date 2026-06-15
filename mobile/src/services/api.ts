import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  Order,
  OrderListResponse,
  OrderQueryParams,
  UpdateOrderStageInput,
  AuthResponse,
} from '../types/order';

const TOKEN_KEY = 'admin_auth_token';
const URL_KEY = 'admin_website_url';

class ApiService {
  private client: AxiosInstance | null = null;
  private baseUrl: string = '';

  async setBaseUrl(url: string): Promise<void> {
    this.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      withCredentials: false,
    });
  }

  async getStoredToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      console.log('[api] getStoredToken:', { hasToken: !!token });
      return token;
    } catch (err) {
      console.error('[api] getStoredToken error:', err);
      return null;
    }
  }

  async storeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // Ignore errors on delete
    }
  }

  async getStoredUrl(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(URL_KEY);
    } catch {
      return null;
    }
  }

  async storeUrl(url: string): Promise<void> {
    await SecureStore.setItemAsync(URL_KEY, url);
  }

  private getAuthHeaders(): Record<string, string> {
    // Token will be retrieved and added in each request
    return {};
  }

  private async getToken(): Promise<string | null> {
    return this.getStoredToken();
  }

  // Authentication
  async login(
    email: string,
    password: string
  ): Promise<{ token: string }> {
    if (!this.client) {
      throw new Error('API not initialized. Call setBaseUrl first.');
    }

    try {
      const response = await this.client.post<AuthResponse>(
        '/api/auth/login',
        { email, password }
      );

      if (response.data.success && response.data.token) {
        await this.storeToken(response.data.token);
        return { token: response.data.token };
      }

      throw new Error(response.data.error || 'Login failed');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(
          axiosError.response?.data?.message || axiosError.message
        );
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  // Orders
  async getOrders(
    params: OrderQueryParams,
    token: string
  ): Promise<OrderListResponse> {
    if (!this.client) {
      throw new Error('API not initialized. Call setBaseUrl first.');
    }

    try {
      console.log('[api] getOrders called:', { baseUrl: this.baseUrl, params, hasToken: !!token });
      const response = await this.client.get<OrderListResponse>('/api/orders', {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('[api] getOrders success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[api] getOrders error:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(
          axiosError.response?.data?.message || axiosError.message
        );
      }
      throw error;
    }
  }

  async getOrder(id: string): Promise<Order> {
    if (!this.client) {
      throw new Error('API not initialized. Call setBaseUrl first.');
    }

    try {
      const response = await this.client.get<Order>(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(
          axiosError.response?.data?.message || axiosError.message
        );
      }
      throw error;
    }
  }

  async updateOrderStage(
    id: string,
    data: UpdateOrderStageInput,
    token: string
  ): Promise<Order> {
    if (!this.client) {
      throw new Error('API not initialized. Call setBaseUrl first.');
    }

    try {
      const response = await this.client.patch<Order>(
        `/api/orders/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(
          axiosError.response?.data?.message || axiosError.message
        );
      }
      throw error;
    }
  }

  async deleteOrder(id: string, token: string): Promise<void> {
    if (!this.client) {
      throw new Error('API not initialized. Call setBaseUrl first.');
    }

    try {
      await this.client.delete(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(
          axiosError.response?.data?.message || axiosError.message
        );
      }
      throw error;
    }
  }

  async registerPushToken(
    pushToken: string,
    email: string,
    token: string
  ): Promise<void> {
    if (!this.client) {
      throw new Error('API not initialized. Call setBaseUrl first.');
    }

    try {
      await this.client.post(
        '/api/notifications/register-token',
        { email, pushToken, platform: 'android' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      // Silently fail - notification registration is not critical
      console.log('Push token registration failed:', error);
    }
  }
}

export const apiService = new ApiService();
export default apiService;