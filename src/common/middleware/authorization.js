import { unauthorizedExeption } from "../utils/index.js";

export const authorizationMiddleware = (accpetedRoles=[]) => {
    
    return (req, res, next) => {
        if (!accpetedRoles.includes(req.user?.role)) {
            return next(unauthorizedExeption("Unauthorized to access this resource"));
        }
        next();
    }
}