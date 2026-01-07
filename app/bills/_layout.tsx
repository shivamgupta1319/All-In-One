import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';

export default function BillsLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Bill Manager',
                    headerLargeTitle: true,
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/bills/upload')}>
                            <Ionicons name="add-circle-outline" size={28} color={theme.tint} />
                        </TouchableOpacity>
                    )
                }}
            />
            <Stack.Screen name="upload" options={{ title: 'Add Bill', presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="[id]" options={{ title: 'Bill Details', headerShown: false }} />
        </Stack>
    );
}
