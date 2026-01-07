import 'react-native-get-random-values';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

const KEY_ALIAS = 'life_manager_master_key';

// In a real app, this might be derived from a user password + salt.
// For now, we auto-generate a strong key and store it in SecureStore.
export const getMasterKey = async (): Promise<string> => {
    let key = await SecureStore.getItemAsync(KEY_ALIAS);
    if (!key) {
        console.log('Generating new Master Key...');
        key = CryptoJS.lib.WordArray.random(256 / 8).toString();
        await SecureStore.setItemAsync(KEY_ALIAS, key);
    }
    return key;
};

export const encrypt = async (text: string): Promise<string> => {
    if (!text) return '';
    const key = await getMasterKey();
    return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = async (cipherText: string): Promise<string> => {
    if (!cipherText) return '';
    const key = await getMasterKey();
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
};
