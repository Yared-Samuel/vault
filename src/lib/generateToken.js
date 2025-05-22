import { sign } from "jsonwebtoken";
export default async function generateToken(id) {
const jwt_secret = process.env.JWT_SECRET
    return sign({id}, jwt_secret,{expiresIn: "1d" });
}