import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Platform, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDB } from '../../src/db';
import { Colors } from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UploadBill() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [merchant, setMerchant] = useState('');
    const [total, setTotal] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            performOCR(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 1,
            });
            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
                performOCR(result.assets[0].uri);
            }
        } else {
            Alert.alert('Permission Denied', 'Camera permission is required.');
        }
    };

    const performOCR = async (uri: string) => {
        try {
            setIsSubmitting(true);
            const result = await TextRecognition.recognize(uri, TextRecognitionScript.LATIN);

            const lines = result.text.split('\n');
            let foundTotal = '';

            // Keywords to prioritize final amounts
            const amountKeywords = ['total', 'grand total', 'amount due', 'amount', 'balance', 'pay', 'net', 'due', 'cash'];

            // Regex to find currency amounts: 
            // Supports: $10.00, 10.00, 1,000.00, 100
            // Captures the numeric part group(1)
            const currencyRegex = /[\$€£₹]?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].toLowerCase();

                // Check if line contains any interesting keyword
                if (amountKeywords.some(keyword => line.includes(keyword))) {
                    const matches = lines[i].match(currencyRegex);
                    if (matches && matches[1]) {
                        // Remove commas for storage
                        const cleanAmount = matches[1].replace(/,/g, '');
                        const parsed = parseFloat(cleanAmount);

                        // Heuristic: Prefer later matches (often totals are at bottom)
                        if (!isNaN(parsed) && parsed > 0) {
                            foundTotal = cleanAmount;
                        }
                    }
                }
            }

            if (foundTotal) setTotal(foundTotal);

            if (lines.length > 0 && !merchant) {
                const possibleMerchant = lines.find(l => l.trim().length > 3) || '';
                setMerchant(possibleMerchant.trim());
            }

            Alert.alert('OCR Complete', 'Scanning complete. Please verify extracted details.');

        } catch (e) {
            console.error('OCR Error:', e);
            Alert.alert('OCR Failed', 'Could not extract text from image.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSave = async () => {
        if (!merchant || !total) {
            Alert.alert('Missing Info', 'Please enter merchant name and total amount.');
            return;
        }

        try {
            setIsSubmitting(true);
            const db = await getDB();

            // Insert Bill
            const result = await db.runAsync(
                'INSERT INTO bills (image_uri, merchant_name, date, total_amount) VALUES (?, ?, ?, ?)',
                [imageUri, merchant, date, parseFloat(total)]
            );

            // Retrieve the ID of the inserted bill? 
            // expo-sqlite runAsync returns { lastInsertRowId, changes }
            const billId = result.lastInsertRowId;

            // Navigate to Details to add items (Analysis step placeholder)
            router.replace(`/bills/${billId}`);

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save bill.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: theme.tint, fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Add Bill</Text>
                    <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
                        <Text style={{ color: theme.tint, fontWeight: 'bold', fontSize: 16 }}>Next</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.imageSection}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        ) : (
                            <View style={[styles.placeholder, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="image-outline" size={48} color={theme.icon} />
                                <Text style={{ color: theme.icon, marginTop: 8 }}>No Image Selected</Text>
                            </View>
                        )}

                        <View style={styles.imageActions}>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.tint }]} onPress={takePhoto}>
                                <Ionicons name="camera" size={20} color="#fff" />
                                <Text style={styles.actionText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]} onPress={pickImage}>
                                <Ionicons name="images" size={20} color={theme.text} />
                                <Text style={[styles.actionText, { color: theme.text }]}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <Text style={[styles.label, { color: theme.icon }]}>Merchant Name</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                            placeholder="e.g. Walmart"
                            placeholderTextColor={theme.icon}
                            value={merchant}
                            onChangeText={setMerchant}
                        />

                        <Text style={[styles.label, { color: theme.icon }]}>Total Amount</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                            placeholder="0.00"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                            value={total}
                            onChangeText={setTotal}
                        />

                        <Text style={[styles.label, { color: theme.icon }]}>Date</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                            value={date}
                            onChangeText={setDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.icon}
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color={theme.icon} />
                        <Text style={[styles.infoText, { color: theme.icon }]}>
                            Upload an image of the bill. In the next step, you can view the bill and manually extract/add items.
                            (Automated AI Analysis requires an API Key).
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 20,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    previewImage: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        resizeMode: 'contain',
        backgroundColor: '#000',
    },
    placeholder: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageActions: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    form: {
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    input: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
    },
    infoBox: {
        flexDirection: 'row',
        marginTop: 24,
        padding: 12,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 8,
        gap: 8,
    },
    infoText: {
        fontSize: 12,
        flex: 1,
    }
});
