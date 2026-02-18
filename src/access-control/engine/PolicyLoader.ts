import Policy from '../../models/Policy';
import { IPolicyDocument } from '../../types/policy';
import { logger } from '../../config/logger';

/**
 * Loads policies from MongoDB and caches them in-memory with TTL.
 */
class PolicyLoader {
    private cache: Map<string, IPolicyDocument[]> = new Map();
    private timestamps: Map<string, number> = new Map();
    private ttl: number = 5 * 60 * 1000; // 5 minutes

    async getPolicies(resource: string): Promise<IPolicyDocument[]> {
        const now = Date.now();
        const lastLoaded = this.timestamps.get(resource) || 0;

        if (this.cache.has(resource) && now - lastLoaded < this.ttl) {
            return this.cache.get(resource)!;
        }

        logger.debug(`PolicyLoader: loading policies for resource "${resource}"`);

        const policies = (await Policy.find({
            resource,
            isActive: true,
        })
            .sort({ priority: -1 })
            .lean()) as IPolicyDocument[];

        this.cache.set(resource, policies);
        this.timestamps.set(resource, now);

        return policies;
    }

    invalidate(resource: string): void {
        this.cache.delete(resource);
        this.timestamps.delete(resource);
        logger.debug(`PolicyLoader: cache invalidated for resource "${resource}"`);
    }

    invalidateAll(): void {
        this.cache.clear();
        this.timestamps.clear();
        logger.debug('PolicyLoader: all caches invalidated');
    }
}

// Singleton
export default new PolicyLoader();
