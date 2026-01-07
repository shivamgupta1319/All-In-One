import { Stack } from 'expo-router';

export default function SecretsLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Secrets', headerLargeTitle: true }} />
            <Stack.Screen name="add" options={{ title: 'Add Secret', presentation: 'modal' }} />
            <Stack.Screen name="[id]" options={{ title: 'Secret Details' }} />
        </Stack>
    );
}
