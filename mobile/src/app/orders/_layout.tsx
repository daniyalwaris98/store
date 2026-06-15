import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Order Details',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
    </Stack>
  );
}