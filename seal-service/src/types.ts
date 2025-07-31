/**
 * Type definitions for Seal encryption service
 */

export interface EncryptionRequest {
  data: string; // hex-encoded data
  identity: string;
  policy: AccessPolicy;
}

export interface EncryptionResponse {
  encrypted_data: string; // base64-encoded encrypted data
  servers_used: number;
  timestamp: string;
  success: boolean;
}

export interface KeyRequest {
  ibe_identity: string;
  sui_ptb: SuiTransaction;
  signature: string;
  timestamp: string;
}

export interface KeyResponse {
  decryption_key: string; // base64-encoded session key
  metadata: KeyMetadata;
  success: boolean;
}

export interface DecryptionRequest {
  encrypted_data: string; // base64-encoded
  decryption_key: string; // base64-encoded
  identity: string;
}

export interface DecryptionResponse {
  decrypted_data: string; // hex-encoded
  success: boolean;
}

export interface AccessPolicy {
  owner: string;
  category: string;
  timestamp: string;
  access_rules: string[];
  policy_hash: string;
}

export interface SuiTransaction {
  transaction_type: string;
  embedding_id?: string;
  user_address: string;
  timestamp: string;
  function_call?: {
    package: string;
    module: string;
    function: string;
    arguments: any[];
  };
}

export interface KeyMetadata {
  identity: string;
  servers_contacted: number;
  threshold_met: boolean;
  timestamp: string;
}

export interface SealConfig {
  suiRpcUrl: string;
  keyServerIds: string[];
  threshold: number;
  verifyKeyServers: boolean;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  timestamp: string;
  success: false;
}