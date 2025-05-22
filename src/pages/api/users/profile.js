import connect from "@/lib/db";
import { getUserModel } from "@/lib/models";
import { withTenant } from "@/lib/middleware/tenantMiddleware";
import { sendSuccess, sendError, sendBadRequest } from "@/lib/utils/responseHandler";
import bcrypt from "bcryptjs";

async function handler(req, res) {
  try {
    const { method } = req;
    
    // The user and company info is added by the tenant middleware
    const { id: userId } = req.user;
    
    await connect();
    
    // Get User model from our centralized registry
    const User = getUserModel();
    
    switch (method) {
      case "GET":
        // Get user profile
        const user = await User.findById(userId)
          .select("-password")
          .populate("companyId", "name isActive");
          
        if (!user) {
          return sendBadRequest(res, "User not found");
        }
        
        return sendSuccess(res, "Profile retrieved successfully", user);
        
      case "PUT":
        // Update user profile
        const { name, email, currentPassword, newPassword } = req.body;
        
        // Verify required fields
        if (!name) {
          return sendBadRequest(res, "Name is required");
        }
        
        // Build update object
        const updateData = { name };
        
        // Handle email change if provided
        if (email) {
          const existingUser = await User.findOne({ 
            email, 
            _id: { $ne: userId } 
          });
          
          if (existingUser) {
            return sendBadRequest(res, "Email is already in use");
          }
          
          updateData.email = email;
        }
        
        // Handle password change if both current and new passwords provided
        if (currentPassword && newPassword) {
          // Get user with password
          const userWithPassword = await User.findById(userId).select("+password");
          
          // Verify current password
          const isPasswordValid = await userWithPassword.comparePassword(currentPassword);
          if (!isPasswordValid) {
            return sendBadRequest(res, "Current password is incorrect");
          }
          
          // Validate new password
          if (newPassword.length < 6) {
            return sendBadRequest(res, "New password must be at least 6 characters");
          }
          
          // Hash new password
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(newPassword, salt);
        }
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          updateData,
          { new: true, runValidators: true }
        ).select("-password")
         .populate("companyId", "name isActive");
        
        return sendSuccess(res, "Profile updated successfully", updatedUser);
        
      default:
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Profile API error:", error);
    return sendError(res, error);
  }
}

// Wrap handler with tenant middleware
export default withTenant(handler); 