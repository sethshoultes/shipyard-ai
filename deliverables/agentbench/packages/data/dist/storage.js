/**
 * Storage abstraction interface for agentbench.
 * Provides a unified interface for data persistence, enabling future migration
 * from SQLite to other backends (e.g., Postgres) without changing application code.
 */
/**
 * Adapter to convert SyncStorage to async Storage.
 * Useful for providing a consistent interface while using SQLite internally.
 */
export class AsyncStorageAdapter {
    syncStorage;
    constructor(syncStorage) {
        this.syncStorage = syncStorage;
    }
    async connect() {
        this.syncStorage.connect();
    }
    async close() {
        this.syncStorage.close();
    }
    isConnected() {
        return this.syncStorage.isConnected();
    }
    async createRun(input) {
        return this.syncStorage.createRun(input);
    }
    async getRun(id) {
        return this.syncStorage.getRun(id);
    }
    async updateRun(id, updates) {
        return this.syncStorage.updateRun(id, updates);
    }
    async deleteRun(id) {
        return this.syncStorage.deleteRun(id);
    }
    async listRuns(filters) {
        return this.syncStorage.listRuns(filters);
    }
    async findRunsByStatus(status) {
        return this.syncStorage.findRunsByStatus(status);
    }
    async createResult(input) {
        return this.syncStorage.createResult(input);
    }
    async getResult(id) {
        return this.syncStorage.getResult(id);
    }
    async getResultsForRun(runId) {
        return this.syncStorage.getResultsForRun(runId);
    }
    async deleteResultsForRun(runId) {
        return this.syncStorage.deleteResultsForRun(runId);
    }
    async createCheckpoint(input) {
        return this.syncStorage.createCheckpoint(input);
    }
    async getLatestCheckpoint(runId) {
        return this.syncStorage.getLatestCheckpoint(runId);
    }
    async getCheckpointsForRun(runId) {
        return this.syncStorage.getCheckpointsForRun(runId);
    }
    async deleteCheckpointsForRun(runId) {
        return this.syncStorage.deleteCheckpointsForRun(runId);
    }
    async transaction(fn) {
        // Note: This doesn't provide true async transaction support
        // For SQLite, transactions are synchronous anyway
        return fn();
    }
    async migrate() {
        this.syncStorage.migrate();
    }
    async sync() {
        this.syncStorage.sync();
    }
}
/**
 * Registry of storage factories
 */
const storageFactories = new Map();
/**
 * Register a storage factory for a provider.
 */
export function registerStorageFactory(provider, factory) {
    storageFactories.set(provider, factory);
}
/**
 * Create a storage instance based on configuration.
 */
export function createStorage(config) {
    const factory = storageFactories.get(config.provider);
    if (!factory) {
        throw new Error(`No storage factory registered for provider: ${config.provider}. ` +
            `Available providers: ${Array.from(storageFactories.keys()).join(', ')}`);
    }
    return factory(config);
}
/**
 * Check if a storage provider is available.
 */
export function isProviderAvailable(provider) {
    return storageFactories.has(provider);
}
/**
 * Get all available storage providers.
 */
export function getAvailableProviders() {
    return Array.from(storageFactories.keys());
}
//# sourceMappingURL=storage.js.map