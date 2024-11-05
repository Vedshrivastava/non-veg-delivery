import Category from "../models/category.js";
import cloudinary from 'cloudinary';
import fs from 'fs';

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const addCategory = async (req, res) => {
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    let imageUrl = '';

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path);
            imageUrl = result.secure_url;

            fs.unlinkSync(req.file.path);
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            return res.json({ success: false, message: 'Error uploading image' });
        }
    }

    const category = new Category({
        name: req.body.name,
        image: imageUrl
    });

    try {
        await category.save();
        res.json({ success: true, message: 'Category Added' });
    } catch (error) {
        console.error('Error saving category:', error);
        res.json({ success: false, message: 'Error adding category' });
    }
};

const listCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json({ success: true, categories });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error" });
    }
};

const removeCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.body._id);

        if (category.image) {
            const publicId = category.image.split('/').pop().split('.')[0];

            await cloudinary.v2.uploader.destroy(publicId);
        }

        await Category.findByIdAndDelete(req.body._id);
        res.json({ success: true, message: 'Category Removed' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Some error occurred' });
    }
};

export { addCategory, listCategories, removeCategory };
