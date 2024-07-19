// Used for allowing the user ID to be obtained easily from the
// token in the API request headers

import { Request } from 'express';

export default interface AuthenticatedRequest extends Request {
    user?: any;
}