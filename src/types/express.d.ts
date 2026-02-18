/* eslint-disable @typescript-eslint/no-namespace */

import { IUserPayload } from './models';

declare global {
    namespace Express {
        interface Request {
            /** JWT-decoded user payload, set by authenticate middleware */
            user?: IUserPayload;
            /** Enriched access control context, set by authorize middleware */
            accessControl?: {
                subject: Record<string, any>;
                decision: {
                    allowed: boolean;
                    policy: any;
                    reason: string;
                };
            };
        }
    }
}

export { };
