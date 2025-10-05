import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z
    .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().positive().int().default(4000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    DATABASE_SSL: z.string().optional(),
    SUI_RPC_URL: z.string().url('SUI_RPC_URL must be a valid URL'),
    PDW_PACKAGE_ID: z.string().regex(/^0x[0-9a-fA-F]+$/, 'PDW_PACKAGE_ID must be a valid Sui object ID'),
    PDW_ACCESS_REGISTRY_ID: z.string().regex(/^0x[0-9a-fA-F]+$/, 'PDW_ACCESS_REGISTRY_ID must be a valid Sui object ID'),
    PDW_API_URL: z.string().url().optional(),
    PDW_CONTEXT_APP_ID: z.string().min(1).optional(),
    PDW_CONSENT_STORAGE_PATH: z.string().min(1).optional(),
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
    GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
    GEMINI_EMBEDDING_MODEL: z.string().default('text-embedding-004'),
    WALRUS_UPLOAD_RELAY: z.string().url().optional(),
    WALRUS_STORAGE_EPOCHS: z.coerce.number().positive().int().optional(),
    WALRUS_STORAGE_TIMEOUT: z.coerce.number().positive().int().optional(),
    LOG_LEVEL: z.string().optional(),
})
    .transform((env) => {
    const sslValue = typeof env.DATABASE_SSL === 'string' ? env.DATABASE_SSL.toLowerCase() : undefined;
    const databaseSsl = sslValue === 'true' ||
        sslValue === '1' ||
        (sslValue === undefined && env.NODE_ENV === 'production');
    return {
        nodeEnv: env.NODE_ENV,
        port: env.PORT,
        databaseUrl: env.DATABASE_URL,
        databaseSsl,
        suiRpcUrl: env.SUI_RPC_URL,
        pdwPackageId: env.PDW_PACKAGE_ID,
        pdwAccessRegistryId: env.PDW_ACCESS_REGISTRY_ID,
        pdwApiUrl: env.PDW_API_URL,
        pdwContextAppId: env.PDW_CONTEXT_APP_ID,
        pdwConsentStoragePath: env.PDW_CONSENT_STORAGE_PATH,
        geminiApiKey: env.GEMINI_API_KEY,
        geminiModel: env.GEMINI_MODEL,
        geminiEmbeddingModel: env.GEMINI_EMBEDDING_MODEL,
        walrusUploadRelay: env.WALRUS_UPLOAD_RELAY,
        walrusStorageEpochs: env.WALRUS_STORAGE_EPOCHS ?? 3,
        walrusStorageTimeout: env.WALRUS_STORAGE_TIMEOUT ?? 60000,
        logLevel: env.LOG_LEVEL ?? 'info',
    };
});
let cachedConfig = null;
export function loadConfig() {
    if (!cachedConfig) {
        cachedConfig = envSchema.parse(process.env);
    }
    return cachedConfig;
}
