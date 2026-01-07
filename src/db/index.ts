import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';
const DB_NAME = 'life_manager.db';

export const getDB = async () => {
    return await SQLite.openDatabaseAsync(DB_NAME);
};

export const initDB = async () => {
    const db = await getDB();

    try {
        await db.execAsync(SCHEMA.secrets);
        await db.execAsync(SCHEMA.transactions);
        await db.execAsync(SCHEMA.debts);
        await db.execAsync(SCHEMA.debts);
        await db.execAsync(SCHEMA.notes);
        await db.execAsync(SCHEMA.bills);
        await db.execAsync(SCHEMA.bill_items);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};
