import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
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

export default function NotesList() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const loadNotes = async () => {
        try {
            setLoading(true);
            const db = await getDB();
            const result = await db.getAllAsync<Note>(
                'SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC'
            );
            setNotes(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotes();
        }, [])
    );

    const togglePin = async (id: number, currentStatus: number) => {
        try {
            const db = await getDB();
            await db.runAsync('UPDATE notes SET is_pinned = ? WHERE id = ?', [currentStatus ? 0 : 1, id]);
            loadNotes();
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item }: { item: Note }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push(`/notes/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <Text numberOfLines={1} style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                {item.is_pinned ? <Ionicons name="pin" size={16} color={theme.tint} /> : null}
            </View>
            <Text numberOfLines={3} style={[styles.cardContent, { color: theme.icon }]}>
                {item.content || 'No content'}
            </Text>
            <Text style={[styles.date, { color: theme.icon }]}>
                {new Date(item.updated_at).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {loading ? (
                <ActivityIndicator size="large" color={theme.tint} />
            ) : (
                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ color: theme.icon }}>No notes found.</Text>
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
    listContent: {
        padding: 16,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        aspectRatio: 0.8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 4,
    },
    cardContent: {
        fontSize: 14,
        flex: 1,
    },
    date: {
        fontSize: 12,
        marginTop: 8,
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
        width: '100%',
    }
});
