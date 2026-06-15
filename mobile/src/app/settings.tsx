import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { requestNotificationPermissions } from '../services/notifications';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function SettingsScreen() {
  const { settings, updateSettings, logout, clearAll, token } = useAuth();
  const { registerPushToken } = usePushNotifications();
  const [websiteUrl, setWebsiteUrl] = useState(settings.websiteUrl);
  const [email, setEmail] = useState(settings.adminEmail);
  const [password, setPassword] = useState(settings.adminPassword);
  const [pollInterval, setPollInterval] = useState(settings.pollInterval);
  const [pushEnabled, setPushEnabled] = useState(settings.pushNotificationsEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const pollOptions = [
    { label: '30 sec', value: 30 },
    { label: '1 min', value: 60 },
    { label: '2 min', value: 120 },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        websiteUrl,
        adminEmail: email,
        adminPassword: password,
        pollInterval,
        pushNotificationsEnabled: pushEnabled,
      });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotifications = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      Alert.alert('Success', 'Notification permissions granted');
    } else {
      Alert.alert('Permission Denied', 'Please enable notifications in your device settings');
    }
  };

  const handleRegisterPushToken = async () => {
    setIsRegistering(true);
    try {
      await registerPushToken();
      Alert.alert('Success', 'Push token registered');
    } catch (error) {
      Alert.alert('Error', 'Failed to register push token');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all stored data including your credentials. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            setWebsiteUrl('');
            setEmail('');
            setPassword('');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Website URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://your-website.com"
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credentials</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Admin Email</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Updates</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Poll Interval</Text>
          <View style={styles.chipContainer}>
            {pollOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  pollInterval === option.value && styles.chipSelected,
                ]}
                onPress={() => setPollInterval(option.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    pollInterval === option.value && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.label}>Push Notifications</Text>
            <Text style={styles.switchDescription}>
              Get notified when new orders arrive
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#e0e0e0', true: '#81c784' }}
            thumbColor={pushEnabled ? '#4CAF50' : '#f0f0f0'}
          />
        </View>

        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestNotifications}
        >
          <Text style={styles.testButtonText}>Test Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.registerTokenButton]}
          onPress={handleRegisterPushToken}
          disabled={isRegistering}
        >
          <Text style={styles.registerTokenButtonText}>
            {isRegistering ? 'Registering...' : 'Register Push Token'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearAll}
        >
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Pukhtoon Libas Admin v1.0.0</Text>
        {token && <Text style={styles.tokenStatus}>Connected</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  switchDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  testButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 10,
  },
  testButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  registerTokenButton: {
    marginTop: 8,
    borderColor: '#4CAF50',
  },
  registerTokenButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  tokenStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
});