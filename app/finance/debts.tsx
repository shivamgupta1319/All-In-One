import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Debt = {
    id: number;
    contact_name: string;
    amount: number;
    description: string;
    due_date: string;
    is_settled: number;
    created_at: string;
};

export default function DebtsScreen() {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [contact, setContact] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'LENT' | 'BORROWED'>('LENT');

    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const loadDebts = async () => {
        try {
            setLoading(true);
            const db = await getDB();
            const result = await db.getAllAsync<Debt>(
                'SELECT * FROM debts ORDER BY is_settled ASC, created_at DESC'
            );
            setDebts(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDebts();
        }, [])
    );

    const handleSave = async () => {
        if (!contact || !amount) {
            Alert.alert('Error', 'Contact and Amount are required');
            return;
        }

        try {
            const db = await getDB();
            const finalAmount = type === 'LENT' ? Number(amount) : -Number(amount);

            await db.runAsync(
                'INSERT INTO debts (contact_name, amount, description) VALUES (?, ?, ?)',
                [contact, finalAmount, description]
            );

            setModalVisible(false);
            resetForm();
            loadDebts();
        } catch (e) {
            Alert.alert('Error', 'Failed to save debt');
        }
    };

    const handleSettle = async (id: number) => {
        try {
            const db = await getDB();
            await db.runAsync('UPDATE debts SET is_settled = 1 WHERE id = ?', [id]);
            loadDebts();
        } catch (e) {
            console.error(e);
        }
    };

    const resetForm = () => {
        setContact('');
        setAmount('');
        setDescription('');
        setType('LENT');
    };

    const renderItem = ({ item }: { item: Debt }) => (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: item.is_settled ? 0.6 : 1 }]}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.contactName, { color: theme.text, textDecorationLine: item.is_settled ? 'line-through' : 'none' }]}>
                        {item.contact_name}
                    </Text>
                    <Text style={{ color: theme.icon, fontSize: 12 }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={[
                    styles.amount,
                    { color: item.amount > 0 ? '#10B981' : '#EF4444' }
                ]}>
                    {item.amount > 0 ? 'Owes you' : 'You owe'} ${Math.abs(item.amount).toFixed(2)}
                </Text>
            </View>

            {item.description ? (
                <Text style={{ color: theme.icon, marginTop: 4 }}>{item.description}</Text>
            ) : null}

            {!item.is_settled && (
                <TouchableOpacity
                    style={[styles.settleBtn, { borderColor: theme.border }]}
                    onPress={() => handleSettle(item.id)}
                >
                    <Text style={{ color: theme.tint, fontWeight: '600' }}>Mark as Settled</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={debts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ color: theme.icon }}>No debts recorded.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Record</Text>

                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'LENT' && { backgroundColor: '#10B981' }, { borderColor: theme.border, borderWidth: 1 }]}
                                onPress={() => setType('LENT')}
                            >
                                <Text style={{ color: type === 'LENT' ? '#fff' : theme.text }}>I Lent</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'BORROWED' && { backgroundColor: '#EF4444' }, { borderColor: theme.border, borderWidth: 1 }]}
                                onPress={() => setType('BORROWED')}
                            >
                                <Text style={{ color: type === 'BORROWED' ? '#fff' : theme.text }}>I Borrowed</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            placeholder="Contact Name"
                            placeholderTextColor={theme.icon}
                            value={contact}
                            onChangeText={setContact}
                        />

                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            placeholder="Amount"
                            placeholderTextColor={theme.icon}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                            placeholder="Description (Optional)"
                            placeholderTextColor={theme.icon}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                                <Text style={{ color: theme.icon }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={[styles.modalBtn, { backgroundColor: theme.tint }]}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    settleBtn: {
        marginTop: 12,
        borderTopWidth: 1,
        paddingTop: 8,
        alignItems: 'center',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    typeBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 12,
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    }
});
