import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

interface Settings {
  websiteUrl: string;
  adminEmail: string;
  adminPassword: string;
  pollInterval: number; // seconds
  pushNotificationsEnabled: boolean;
}

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  settings: Settings;
  token: string | null;

  // Actions
  login: (url: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  clearAll: () => Promise<void>;
}

const defaultSettings: Settings = {
  websiteUrl: '',
  adminEmail: '',
  adminPassword: '',
  pollInterval: 30,
  pushNotificationsEnabled: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SETTINGS_KEY = 'admin_settings';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [token, setToken] = useState<string | null>(null);

  // Load settings and token on mount
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      // Load settings from AsyncStorage
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      }

      // Check if we have a valid token
      const storedToken = await apiService.getStoredToken();
      const storedUrl = await apiService.getStoredUrl();

      if (storedToken && storedUrl) {
        setToken(storedToken);
        setIsAuthenticated(true);
        await apiService.setBaseUrl(storedUrl);
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const login = useCallback(async (url: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Initialize API with URL
      await apiService.setBaseUrl(url);
      await apiService.storeUrl(url);

      // Attempt login
      const { token: newToken } = await apiService.login(email, password);

      setToken(newToken);
      setIsAuthenticated(true);

      // Save settings (but not password in plain text - in production, use SecureStore)
      const newSettings = {
        ...settings,
        websiteUrl: url,
        adminEmail: email,
        adminPassword: password, // Note: In production, encrypt this
        pushNotificationsEnabled: true,
      };
      await saveSettings(newSettings);
    } catch (error) {
      setIsAuthenticated(false);
      setToken(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);

    // If URL changed, update API base URL
    if (newSettings.websiteUrl && newSettings.websiteUrl !== settings.websiteUrl) {
      await apiService.setBaseUrl(newSettings.websiteUrl);
      await apiService.storeUrl(newSettings.websiteUrl);
    }
  }, [settings]);

  const clearAll = useCallback(async () => {
    try {
      await apiService.logout();
      await AsyncStorage.removeItem(SETTINGS_KEY);
      setSettings(defaultSettings);
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Clear all error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        settings,
        token,
        login,
        logout,
        updateSettings,
        clearAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}