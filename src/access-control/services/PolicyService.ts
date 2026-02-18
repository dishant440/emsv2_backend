import Policy from '../../models/Policy';
import PolicyLoader from '../engine/PolicyLoader';
import { logger } from '../../config/logger';

class PolicyService {
    /** Create a new policy */
    async create(data: Record<string, any>) {
        const policy = await Policy.create(data);
        PolicyLoader.invalidate(policy.resource);
        logger.info(`PolicyService: created policy "${policy.name}"`);
        return policy;
    }

    /** Update a policy with version increment */
    async update(policyId: string, updates: Record<string, any>) {
        const policy = await Policy.findById(policyId);
        if (!policy) throw new Error('Policy not found');

        Object.assign(policy, updates);
        policy.version += 1;
        await policy.save();

        PolicyLoader.invalidate(policy.resource);
        logger.info(`PolicyService: updated policy "${policy.name}" to v${policy.version}`);
        return policy;
    }

    /** Enable/disable a policy */
    async setActive(policyId: string, isActive: boolean) {
        const policy = await Policy.findByIdAndUpdate(policyId, { isActive }, { new: true });
        if (!policy) throw new Error('Policy not found');
        PolicyLoader.invalidate(policy.resource);
        logger.info(`PolicyService: ${isActive ? 'enabled' : 'disabled'} policy "${policy.name}"`);
        return policy;
    }

    /** List all policies, with optional resource filter */
    async list(resource?: string) {
        const query: Record<string, any> = {};
        if (resource) query.resource = resource;
        return Policy.find(query).sort({ resource: 1, priority: -1 }).lean();
    }

    /** Delete a policy */
    async delete(policyId: string) {
        const policy = await Policy.findByIdAndDelete(policyId);
        if (policy) {
            PolicyLoader.invalidate(policy.resource);
            logger.info(`PolicyService: deleted policy "${policy.name}"`);
        }
        return policy;
    }
}

export default new PolicyService();
