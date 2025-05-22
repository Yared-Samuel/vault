import { sendForbidden } from "@/lib/utils/responseHandler";

/**
 * Middleware to restrict access based on user roles
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the endpoint
 * @returns {Function} Middleware function
 */
export function protectRoute(allowedRoles = []) {
  return (handler) => {
    return async (req, res) => {
      try {
        // Get token from cookies
        const token = req.cookies?.token;
        if (!token) {
          console.log("protectRoute: No token found");
          return sendForbidden(res, "Authentication required");
        }
        
        // Extract user data from token
        const { verifyToken } = require("@/actions/jwt");
        // Verify token
        const { valid, decoded, error } = verifyToken(token);
        
        if (!valid) {
          console.log(`protectRoute: Token invalid: ${error}`);
          return sendForbidden(res, error || "Invalid authentication");
        }
        
        // Add user info to request object
        req.user = {
          id: decoded.id,
          role: decoded.role
        };
        
        // Admin role has access to everything
        if (req.user.role === 'admin') {
          return handler(req, res);
        }
        
        // Check if user's role is in the allowed roles
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
          console.log(`protectRoute: User role ${req.user.role} not in allowed roles:`, allowedRoles);
          return sendForbidden(res, "You don't have permission to access this resource");
        }
        
        // All checks passed, allow access
        return handler(req, res);
      } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return sendForbidden(res, "Access control error");
      }
    };
  };
} 