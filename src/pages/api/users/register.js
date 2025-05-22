import dbConnect from "@/lib/dbConnect";
import { sendSuccess, sendError, sendBadRequest } from "@/lib/utils/responseHandler";
import { serialize } from "cookie";
import mongoose from "mongoose";
import User from "@/models/User";
import Token from "@/models/Token";
import { generateToken } from "../../../../actions/jwt";
import bcrypt from "bcrypt";

async function handler(req, res) {
  const { name, email, password, role } = req.body;

  // Basic input validation
  if (!name || !email || !password || !role) {
    return sendBadRequest(res, "Please fill all required fields");
  }

  try {
    await dbConnect();    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return sendBadRequest(res, "Email already exists!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password : hashedPassword,
      role,
      lastLogin: new Date()
    });
    // Save the user to the database    
    const user = await newUser.save();

    // Generate a token with user and company information
    const token = generateToken(user._id, role);

    // Create token record
    const tokenRecord = new Token({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day expiration
    });

    // Save the token to the database
    await tokenRecord.save();

    // Serialize the token for cookie
    const serialized = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/"
    });

    // Send the response
    res.setHeader("Set-Cookie", serialized);
    // return sendSuccess({res, "Registration successful",data: {
    //   name: user.name,
    //   email: user.email,
    //   role: user.role,
    //   id: user._id  
    // }, 201});

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id
      }
    });
    

  } catch (error) {
    return sendError(res, error);
  }
}

export default handler;
