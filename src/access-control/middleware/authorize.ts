import { Request, Response, NextFunction } from 'express';
import PolicyEvaluator from '../engine/PolicyEvaluator';
import Employee from '../../models/Employee';
import { ISubject } from '../../types/models';
import { IEvaluationContext } from '../../types/policy';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../config/logger';

interface AuthorizeOptions {
    /** Async function to load the resource data needed for condition evaluation */
    resourceLoader?: (req: Request) => Promise<Record<string, any> | null>;
}

/**
 * Express middleware factory for policy-based authorization.
 *
 * Usage:
 *   router.get('/employees', authenticate, authorize('employee', 'list'), controller.list);
 *   router.put('/leave/:id', authenticate, authorize('leave_request', 'approve', {
 *     resourceLoader: (req) => LeaveRequest.findById(req.params.id).populate('employeeId').lean()
 *   }), controller.review);
 */
export function authorize(resource: string, action: string, options: AuthorizeOptions = {}) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                throw ApiError.unauthorized('Authentication required');
            }

            // 1. Build subject
            const subject = await buildSubject(req.user);

            // 2. Build context
            const context: IEvaluationContext = {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                resourceId: (req.params.id || req.params.employeeId) as string,
                resourceData: null,
            };

            if (options.resourceLoader) {
                context.resourceData = await options.resourceLoader(req);
            }

            // 3. Evaluate policy
            const decision = await PolicyEvaluator.evaluate(subject, resource, action, context);

            if (decision.allowed) {
                req.accessControl = { subject, decision };
                return next();
            }

            // 4. Deny
            throw ApiError.forbidden(decision.reason);
        } catch (error) {
            if (error instanceof ApiError) {
                return next(error);
            }
            logger.error('authorize middleware error', { error });
            next(ApiError.internal('Authorization system error'));
        }
    };
}

/**
 * Build a rich subject object from the JWT-decoded user.
 * Enriches with employee profile data for condition evaluation.
 */
async function buildSubject(jwtUser: { userId: string; role: string; email: string }): Promise<ISubject> {
    const subject: ISubject = {
        userId: jwtUser.userId,
        role: jwtUser.role,
        email: jwtUser.email,
    };

    // Enrich with employee profile data
    if (jwtUser.role !== 'admin') {
        const employee = await Employee.findOne({ userId: jwtUser.userId }).lean();
        if (employee) {
            subject.employeeId = employee._id;
            subject.department = employee.department;
            subject.dateOfJoining = employee.dateOfJoining;
        }
    }

    return subject;
}
