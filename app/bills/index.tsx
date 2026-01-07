import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Bill = {
    id: number;
    image_uri: string;
    merchant_name: string;
    date: string;
    total_amount: number;
};

export default function BillsList() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const loadBills = async () => {
        try {
            setLoading(true);
            const db = await getDB();
            const result = await db.getAllAsync<Bill>(
                'SELECT * FROM bills ORDER BY date DESC, created_at DESC'
            );
            setBills(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadBills();
        }, [])
    );

    const renderItem = ({ item }: { item: Bill }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push(`/bills/${item.id}`)}
        >
            {item.image_uri ? (
                <Image source={{ uri: item.image_uri }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.thumbnail, styles.placeholder, { backgroundColor: theme.background }]}>
                    <Ionicons name="receipt-outline" size={32} color={theme.icon} />
                </View>
            )}
            <View style={styles.cardContent}>
                <Text style={[styles.merchant, { color: theme.text }]} numberOfLines={1}>
                    {item.merchant_name || 'Unknown Merchant'}
                </Text>
                <Text style={[styles.date, { color: theme.icon }]}>{item.date || 'No Date'}</Text>
                <Text style={[styles.amount, { color: theme.tint }]}>
                    {item.total_amount ? `$${item.total_amount.toFixed(2)}` : '-'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.tint} />
            ) : (
                <FlatList
                    data={bills}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ color: theme.icon }}>No bills saved yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
        height: 100,
    },
    thumbnail: {
        width: 100,
        height: '100%',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    merchant: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
    }
});
