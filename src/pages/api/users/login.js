import dbConnect from "@/lib/dbConnect";
import { sendSuccess, sendError, sendBadRequest, sendNotFound, sendUnauthorized } from "@/lib/utils/responseHandler";
import { serialize } from "cookie";
import bcrypt from 'bcryptjs';
import User from "@/models/User";
import generateToken from "@/lib/generateToken";
import Token from "@/models/Token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 24, // 1 day
  path: "/"
};

// Map of role-specific messages and handling
const roleConfig = {
  'admin': {
    loginMessage: "Admin login successful",
    dashboardRedirect: "/checks/new"
  },
  'accountant': {
    loginMessage: "Accountant login successful",
    dashboardRedirect: "/checks/new"
  },
  'owner': {
    loginMessage: "Owner login successful",
    dashboardRedirect: "/checks/new"
  },
  'cashier': {
    loginMessage: "Cashier login successful",
    dashboardRedirect: "/checks/new"
  },
  'purchaser': {
    loginMessage: "Purchaser login successful",
    dashboardRedirect: "/checks/new"
  }
};

export default async function Login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendBadRequest(res, "Email and password are required");
    }

    await dbConnect();
    // const Company = getCompanyModel();
    // Find user and populate company details
    const user = await User.findOne({ email })
      .select('+password')
    console.log(user);
    if (!user) {
      console.log(`User not found: ${email}`);
      return sendNotFound(res, "User not found");
    }    
    // Verify password using bcrypt directly
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
      
      // console.log(`Password verification result: ${isValidPassword}`);
      if (!isValidPassword) {
        // console.log('Password verification failed. Stored password hash:', user.password);
      }
    } catch (err) {
      console.error(`Error during password verification: ${err.message}`);
      console.error('Error details:', err);
      return sendError(res, "Error during password verification");
    }

    if (!isValidPassword) {
      return sendBadRequest(res, "Invalid credentials");
    }

    // Get role-specific config or use defaults
    const roleInfo = roleConfig[user.role] || {
      loginMessage: "Login successful",
      dashboardRedirect: "/transactions"
    };


    // Generate token with user ID and company ID
    const token = await generateToken(
      user._id,
      user.role
    );
    
    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

        // Create token record
        const tokenRecord = new Token({
          userId: user._id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day expiration
        });

        await tokenRecord.save();
    // Set the authentication cookie
    res.setHeader("Set-Cookie", serialize("token", token, COOKIE_OPTIONS));
    
    // Return success response with role-specific message
    return res.status(200).json({
      success: true,
      message: roleInfo.loginMessage,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, error);
  }
}




