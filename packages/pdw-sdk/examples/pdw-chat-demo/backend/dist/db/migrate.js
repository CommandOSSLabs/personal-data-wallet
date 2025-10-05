import { loadConfig } from '../config/env.js';
import { ensureDatabaseConnection } from './data-source.js';
async function runMigrations() {
    const config = loadConfig();
    const dataSource = await ensureDatabaseConnection(config);
    try {
        const results = await dataSource.runMigrations();
        results.forEach((result) => {
            console.log(`Executed migration: ${result.name}`);
        });
        if (results.length === 0) {
            console.log('No migrations were executed. Database is up to date.');
        }
    }
    finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}
runMigrations().catch((error) => {
    console.error('Failed to run migrations', error);
    process.exit(1);
});
