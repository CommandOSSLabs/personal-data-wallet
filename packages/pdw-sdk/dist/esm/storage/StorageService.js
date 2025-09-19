/**
 * Storage Service
 *
 * Handles Walrus storage operations with Quilts support, caching,
 * local fallback, and metadata management.
 */
export class StorageService {
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }
    /**
     * Upload content to Walrus storage
     */
    async upload(content, options) {
        // TODO: Implement Walrus upload with caching
        throw new Error('Storage service not yet implemented');
    }
    /**
     * Upload multiple files as a Walrus Quilt
     */
    async uploadQuilt(files, options) {
        // TODO: Implement Walrus Quilts upload
        throw new Error('Walrus Quilts not yet implemented');
    }
    /**
     * Retrieve content from storage
     */
    async retrieve(blobId) {
        // TODO: Implement retrieval with caching and fallback
        throw new Error('Storage service not yet implemented');
    }
    /**
     * Retrieve files from a Walrus Quilt
     */
    async retrieveQuilt(quiltId) {
        // TODO: Implement Quilt retrieval
        throw new Error('Walrus Quilts not yet implemented');
    }
}
//# sourceMappingURL=StorageService.js.map