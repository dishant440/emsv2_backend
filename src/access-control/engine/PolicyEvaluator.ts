import PolicyLoader from './PolicyLoader';
import ConditionEvaluator from './ConditionEvaluator';
import AuditService from '../services/AuditService';
import { IPolicyDocument, IEvaluationContext, IEvaluationDecision } from '../../types/policy';
import { logger } from '../../config/logger';

/**
 * Core PBAC engine. Evaluates whether a subject can perform an action on a resource.
 * Uses priority-based first-match evaluation with default-deny.
 */
class PolicyEvaluator {
    /**
     * Evaluate access.
     *
     * @param subject  - Enriched user object { userId, role, department, employeeId, ... }
     * @param resource - Resource name, e.g. 'leave_request'
     * @param action   - Action name, e.g. 'approve'
     * @param context  - Runtime context { resourceData, ipAddress, ... }
     */
    async evaluate(
        subject: Record<string, any>,
        resource: string,
        action: string,
        context: IEvaluationContext = {}
    ): Promise<IEvaluationDecision> {
        // 1. Load applicable policies (cached, sorted by priority DESC)
        const policies = await PolicyLoader.getPolicies(resource);

        // 2. Filter to time-valid policies
        const now = new Date();
        const validPolicies = policies.filter((p) => {
            if (p.validFrom && now < new Date(p.validFrom)) return false;
            if (p.validUntil && now > new Date(p.validUntil)) return false;
            return true;
        });

        // 3. Evaluate each policy in priority order
        for (const policy of validPolicies) {
            // 3a. Subject role match
            if (!this.matchesSubject(policy, subject)) continue;

            // 3b. Action match
            if (!policy.actions.includes(action) && !policy.actions.includes('*')) continue;

            // 3c. Evaluate all conditions (AND logic)
            const conditionsMet = await this.evaluateConditions(policy.conditions, subject, context);

            if (conditionsMet) {
                const decision: IEvaluationDecision = {
                    allowed: policy.effect === 'allow',
                    policy,
                    reason:
                        policy.effect === 'allow'
                            ? `Allowed by policy: ${policy.name}`
                            : `Denied by policy: ${policy.name}`,
                };

                // 4. Audit log (fire-and-forget)
                AuditService.log({
                    subjectId: subject.userId,
                    subjectRole: subject.role,
                    resource,
                    action,
                    decision: policy.effect,
                    policyId: policy._id,
                    policyName: policy.name,
                    context: { resourceId: context.resourceId },
                    ipAddress: context.ipAddress,
                    userAgent: context.userAgent,
                });

                logger.debug(`PolicyEvaluator: ${policy.effect} — ${policy.name}`, {
                    subject: subject.userId,
                    resource,
                    action,
                });

                return decision;
            }
        }

        // 5. Default deny
        AuditService.log({
            subjectId: subject.userId,
            subjectRole: subject.role,
            resource,
            action,
            decision: 'deny',
            policyName: 'DEFAULT_DENY',
            context: { resourceId: context.resourceId },
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
        });

        logger.debug('PolicyEvaluator: DEFAULT_DENY — no matching policy', {
            subject: subject.userId,
            resource,
            action,
        });

        return {
            allowed: false,
            policy: null,
            reason: 'No matching policy found — default deny',
        };
    }

    private matchesSubject(policy: IPolicyDocument, subject: Record<string, any>): boolean {
        const { roles, departments } = policy.subject;

        // Role match
        if (roles && roles.length > 0) {
            if (!roles.includes(subject.role) && !roles.includes('*')) {
                return false;
            }
        }

        // Department match (optional subject filter)
        if (departments && departments.length > 0) {
            if (!departments.includes(subject.department)) {
                return false;
            }
        }

        return true;
    }

    private async evaluateConditions(
        conditions: IPolicyDocument['conditions'],
        subject: Record<string, any>,
        context: IEvaluationContext
    ): Promise<boolean> {
        if (!conditions || conditions.length === 0) return true;

        for (const condition of conditions) {
            const result = await ConditionEvaluator.evaluate(condition, subject, context);
            if (!result) return false; // AND logic
        }
        return true;
    }
}

// Singleton
export default new PolicyEvaluator();
