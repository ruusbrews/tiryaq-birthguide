import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Custom theme with calming colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#E57373', // Calming red/pink
    secondary: '#81C784', // Calming green
    background: '#FFF5F5', // Very light pink background
    surface: '#FFFFFF',
    error: '#D32F2F',
  },
};

export default function RootLayout() {
  return (
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
      </Stack>
    </PaperProvider>
  );
}
