"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryConsentRepository = exports.FileSystemConsentRepository = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const utils_1 = require("@mysten/sui/utils");
function normalizeRecord(record) {
    return {
        ...record,
        requesterWallet: (0, utils_1.normalizeSuiAddress)(record.requesterWallet),
        targetWallet: (0, utils_1.normalizeSuiAddress)(record.targetWallet),
    };
}
class FileSystemConsentRepository {
    constructor(options) {
        this.initialized = false;
        this.filePath = options?.filePath ?? (0, path_1.resolve)(__dirname, '../../storage/consents/requests.json');
    }
    async save(request) {
        const records = await this.readAll();
        const normalized = normalizeRecord(request);
        const index = records.findIndex((item) => item.requestId === normalized.requestId);
        if (index >= 0) {
            records[index] = normalized;
        }
        else {
            records.push(normalized);
        }
        await this.writeAll(records);
    }
    async updateStatus(requestId, status, updatedAt) {
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
    async getById(requestId) {
        const records = await this.readAll();
        const record = records.find((item) => item.requestId === requestId);
        return record ? { ...record } : null;
    }
    async listByTarget(targetWallet, status) {
        const normalizedTarget = (0, utils_1.normalizeSuiAddress)(targetWallet);
        const records = await this.readAll();
        return records
            .filter((record) => record.targetWallet === normalizedTarget)
            .filter((record) => (status ? record.status === status : true))
            .map((record) => ({ ...record }));
    }
    async listByRequester(requesterWallet, status) {
        const normalizedRequester = (0, utils_1.normalizeSuiAddress)(requesterWallet);
        const records = await this.readAll();
        return records
            .filter((record) => record.requesterWallet === normalizedRequester)
            .filter((record) => (status ? record.status === status : true))
            .map((record) => ({ ...record }));
    }
    async delete(requestId) {
        const records = await this.readAll();
        const filtered = records.filter((record) => record.requestId !== requestId);
        if (filtered.length === records.length) {
            return;
        }
        await this.writeAll(filtered);
    }
    async readAll() {
        await this.ensureInitialized();
        try {
            const buffer = await (0, promises_1.readFile)(this.filePath);
            const parsed = JSON.parse(buffer.toString());
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed.map((record) => normalizeRecord(record));
        }
        catch (error) {
            if (error?.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }
    async writeAll(records) {
        await this.ensureInitialized();
        const serialized = JSON.stringify(records, null, 2);
        await (0, promises_1.writeFile)(this.filePath, serialized, { encoding: 'utf-8' });
    }
    async ensureInitialized() {
        if (this.initialized) {
            return;
        }
        const dir = (0, path_1.dirname)(this.filePath);
        await (0, promises_1.mkdir)(dir, { recursive: true });
        this.initialized = true;
    }
}
exports.FileSystemConsentRepository = FileSystemConsentRepository;
class InMemoryConsentRepository {
    constructor() {
        this.store = new Map();
    }
    async save(request) {
        const normalized = normalizeRecord(request);
        this.store.set(normalized.requestId, normalized);
    }
    async updateStatus(requestId, status, updatedAt) {
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
    async getById(requestId) {
        const record = this.store.get(requestId);
        return record ? { ...record } : null;
    }
    async listByTarget(targetWallet, status) {
        const normalizedTarget = (0, utils_1.normalizeSuiAddress)(targetWallet);
        return Array.from(this.store.values())
            .filter((record) => record.targetWallet === normalizedTarget)
            .filter((record) => (status ? record.status === status : true))
            .map((record) => ({ ...record }));
    }
    async listByRequester(requesterWallet, status) {
        const normalizedRequester = (0, utils_1.normalizeSuiAddress)(requesterWallet);
        return Array.from(this.store.values())
            .filter((record) => record.requesterWallet === normalizedRequester)
            .filter((record) => (status ? record.status === status : true))
            .map((record) => ({ ...record }));
    }
    async delete(requestId) {
        this.store.delete(requestId);
    }
}
exports.InMemoryConsentRepository = InMemoryConsentRepository;
//# sourceMappingURL=ConsentRepository.js.map