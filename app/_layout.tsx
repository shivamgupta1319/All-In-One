import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { initDB } from '../src/db';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        // Add fonts if needed
    });

    useEffect(() => {
        const setup = async () => {
            try {
                await initDB();
            } catch (e) {
                console.warn('DB Init Error:', e);
            } finally {
                if (loaded) {
                    await SplashScreen.hideAsync();
                }
            }
        };
        setup();
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="secrets" options={{ headerShown: false }} />
                <Stack.Screen name="finance" options={{ headerShown: false }} />
                <Stack.Screen name="notes" options={{ headerShown: false }} />
                <Stack.Screen name="bills" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
