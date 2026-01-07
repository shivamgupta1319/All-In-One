import { documentDirectory, getInfoAsync, copyAsync, makeDirectoryAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';

const DB_NAME = 'life_manager.db';
const DB_PATH = documentDirectory + 'SQLite/' + DB_NAME; // Path used by expo-sqlite

// Export Database
export const exportBackup = async () => {
    try {
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert('Error', 'Sharing is not available on this platform');
            return;
        }

        // Check if DB exists
        const info = await getInfoAsync(DB_PATH);
        if (!info.exists) {
            Alert.alert('Error', 'Database file not found');
            return;
        }

        // Copy to cache for sharing
        const backupPath = documentDirectory + 'life_manager_backup_' + new Date().toISOString().split('T')[0] + '.db';
        await copyAsync({
            from: DB_PATH,
            to: backupPath
        });

        await Sharing.shareAsync(backupPath, {
            mimeType: 'application/x-sqlite3',
            dialogTitle: 'Backup Life Manager Data',
            UTI: 'public.database'
        });

    } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to export backup');
    }
};

// Import Database
export const importBackup = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*', // Allow all, often DB files have various extensions or custom
            copyToCacheDirectory: true
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        if (!asset) return;

        // Simple validation check (size > 0)
        if (asset.size && asset.size === 0) {
            Alert.alert('Error', 'Invalid file');
            return;
        }

        Alert.alert(
            'Confirm Restore',
            'This will overwrite all current data. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Ensure SQLite folder exists (though it should)
                            const sqliteDir = documentDirectory + 'SQLite/';
                            const dirInfo = await getInfoAsync(sqliteDir);
                            if (!dirInfo.exists) {
                                await makeDirectoryAsync(sqliteDir, { intermediates: true });
                            }

                            // Overwrite DB
                            await copyAsync({
                                from: asset.uri,
                                to: DB_PATH
                            });

                            // expo-sqlite < 14 might need reload. 
                            // Modern expo-sqlite might handle it if we close/reopen.
                            // But safest is to ask user to restart app.
                            Alert.alert('Success', 'Data restored. Please restart the app for changes to take effect.');
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', 'Failed to restore backup');
                        }
                    }
                }
            ]
        );

    } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to pick file');
    }
};
