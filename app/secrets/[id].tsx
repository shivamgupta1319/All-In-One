import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getDB } from '../../src/db';
import { decrypt } from '../../src/services/encryption';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

type SecretItem = {
    id: number;
    title: string;
    username: string;
    password: string;
    uri: string;
    notes: string;
    category: string;
    created_at: string;
};

export default function SecretDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [secret, setSecret] = useState<SecretItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [decryptedPassword, setDecryptedPassword] = useState('');
    const [decryptedNotes, setDecryptedNotes] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    useEffect(() => {
        loadSecret();
    }, [id]);

    const loadSecret = async () => {
        try {
            const db = await getDB();
            const result = await db.getFirstAsync<SecretItem>(
                'SELECT * FROM secrets WHERE id = ?',
                [Number(id)]
            );
            setSecret(result);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load secret');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePassword = async () => {
        if (showPassword) {
            setShowPassword(false);
        } else {
            if (!decryptedPassword && secret) {
                const pass = await decrypt(secret.password);
                setDecryptedPassword(pass);
            }
            setShowPassword(true);
        }
    };

    const handleToggleNotes = async () => {
        if (showNotes) {
            setShowNotes(false);
        } else {
            if (!decryptedNotes && secret) {
                const n = await decrypt(secret.notes);
                setDecryptedNotes(n);
            }
            setShowNotes(true);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        await Clipboard.setStringAsync(text);
        Alert.alert('Copied', `${label} copied to clipboard.`);
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Secret',
            'Are you sure you want to delete this secret?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const db = await getDB();
                            await db.runAsync('DELETE FROM secrets WHERE id = ?', [Number(id)]);
                            router.back();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete secret');
                        }
                    }
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    if (!secret) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Secret not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Ionicons name="lock-closed" size={40} color={theme.tint} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>{secret.title}</Text>
                <Text style={[styles.subtitle, { color: theme.icon }]}>{secret.category || 'Uncategorized'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.label, { color: theme.icon }]}>Username</Text>
                <View style={[styles.row, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.value, { color: theme.text }]}>{secret.username || '-'}</Text>
                    {secret.username ? (
                        <TouchableOpacity onPress={() => copyToClipboard(secret.username, 'Username')}>
                            <Ionicons name="copy-outline" size={20} color={theme.tint} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.label, { color: theme.icon }]}>Password</Text>
                <View style={[styles.row, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.value, { color: theme.text }]}>
                        {showPassword ? decryptedPassword : '••••••••••••'}
                    </Text>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleTogglePassword} style={styles.actionBtn}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={async () => {
                            if (!showPassword) await handleTogglePassword(); // Ensure decrypted before copy? No, better decrypt just for copy if needed, but here simple flow
                            const pass = decryptedPassword || await decrypt(secret.password); // Decrypt if not already
                            copyToClipboard(pass, 'Password');
                        }} style={styles.actionBtn}>
                            <Ionicons name="copy-outline" size={20} color={theme.tint} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {secret.uri ? (
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.icon }]}>Website</Text>
                    <View style={[styles.row, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.value, { color: theme.tint }]}>{secret.uri}</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(secret.uri, 'URI')}>
                            <Ionicons name="copy-outline" size={20} color={theme.tint} />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}

            {secret.notes ? (
                <View style={styles.section}>
                    <Text style={[styles.label, { color: theme.icon }]}>Notes</Text>
                    <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.value, { color: theme.text }]}>
                            {showNotes ? decryptedNotes : '(Encrypted Notes)'}
                        </Text>
                        <TouchableOpacity onPress={handleToggleNotes} style={styles.noteToggle}>
                            <Text style={{ color: theme.tint }}>{showNotes ? 'Hide' : 'Show'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}

            <TouchableOpacity
                style={[styles.deleteButton, { borderColor: theme.border }]}
                onPress={handleDelete}
            >
                <Text style={styles.deleteText}>Delete Secret</Text>
            </TouchableOpacity>
        </ScrollView>
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
        alignItems: 'center',
        paddingVertical: 30,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        paddingBottom: 8,
    },
    value: {
        fontSize: 16,
        flex: 1,
        marginRight: 10,
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        marginLeft: 16,
    },
    box: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    noteToggle: {
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    deleteButton: {
        margin: 20,
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        marginBottom: 50,
    },
    deleteText: {
        color: '#EF4444', // Red
        fontWeight: '600',
        fontSize: 16,
    },
});
