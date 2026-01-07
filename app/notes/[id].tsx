import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Note = {
    id: number;
    title: string;
    content: string;
    is_pinned: number;
    updated_at: string;
};

export default function NoteDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadNote = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const db = await getDB();
            const noteId = Array.isArray(id) ? Number(id[0]) : Number(id);

            if (isNaN(noteId)) {
                Alert.alert('Error', 'Invalid Note ID');
                router.back();
                return;
            }

            const result = await db.getAllAsync<Note>('SELECT * FROM notes WHERE id = ?', [noteId]);
            if (result && result.length > 0) {
                const noteData = result[0];
                setNote(noteData);
                setTitle(noteData.title);
                setContent(noteData.content);
            } else {
                Alert.alert('Error', 'Note not found');
                router.back();
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load note');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNote();
        }, [id])
    );

    const handleSave = async () => {
        if (!title && !content) return;
        try {
            setIsSubmitting(true);
            const db = await getDB();
            // Update updated_at automatically? SQLite datetime('now') usually good.
            await db.runAsync(
                'UPDATE notes SET title = ?, content = ?, updated_at = datetime("now") WHERE id = ?',
                [title, content, Number(id)]
            );
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to update note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const db = await getDB();
                        await db.runAsync('DELETE FROM notes WHERE id = ?', [Number(id)]);
                        router.back();
                    } catch (e) {
                        console.error(e);
                        Alert.alert('Error', 'Failed to delete note');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color={theme.tint} />
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                            <Ionicons name="trash-outline" size={24} color="#EF4444" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} disabled={isSubmitting} style={styles.saveBtn}>
                            <Text style={{ color: theme.tint, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView style={styles.scrollContent}>
                    <TextInput
                        style={[styles.titleInput, { color: theme.text }]}
                        placeholder="Title"
                        placeholderTextColor={theme.icon}
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[styles.contentInput, { color: theme.text }]}
                        placeholder="Note content..."
                        placeholderTextColor={theme.icon}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBtn: {
        padding: 4,
    },
    saveBtn: {
        padding: 4,
    },
    scrollContent: {
        flex: 1,
        padding: 20,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    contentInput: {
        fontSize: 16,
        flex: 1,
        minHeight: 200,
    },
});
