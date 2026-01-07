import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddNote() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!title && !content) {
            router.back(); // Just info
            return;
        }

        try {
            setIsSubmitting(true);
            const db = await getDB();
            const finalTitle = title || 'Untitled Note';

            await db.runAsync(
                'INSERT INTO notes (title, content) VALUES (?, ?)',
                [finalTitle, content]
            );

            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save note.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: theme.tint, fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
                        <Text style={{ color: theme.tint, fontWeight: 'bold', fontSize: 16 }}>Save</Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
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
