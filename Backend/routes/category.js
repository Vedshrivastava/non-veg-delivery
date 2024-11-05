import express from 'express';
import multer from 'multer';
import { addCategory, listCategories, removeCategory } from '../controllers/category.js';
import { adminAuthMiddleware } from '../middlewares/auth.js';

const category = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage });

category.post('/add-category', adminAuthMiddleware, upload.single('image'), addCategory);
category.get('/get-categories', listCategories);
category.delete('/remove', adminAuthMiddleware, removeCategory)

export default category;
