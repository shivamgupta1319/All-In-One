import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Modal, TextInput, FlatList, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Bill = {
    id: number;
    image_uri: string;
    merchant_name: string;
    date: string;
    total_amount: number;
};

type BillItem = {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
};

export default function BillDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [bill, setBill] = useState<Bill | null>(null);
    const [items, setItems] = useState<BillItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewImageVisible, setViewImageVisible] = useState(false);

    // New Item Form
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemQty, setNewItemQty] = useState('1');
    const [newItemPrice, setNewItemPrice] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const db = await getDB();

            // Get Bill
            const billId = Array.isArray(id) ? Number(id[0]) : Number(id);
            if (isNaN(billId)) {
                Alert.alert('Error', 'Invalid Bill ID');
                router.back();
                return;
            }

            const billResult = await db.getFirstAsync<Bill>('SELECT * FROM bills WHERE id = ?', [billId]);
            if (billResult) {
                setBill(billResult);
            } else {
                Alert.alert('Error', 'Bill not found');
                router.back();
                return;
            }

            // Get Items
            const itemsResult = await db.getAllAsync<BillItem>('SELECT * FROM bill_items WHERE bill_id = ?', [billId]);
            setItems(itemsResult);

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load bill details');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [id])
    );

    const handleAddItem = async () => {
        if (!newItemDesc || !newItemPrice) {
            Alert.alert('Missing Info', 'Description and Price are required');
            return;
        }

        try {
            const db = await getDB();
            const qty = parseFloat(newItemQty) || 1;
            const price = parseFloat(newItemPrice) || 0;
            const total = qty * price;

            await db.runAsync(
                'INSERT INTO bill_items (bill_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
                [bill?.id ?? 0, newItemDesc, qty, price, total]
            );

            setModalVisible(false);
            setNewItemDesc('');
            setNewItemQty('1');
            setNewItemPrice('');
            loadData();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to add item');
        }
    };

    const deleteItem = async (itemId: number) => {
        try {
            const db = await getDB();
            await db.runAsync('DELETE FROM bill_items WHERE id = ?', [itemId]);
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteBill = async () => {
        if (!bill) return;
        Alert.alert('Delete Bill', 'Are you sure? This will delete the bill and all items.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const db = await getDB();
                        await db.runAsync('DELETE FROM bills WHERE id = ?', [bill.id]);
                        router.back();
                    } catch (e) { console.error(e); }
                }
            }
        ]);
    };

    if (loading || !bill) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color={theme.tint} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Bill Details</Text>
                    <TouchableOpacity onPress={deleteBill}>
                        <Ionicons name="trash-outline" size={24} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView style={styles.content}>
                    {/* Summary Card */}
                    <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.summaryRow}>
                            <View>
                                <Text style={[styles.label, { color: theme.icon }]}>Merchant</Text>
                                <Text style={[styles.valueLarge, { color: theme.text }]}>{bill.merchant_name}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.label, { color: theme.icon }]}>Total</Text>
                                <Text style={[styles.valueLarge, { color: theme.tint }]}>₹{bill.total_amount.toFixed(2)}</Text>
                            </View>
                        </View>
                        <Text style={[styles.date, { color: theme.icon }]}>{bill.date}</Text>

                        {bill.image_uri && (
                            <TouchableOpacity style={styles.viewImageBtn} onPress={() => setViewImageVisible(true)}>
                                <Ionicons name="image-outline" size={16} color={theme.tint} />
                                <Text style={{ color: theme.tint, marginLeft: 4 }}>View Receipt Image</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Items List */}
                    <View style={styles.itemsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Items</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addItemBtn}>
                                <Ionicons name="add" size={20} color={theme.tint} />
                                <Text style={{ color: theme.tint, fontWeight: '600' }}>Add Item</Text>
                            </TouchableOpacity>
                        </View>

                        {items.length === 0 ? (
                            <View style={[styles.emptyItems, { borderColor: theme.border }]}>
                                <Text style={{ color: theme.icon }}>No items added yet.</Text>
                            </View>
                        ) : (
                            items.map((item) => (
                                <View key={item.id} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.itemDesc, { color: theme.text }]}>{item.description}</Text>
                                        <Text style={[styles.itemSub, { color: theme.icon }]}>
                                            {item.quantity} x ₹{item.unit_price.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.itemTotal, { color: theme.text }]}>₹{item.total_price.toFixed(2)}</Text>
                                        <TouchableOpacity onPress={() => deleteItem(item.id)}>
                                            <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Add Item Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Add Item</Text>

                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            placeholder="Description (e.g. Milk)"
                            placeholderTextColor={theme.icon}
                            value={newItemDesc}
                            onChangeText={setNewItemDesc}
                        />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TextInput
                                style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.border }]}
                                placeholder="Qty"
                                placeholderTextColor={theme.icon}
                                keyboardType="numeric"
                                value={newItemQty}
                                onChangeText={setNewItemQty}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.border }]}
                                placeholder="Price"
                                placeholderTextColor={theme.icon}
                                keyboardType="numeric"
                                value={newItemPrice}
                                onChangeText={setNewItemPrice}
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                                <Text style={{ color: theme.icon }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddItem} style={[styles.modalBtn, { backgroundColor: theme.tint }]}>
                                <Text style={{ color: '#fff' }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* View Image Modal */}
            <Modal visible={viewImageVisible} transparent={false} animationType="fade">
                <View style={{ flex: 1, backgroundColor: '#000' }}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <TouchableOpacity style={styles.closeImageBtn} onPress={() => setViewImageVisible(false)}>
                            <Ionicons name="close-circle" size={30} color="#fff" />
                        </TouchableOpacity>
                        <Image source={{ uri: bill.image_uri }} style={{ flex: 1, resizeMode: 'contain' }} />
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    summaryCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        textTransform: 'uppercase',
    },
    valueLarge: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        marginTop: 4,
    },
    viewImageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    itemsSection: {
        marginBottom: 50,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    addItemBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyItems: {
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    itemDesc: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemSub: {
        fontSize: 14,
        marginTop: 2,
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        padding: 20,
        borderRadius: 16,
        gap: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 8,
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    closeImageBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
});
