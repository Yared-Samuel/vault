import cookie from 'cookie';
import { withTenant } from "@/lib/middleware/tenantMiddleware";

export const loginStatus = async (req, res) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token; // Access the 'token' cookie

    if (!token) {
        return res.status(401).json({ success: false, message: "Token not found!" });
      }
    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if(verified){
        return res.status(200).json({ success: true, message: "User is logged in!" });
    }
}

// Wrap handler with both middlewares
export default withTenant(loginStatus);