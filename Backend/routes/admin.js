import express from "express";
import { loginAdmin } from "../controllers/admin.js";
import { forgotPassword, resetPassword, verifyCode, checkAuth } from '../controllers/user.js'
import { verifyToken } from '../middlewares/verifyToken.js';


const admin = express.Router();

admin.post("/login-admin", loginAdmin);
admin.post('/verify-email', verifyCode);
admin.post('/forgot-password', forgotPassword)
admin.post('/reset-password/:token', resetPassword);
admin.get('/check-auth', verifyToken, checkAuth);

export default admin;
