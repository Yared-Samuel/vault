import { sendSuccess } from "@/lib/utils/responseHandler";
import { serialize } from "cookie";

async function handler(req, res) {
  // Only allow POST for logout operations
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    // Clear the token cookie by setting an expired date
    res.setHeader("Set-Cookie", serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: -1, // Expired
      path: "/"
    }));

    return sendSuccess(res, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during logout"
    });
  }
}

export default handler; 