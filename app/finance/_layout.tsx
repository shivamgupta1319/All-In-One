import { Stack, usePathname, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';

export default function FinanceLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Finance',
                    headerLargeTitle: true,
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/finance/debts')}>
                            <Ionicons name="people-outline" size={24} color={theme.tint} />
                        </TouchableOpacity>
                    )
                }}
            />
            <Stack.Screen name="add" options={{ title: 'Add Transaction', presentation: 'modal' }} />
            <Stack.Screen name="debts" options={{ title: 'Debts & Loans' }} />
        </Stack>
    );
}
