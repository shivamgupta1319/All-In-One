import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';

export default function AddTransaction() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!amount || isNaN(Number(amount))) {
            Alert.alert('Error', 'Please enter a valid amount.');
            return;
        }

        try {
            setIsSubmitting(true);
            const db = await getDB();
            const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            await db.runAsync(
                `INSERT INTO transactions (amount, type, category, note, date) VALUES (?, ?, ?, ?, ?)`,
                [Number(amount), type, category, note, date]
            );

            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save transaction.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            type === 'EXPENSE' && { backgroundColor: '#EF4444' },
                            type !== 'EXPENSE' && { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }
                        ]}
                        onPress={() => setType('EXPENSE')}
                    >
                        <Text style={[
                            styles.typeText,
                            type === 'EXPENSE' ? { color: '#fff' } : { color: theme.text }
                        ]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            type === 'INCOME' && { backgroundColor: '#10B981' },
                            type !== 'INCOME' && { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }
                        ]}
                        onPress={() => setType('INCOME')}
                    >
                        <Text style={[
                            styles.typeText,
                            type === 'INCOME' ? { color: '#fff' } : { color: theme.text }
                        ]}>Income</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Amount</Text>
                    <TextInput
                        style={[styles.input, styles.amountInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                        placeholder="0.00"
                        placeholderTextColor={theme.icon}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                        placeholder={type === 'EXPENSE' ? "Groceries, Rent, etc." : "Salary, Freelance, etc."}
                        placeholderTextColor={theme.icon}
                        value={category}
                        onChangeText={setCategory}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Note</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                        placeholder="Description..."
                        placeholderTextColor={theme.icon}
                        value={note}
                        onChangeText={setNote}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.tint, opacity: isSubmitting ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    <Text style={styles.saveButtonText}>{isSubmitting ? 'Saving...' : 'Save Transaction'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    amountInput: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
