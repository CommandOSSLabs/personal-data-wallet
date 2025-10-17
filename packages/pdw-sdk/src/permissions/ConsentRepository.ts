import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

import {
  ConsentRequestRecord,
  ConsentStatus,
} from '../types/wallet.js';
import { normalizeSuiAddress } from '@mysten/sui/utils';

export interface ConsentRepository {
  save(request: ConsentRequestRecord): Promise<void>;
  updateStatus(requestId: string, status: ConsentStatus, updatedAt: number): Promise<void>;
  getById(requestId: string): Promise<ConsentRequestRecord | null>;
  listByTarget(targetWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]>;
  listByRequester(requesterWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]>;
  delete(requestId: string): Promise<void>;
}

interface StoredConsentRecord extends ConsentRequestRecord {}

function normalizeRecord(record: ConsentRequestRecord): StoredConsentRecord {
  return {
    ...record,
    requesterWallet: normalizeSuiAddress(record.requesterWallet),
    targetWallet: normalizeSuiAddress(record.targetWallet),
  };
}

export class FileSystemConsentRepository implements ConsentRepository {
  private filePath: string;
  private initialized = false;

  constructor(options?: { filePath?: string }) {
  this.filePath = options?.filePath ?? resolve(__dirname, '../../storage/consents/requests.json');
  }

  async save(request: ConsentRequestRecord): Promise<void> {
    const records = await this.readAll();
    const normalized = normalizeRecord(request);
    const index = records.findIndex((item) => item.requestId === normalized.requestId);
    if (index >= 0) {
      records[index] = normalized;
    } else {
      records.push(normalized);
    }
    await this.writeAll(records);
  }

  async updateStatus(requestId: string, status: ConsentStatus, updatedAt: number): Promise<void> {
    const records = await this.readAll();
    const index = records.findIndex((item) => item.requestId === requestId);
    if (index === -1) {
      return;
    }

    records[index] = {
      ...records[index],
      status,
      updatedAt,
    };

    await this.writeAll(records);
  }

  async getById(requestId: string): Promise<ConsentRequestRecord | null> {
    const records = await this.readAll();
    const record = records.find((item) => item.requestId === requestId);
    return record ? { ...record } : null;
  }

  async listByTarget(targetWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]> {
    const normalizedTarget = normalizeSuiAddress(targetWallet);
    const records = await this.readAll();
    return records
      .filter((record) => record.targetWallet === normalizedTarget)
      .filter((record) => (status ? record.status === status : true))
      .map((record) => ({ ...record }));
  }

  async listByRequester(requesterWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]> {
    const normalizedRequester = normalizeSuiAddress(requesterWallet);
    const records = await this.readAll();
    return records
      .filter((record) => record.requesterWallet === normalizedRequester)
      .filter((record) => (status ? record.status === status : true))
      .map((record) => ({ ...record }));
  }

  async delete(requestId: string): Promise<void> {
    const records = await this.readAll();
    const filtered = records.filter((record) => record.requestId !== requestId);
    if (filtered.length === records.length) {
      return;
    }
    await this.writeAll(filtered);
  }

  private async readAll(): Promise<StoredConsentRecord[]> {
    await this.ensureInitialized();
    try {
      const buffer = await readFile(this.filePath);
      const parsed = JSON.parse(buffer.toString()) as StoredConsentRecord[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((record) => normalizeRecord(record));
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeAll(records: StoredConsentRecord[]): Promise<void> {
    await this.ensureInitialized();
    const serialized = JSON.stringify(records, null, 2);
    await writeFile(this.filePath, serialized, { encoding: 'utf-8' });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const dir = dirname(this.filePath);
    await mkdir(dir, { recursive: true });
    this.initialized = true;
  }
}

export class InMemoryConsentRepository implements ConsentRepository {
  private store = new Map<string, StoredConsentRecord>();

  async save(request: ConsentRequestRecord): Promise<void> {
    const normalized = normalizeRecord(request);
    this.store.set(normalized.requestId, normalized);
  }

  async updateStatus(requestId: string, status: ConsentStatus, updatedAt: number): Promise<void> {
    const record = this.store.get(requestId);
    if (!record) {
      return;
    }
    this.store.set(requestId, {
      ...record,
      status,
      updatedAt,
    });
  }

  async getById(requestId: string): Promise<ConsentRequestRecord | null> {
    const record = this.store.get(requestId);
    return record ? { ...record } : null;
  }

  async listByTarget(targetWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]> {
    const normalizedTarget = normalizeSuiAddress(targetWallet);
    return Array.from(this.store.values())
      .filter((record) => record.targetWallet === normalizedTarget)
      .filter((record) => (status ? record.status === status : true))
      .map((record) => ({ ...record }));
  }

  async listByRequester(requesterWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]> {
    const normalizedRequester = normalizeSuiAddress(requesterWallet);
    return Array.from(this.store.values())
      .filter((record) => record.requesterWallet === normalizedRequester)
      .filter((record) => (status ? record.status === status : true))
      .map((record) => ({ ...record }));
  }

  async delete(requestId: string): Promise<void> {
    this.store.delete(requestId);
  }
}
