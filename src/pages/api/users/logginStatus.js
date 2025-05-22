import User from '@/models/User';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { sendSuccess, sendError } from '@/lib/utils/responseHandler';
import dbConnect from '@/lib/dbConnect';

async function handler(req, res) {
  try {
    await dbConnect();
    console.log("logginStatus");
    console.log(req.cookies.token);
    console.log("logginStatus");
    const userData = await getDataFromToken(req.cookies.token);
    if (!userData) {
      return sendSuccess(res, "User not logged in", { isLoggedIn: false });
    }
    
    const user = await User.findById(userData.id).select('-password');
    if (!user) {
      return sendSuccess(res, "User not found", { isLoggedIn: false });
    }
    
    return sendSuccess(res, "User is logged in", { 
      isLoggedIn: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        
      }
    });
  } catch (error) {
    console.error("Login status error:", error);
    return sendError(res, error.message || "Error checking login status");
  }
}

export default handler;