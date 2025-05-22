import jwt from 'jsonwebtoken';

// Generates a JWT token containing user info for authentication
// @param userId - The ID of the user
// @param companyId - The ID of the company the user belongs to
// @param role - The user's role (e.g. 'admin', 'company_admin', etc)
// @param operator - Optional ID of store being operated, defaults to null if user isn't a store operator
export function generateToken(userId, role) {
    return jwt.sign(
        {
            id: userId,
            role
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: '1d'
        }
    );
}

export function verifyToken(token) {
    try {
        return {
            valid: true,
            decoded: jwt.verify(token, process.env.JWT_SECRET)
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
}

