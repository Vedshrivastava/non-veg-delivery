import express from 'express';
import { addReview, editReview, deleteReview, getReviews } from '../controllers/review.js';
import {authMiddleware} from '../middlewares/auth.js';

const review = express.Router();

review.post('/add', authMiddleware, addReview);

review.put('/update/:reviewId', authMiddleware, editReview);

review.delete('/delete/:reviewId', authMiddleware, deleteReview);

review.get('/food/:foodId', getReviews);

export default review;
