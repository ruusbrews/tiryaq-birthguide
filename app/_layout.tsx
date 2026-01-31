// _layout.tsx - Updated with soothing green theme

import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../context/LanguageContext';

// Custom theme with calming green colors (non-emergency screens)
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#45AC8B', // Soothing green
    secondary: '#81C784', // Light green
    background: '#F5FFFA', // Very light mint background
    surface: '#FFFFFF',
    error: '#D32F2F', // Keep red for errors
  },
};

export default function RootLayout() {
  return (
    <LanguageProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="assessment" />
          <Stack.Screen name="guide" />
          <Stack.Screen name="emergency/index" />
          <Stack.Screen name="emergency/[id]" />
          <Stack.Screen name="camera" />
          <Stack.Screen name="postpartum" />
          <Stack.Screen name="references" />
          <Stack.Screen name="screens/HealthTrackingScreen" />
          <Stack.Screen name="screens/forms/IdentificationFormScreen" />
          <Stack.Screen name="screens/forms/PregnancyStatusFormScreen" />
          <Stack.Screen name="screens/forms/AntenatalCareFormScreen" />
          <Stack.Screen name="screens/forms/LivingConditionsFormScreen" />
          <Stack.Screen name="screens/forms/MentalHealthFormScreen" />
          <Stack.Screen name="screens/forms/ConsentFormScreen" />
          <Stack.Screen name="screens/forms/SubmitRecordsScreen" />
        </Stack>
      </PaperProvider>
    </LanguageProvider>
  );
}