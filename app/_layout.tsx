/**
 * Root Layout
 * 
 * Expo Router root layout file - REQUIRED for file-based routing
 * 
 * Sets up Stack navigation for non-tab routes (assessment, decision screens)
 * Tab routes are handled by app/(tabs)/_layout.tsx
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for all screens (custom headers in components)
          contentStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        {/* Tab routes are handled by (tabs)/_layout.tsx */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Non-tab routes */}
        <Stack.Screen 
          name="assessment" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="decision-presentation" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="decision-bleeding" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="decision-crowning" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="decision-baby_breathing" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="decision-placenta" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}
