import { IPolicyCondition, IEvaluationContext, ConditionHandler } from '../../types/policy';
import { ISubject } from '../../types/models';
import { logger } from '../../config/logger';

/**
 * Evaluates policy conditions using a pluggable handler registry.
 * All built-in condition types are registered at construction time.
 * New condition types can be registered via register().
 */
class ConditionEvaluator {
    private handlers: Map<string, ConditionHandler> = new Map();

    constructor() {
        this.registerBuiltins();
    }

    /** Register a new condition type handler */
    register(type: string, handler: ConditionHandler): void {
        this.handlers.set(type, handler);
    }

    /** Evaluate a single condition */
    async evaluate(
        condition: IPolicyCondition,
        subject: Record<string, any>,
        context: IEvaluationContext
    ): Promise<boolean> {
        const handler = this.handlers.get(condition.type);
        if (!handler) {
            logger.warn(`ConditionEvaluator: unknown condition type "${condition.type}" — fail-closed`);
            return false;
        }
        try {
            return await handler(condition, subject, context);
        } catch (err) {
            logger.error(`ConditionEvaluator: error evaluating "${condition.type}"`, { error: err });
            return false; // Fail-closed on error
        }
    }

    private registerBuiltins(): void {
        // ── Ownership: resource field must match a subject field ──
        this.register('ownership', (condition, subject, context) => {
            const resourceValue = this.resolve(condition.field, context.resourceData || {});
            const subjectValue = this.resolve(condition.valueSource, { subject });
            return this.compare(resourceValue, subjectValue, condition.operator || 'equals');
        });

        // ── Department Match: subject and resource share a department ──
        this.register('department_match', (condition, subject, context) => {
            const subjectDept = this.resolve(condition.subjectField, { subject });
            const resourceDept = this.resolve(condition.resourceField, {
                resource: context.resourceData,
            });
            return this.compare(subjectDept, resourceDept, condition.operator || 'equals');
        });

        // ── Threshold: numeric comparison on a resource field ──
        this.register('threshold', (condition, _subject, context) => {
            const fieldValue = this.resolve(condition.field, {
                resource: context.resourceData,
            });
            return this.compare(Number(fieldValue), Number(condition.value), condition.operator || 'less_than');
        });

        // ── Time Window: allow only during specific hours ──
        this.register('time_window', (condition) => {
            const now = new Date();
            const hour = now.getHours();
            const { startHour, endHour } = condition.value || {};
            if (startHour === undefined || endHour === undefined) return true;
            return hour >= startHour && hour < endHour;
        });

        // ── Probation Check: true if probation period is OVER ──
        this.register('probation_check', (condition, subject) => {
            const joiningDate = new Date(this.resolve(condition.field, { subject }) as string);
            if (isNaN(joiningDate.getTime())) return true; // No joining date = skip
            const probationMonths = condition.value || 6;
            const probationEnd = new Date(joiningDate);
            probationEnd.setMonth(probationEnd.getMonth() + probationMonths);
            return new Date() > probationEnd;
        });

        // ── Date Range: policy valid within a date range ──
        this.register('date_range', (condition) => {
            const now = new Date();
            if (condition.value?.from && now < new Date(condition.value.from)) return false;
            if (condition.value?.until && now > new Date(condition.value.until)) return false;
            return true;
        });
    }

    /** Resolve a dot-path like "subject.department" from a data object */
    private resolve(path: string | undefined, data: Record<string, any>): any {
        if (!path || !data) return undefined;
        return path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
    }

    /** Compare two values with an operator */
    private compare(a: any, b: any, operator: string): boolean {
        switch (operator) {
            case 'equals':
                return String(a) === String(b);
            case 'not_equals':
                return String(a) !== String(b);
            case 'less_than':
                return Number(a) < Number(b);
            case 'greater_than':
                return Number(a) > Number(b);
            case 'less_than_or_equal':
                return Number(a) <= Number(b);
            case 'greater_than_or_equal':
                return Number(a) >= Number(b);
            case 'in':
                return Array.isArray(b) && b.includes(a);
            case 'not_in':
                return Array.isArray(b) && !b.includes(a);
            default:
                return a === b;
        }
    }
}

// Singleton
export default new ConditionEvaluator();
