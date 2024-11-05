import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';

// Middleware for consumer authentication
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Received token:", token); // Log the token for debugging

    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized: No token provided." });
    }

    if (token.split('.').length !== 3) {
        console.log('Invalid token format:', token);
        return res.status(401).json({ success: false, message: "Invalid token format." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY_CONSUMER);
        console.log("Decoded token payload:", decoded);  

        req.userId = decoded.id;  
        req.userName = decoded.name;  
        req.userEmail = decoded.email;  

        console.log("User ID from token:", req.userId);  
        next();  
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token has expired. Please log in again." });
        }
        console.log('Token verification error:', error);
        return res.status(401).json({ success: false, message: "Invalid token: " + error.message });
    }
};

// Middleware for admin authentication
const adminAuthMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Received token for admin:", token); // Log the token for debugging

    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized: No token provided." });
    }

    if (token.split('.').length !== 3) {
        console.log('Invalid token format:', token);
        return res.status(401).json({ success: false, message: "Invalid token format." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY_ADMIN);
        console.log("Decoded admin token payload:", decoded);  

        req.userId = decoded._id;  
        req.userName = decoded.name;  
        req.userEmail = decoded.email;  

        console.log("Admin User ID from token:", req.userId);  
        next();  
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token has expired. Please log in again." });
        }
        console.log('Admin token verification error:', error);
        return res.status(401).json({ success: false, message: "Invalid token: " + error.message });
    }
};

// Middleware for manager authentication
const managerAuthMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Received token for manager:", token); // Log the token for debugging

    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized: No token provided." });
    }

    if (token.split('.').length !== 3) {
        console.log('Invalid token format:', token);
        return res.status(401).json({ success: false, message: "Invalid token format." });
    }

    // Try to verify the token as a manager first
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY_MANAGER);
        console.log("Decoded manager token payload:", decoded);  

        req.userId = decoded.id;  
        req.userName = decoded.name;  
        req.userEmail = decoded.email;  

        console.log("Manager User ID from token:", req.userId);  
        next();  
    } catch (error) {
        console.log('Manager token verification error:', error);

        // If the manager token verification fails, try admin token
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY_ADMIN);
            console.log("Decoded admin token payload:", decoded);  

            req.userId = decoded._id;  
            req.userName = decoded.name;  
            req.userEmail = decoded.email;  

            console.log("Admin User ID from token:", req.userId);  
            next();  
        } catch (adminError) {
            if (adminError.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: "Token has expired. Please log in again." });
            }
            console.log('Admin token verification error:', adminError);
            return res.status(401).json({ success: false, message: "Invalid token for both manager and admin: " + adminError.message });
        }
    }
};

const verifyUserMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    // Log the incoming token for debugging
    console.log("Authorization Header:", req.headers.authorization);
    console.log("Extracted Token:", token);
  
    // Check if token exists
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ success: false, message: 'Not Authorized: No token provided.' });
    }
  
    // Check for valid JWT token format
    if (token.split('.').length !== 3) {
      console.log("Invalid token format:", token);
      return res.status(401).json({ success: false, message: 'Invalid token format.' });
    }
  
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_KEY_CONSUMER);
      req.userId = decoded.id;
  
      // Log the decoded token and extracted user ID
      console.log("Decoded Token:", decoded);
      console.log("User ID from token:", req.userId);
  
      // Find the user in the database
      const user = await userModel.findById(req.userId);
  
      // Log the found user or log if user not found
      if (!user) {
        console.log("User not found for ID:", req.userId);
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      console.log("User found:", user);
  
      // Check if the user is verified
      if (!user.isVerified) {
        console.log("User not verified:", user.email);
  
        // Delete user if not verified
        await userModel.findByIdAndDelete(req.userId);
        console.log("User deleted due to verification failure:", req.userId);
  
        return res.status(403).json({ success: false, message: 'User not verified. Please sign up again.' });
      }
  
      // Log if the user is verified
      console.log("User is verified, proceeding...");
      next();
  
    } catch (error) {
      console.log("Error verifying token:", error);
  
      // Handle specific JWT expiration error
      if (error.name === 'TokenExpiredError') {
        console.log("Token expired");
        return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
      }
  
      return res.status(401).json({ success: false, message: 'Invalid token: ' + error.message });
    }
  };
  

export { adminAuthMiddleware, authMiddleware, managerAuthMiddleware, verifyUserMiddleware };
