/**
 * Configuration management for Seal service
 */
import { SealConfig } from './types.js';
export declare const config: {
    port: number;
    nodeEnv: string;
    logLevel: string;
    corsOrigin: string[];
    sui: {
        network: string;
        rpcUrl: string;
    };
    seal: SealConfig;
};
export default config;
