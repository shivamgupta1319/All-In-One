import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { getDB } from '../../src/db';
import { encrypt } from '../../src/services/encryption';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddSecret() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [uri, setUri] = useState('');
    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSave = async () => {
        if (!title || !password) {
            Alert.alert('Error', 'Title and Password are required.');
            return;
        }

        try {
            setIsSubmitting(true);
            const encryptedPassword = await encrypt(password);
            const encryptedNotes = notes ? await encrypt(notes) : '';

            const db = await getDB();
            await db.runAsync(
                `INSERT INTO secrets (title, username, password, uri, notes, category) VALUES (?, ?, ?, ?, ?, ?)`,
                [title, username, encryptedPassword, uri, encryptedNotes, category]
            );

            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save secret.');
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
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                        placeholder="e.g. Gmail, Netflix"
                        placeholderTextColor={theme.icon}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Username / Email</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                        placeholder="user@example.com"
                        placeholderTextColor={theme.icon}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Password *</Text>
                    <View style={[styles.passwordContainer, { borderColor: theme.border, backgroundColor: theme.card }]}>
                        <TextInput
                            style={[styles.passwordInput, { color: theme.text }]}
                            placeholder="Password"
                            placeholderTextColor={theme.icon}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={theme.icon} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Website / URI</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                        placeholder="https://example.com"
                        placeholderTextColor={theme.icon}
                        value={uri}
                        onChangeText={setUri}
                        autoCapitalize="none"
                        keyboardType="url"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                        placeholder="e.g. Social, Finance"
                        placeholderTextColor={theme.icon}
                        value={category}
                        onChangeText={setCategory}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Notes (Encrypted)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                        placeholder="Secret notes..."
                        placeholderTextColor={theme.icon}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.tint, opacity: isSubmitting ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    <Text style={styles.saveButtonText}>{isSubmitting ? 'Saving...' : 'Save Secret'}</Text>
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
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
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
