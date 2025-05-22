import { verifyToken } from "../../actions/jwt";
import dbConnect from "./dbConnect";
import User from "@/models/User";

export const getDataFromToken = async (token) => {
  if (!token) {
    // console.log("getDataFromToken: No token provided");
    return { success: false, error: "No token provided" };
  }
  try {
    // Verify token
    const { valid, decoded, error } = verifyToken(token);

    if (!valid) {
      // console.log(`getDataFromToken: Token invalid: ${error}`);
      return { success: false, error: error || "Invalid token" };
    }

    // Log token contents for debugging
    // console.log(`Token verified successfully. ID=${decoded.id}, Role=${decoded.role}, CompanyId=${decoded.companyId}`);

    await dbConnect();

    // Find user to ensure they exist and are active
    const user = await User.findOne({
      _id: decoded.id,
    });

    if (!user) {
      // console.log(`getDataFromToken: User not found or inactive. ID=${decoded.id}, CompanyId=${decoded.companyId}`);
      return { success: false, error: "User not found or inactive" };
    }

    // Return all the relevant data
    return {
      success: true,
      id: user._id,
      role: decoded.role,
      user,
    };
  } catch (error) {
    // console.error("Token extraction error:", error);
    return {
      success: false,
      error: error.message || "Error extracting data from token",
    };
  }
};

// Keep the old function for backward compatibility
export const getIdFromToken = async (token) => {
  const result = await getDataFromToken(token);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, id: result.id };
};
