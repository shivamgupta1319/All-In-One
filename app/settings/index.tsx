import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { exportBackup, importBackup } from '../../src/services/backup';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const handleBackup = async () => {
        await exportBackup();
    };

    const handleRestore = async () => {
        await importBackup();
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.icon }]}>Data Management</Text>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}
                        onPress={handleBackup}
                    >
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#10B981' }]}>
                                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={[styles.rowTitle, { color: theme.text }]}>Backup Data</Text>
                                <Text style={[styles.rowSubtitle, { color: theme.icon }]}>Export to File / Drive</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={handleRestore}
                    >
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#F59E0B' }]}>
                                <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={[styles.rowTitle, { color: theme.text }]}>Restore Data</Text>
                                <Text style={[styles.rowSubtitle, { color: theme.icon }]}>Import from Backup File</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.infoText, { color: theme.icon }]}>
                    Backups serve as a snapshot of your data. You can save the backup file to Google Drive or any other storage.
                    Restoring will overwrite current data.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.icon }]}>About</Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconBox, { backgroundColor: theme.tint }]}>
                                <Ionicons name="information-circle-outline" size={20} color="#fff" />
                            </View>
                            <Text style={[styles.rowTitle, { color: theme.text }]}>Version 1.0.0</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    rowSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    infoText: {
        fontSize: 12,
        marginTop: 8,
        marginLeft: 4,
    }
});
