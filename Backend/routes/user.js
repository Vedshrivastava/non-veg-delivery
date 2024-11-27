import express from 'express'
import { forgotPassword, loginUser, registerUser, resetPassword, verifyCode, checkAuth, verifyUser, getUser } from '../controllers/user.js'
import { verifyToken } from '../middlewares/verifyToken.js';
import { authMiddleware } from '../middlewares/auth.js';


const user = express.Router();

user.post('/register', registerUser);
user.post('/login', loginUser);
user.post('/verify', verifyCode);
user.post('/verify-again', verifyUser)
user.post('/forgot-password', forgotPassword)
user.post('/reset-password/:token', resetPassword);
user.get('/check-auth', verifyToken, checkAuth);
user.get('/get-user/:userId', getUser)

export default user;