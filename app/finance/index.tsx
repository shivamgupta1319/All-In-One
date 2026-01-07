import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Transaction = {
    id: number;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    note: string;
    date: string;
};

export default function FinanceDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const loadData = async () => {
        try {
            setLoading(true);
            const db = await getDB();

            // Get recent transactions
            const recent = await db.getAllAsync<Transaction>(
                'SELECT * FROM transactions ORDER BY date DESC, id DESC LIMIT 50'
            );
            setTransactions(recent);

            // Calculate totals
            const totals = await db.getAllAsync<{ type: string, total: number }>(
                'SELECT type, SUM(amount) as total FROM transactions GROUP BY type'
            );

            let inc = 0;
            let exp = 0;
            totals.forEach(t => {
                if (t.type === 'INCOME') inc = t.total;
                if (t.type === 'EXPENSE') exp = t.total;
            });

            setIncome(inc);
            setExpense(exp);
            setBalance(inc - exp);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={[styles.transactionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: item.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons
                    name={item.type === 'INCOME' ? "arrow-down" : "arrow-up"}
                    size={24}
                    color={item.type === 'INCOME' ? "#10B981" : "#EF4444"}
                />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={[styles.transactionCategory, { color: theme.text }]}>{item.category || 'Uncategorized'}</Text>
                <Text style={[styles.transactionDate, { color: theme.icon }]}>{item.date}</Text>
            </View>
            <Text style={[
                styles.transactionAmount,
                { color: item.type === 'INCOME' ? "#10B981" : "#EF4444" }
            ]}>
                {item.type === 'INCOME' ? '+' : '-'}${item.amount.toFixed(2)}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.balanceCard, { backgroundColor: theme.tint }]}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Ionicons name="arrow-down-circle" size={20} color="#fff" />
                        <Text style={styles.statValue}>${income.toFixed(2)}</Text>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="arrow-up-circle" size={20} color="#fff" />
                        <Text style={styles.statValue}>${expense.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>

            {loading ? (
                <ActivityIndicator size="large" color={theme.tint} />
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ color: theme.icon }}>No transactions yet.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint }]}
                onPress={() => router.push('/finance/add')}
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
    balanceCard: {
        margin: 20,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    balanceLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginBottom: 4,
    },
    balanceValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionCategory: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
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
    empty: {
        alignItems: 'center',
        paddingTop: 40,
    }
});
