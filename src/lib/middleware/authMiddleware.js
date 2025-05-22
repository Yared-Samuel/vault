import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendUnauthorized, sendError } from "@/lib/utils/responseHandler";

export function authenticateUser(handler) {
  return async (req, res) => {
    try {
      // Get token from cookies
      const token = req.cookies?.token;
      
      if (!token) {
        console.log("Auth middleware: No token found");
        return sendUnauthorized(res, "Authentication required");
      }
      
      // Extract user data from token
      const tokenData = await getDataFromToken(token);
      
      if (!tokenData.success) {
        console.log(`Auth middleware: Token validation failed: ${tokenData.error}`);
        return sendUnauthorized(res, tokenData.error || "Invalid authentication");
      }
      
      // Add user info to request object
      req.user = {
        id: tokenData.id,
        role: tokenData.role,
      };
      // Call the handler function
      return handler(req, res);
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return sendError(res, error);
    }
  };
} 