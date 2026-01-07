import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';

export default function NotesLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Notes',
                    headerLargeTitle: true,
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/notes/add')}>
                            <Ionicons name="create-outline" size={28} color={theme.tint} />
                        </TouchableOpacity>
                    )
                }}
            />
            <Stack.Screen name="add" options={{ title: 'New Note', presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="[id]" options={{ title: 'Edit Note', headerShown: false }} />
        </Stack>
    );
}
