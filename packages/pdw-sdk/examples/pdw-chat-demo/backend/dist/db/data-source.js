import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ChatSession } from '../entities/ChatSession.js';
import { ChatMessage } from '../entities/ChatMessage.js';
import { CreateChatTables1728144000000 } from './migrations/1728144000000-CreateChatTables.js';
let dataSource = null;
function buildDataSource(config) {
    return new DataSource({
        type: 'postgres',
        url: config.databaseUrl,
        entities: [ChatSession, ChatMessage],
        migrations: [CreateChatTables1728144000000],
        synchronize: false,
        logging: config.nodeEnv !== 'production',
        ssl: config.databaseSsl
            ? {
                rejectUnauthorized: false,
            }
            : false,
    });
}
export async function ensureDatabaseConnection(config) {
    if (!dataSource) {
        dataSource = buildDataSource(config);
    }
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }
    return dataSource;
}
export function getDataSource() {
    if (!dataSource || !dataSource.isInitialized) {
        throw new Error('Data source has not been initialized');
    }
    return dataSource;
}
