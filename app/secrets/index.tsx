import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type SecretItem = {
    id: number;
    title: string;
    username: string;
    category: string;
};

export default function SecretsList() {
    const [secrets, setSecrets] = useState<SecretItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const loadSecrets = async () => {
        try {
            setLoading(true);
            const db = await getDB();
            const result = await db.getAllAsync<SecretItem>(
                'SELECT id, title, username, category FROM secrets ORDER BY created_at DESC'
            );
            setSecrets(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSecrets();
        }, [])
    );

    const renderItem = ({ item }: { item: SecretItem }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push(`/secrets/${item.id}`)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={24} color={theme.tint} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.icon }]}>{item.username || 'No Username'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.tint} />
            ) : (
                <FlatList
                    data={secrets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: theme.icon }}>No secrets found. Add one!</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint }]}
                onPress={() => router.push('/secrets/add')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    iconContainer: {
        marginRight: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
});
