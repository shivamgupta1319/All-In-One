import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const router = useRouter();

    const modules = [
        { name: 'Secrets', icon: 'lock-closed', route: '/secrets', color: '#6366F1' },
        { name: 'Finance', icon: 'wallet', route: '/finance', color: '#10B981' },
        { name: 'Notes', icon: 'document-text', route: '/notes', color: '#F59E0B' },
        { name: 'Settings', icon: 'settings', route: '/settings', color: '#64748B' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Life Manager</Text>
                    <Text style={[styles.subtitle, { color: theme.icon }]}>Secure. Organize. Thrive.</Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.cardText, { color: theme.text }]}>Welcome back!</Text>
                    <Text style={{ color: theme.icon }}>Your dashboard is ready.</Text>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Modules</Text>
                <View style={styles.grid}>
                    {modules.map((mod) => (
                        <TouchableOpacity
                            key={mod.name}
                            style={[styles.moduleCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => {
                                if (mod.route === '/finance' || mod.route === '/notes' || mod.route === '/settings' || mod.route === '/secrets' || mod.route === '/bills') {
                                    router.push(mod.route as any);
                                } else {
                                    alert('Feature coming soon!');
                                }
                            }}
                        >
                            <View style={[styles.iconBox, { backgroundColor: `${mod.color}20` }]}>
                                <Ionicons name={mod.icon as any} size={28} color={mod.color} />
                            </View>
                            <Text style={[styles.moduleText, { color: theme.text }]}>{mod.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        marginTop: 5,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 30,
    },
    cardText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    moduleCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: 1,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    moduleText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
