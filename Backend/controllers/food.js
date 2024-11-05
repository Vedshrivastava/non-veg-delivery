import Food from "../models/food.js";
import cloudinary from 'cloudinary';
import fs from 'fs';

const addFood = async (req, res) => {
    console.log('Request body:', req.body);

    try {
        let imageUrl = '';

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'food_images'
            });
            imageUrl = result.secure_url;

            fs.unlinkSync(req.file.path);
        }

        const food = new Food({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: imageUrl
        });

        await food.save();
        res.json({ success: true, message: 'Food Added' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error adding food' });
    }
};

const listFood = async (req, res) => {
    try {
        const foods = await Food.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error fetching food list' });
    }
};

const removeFood = async (req, res) => {
    const { _id } = req.body;

    try {
        const food = await Food.findById(_id);

        if (!food) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        if (food.image) {
            const publicId = food.image.split('/').pop().split('.')[0];
            await cloudinary.v2.uploader.destroy(`food_images/${publicId}`);
        }

        await Food.findByIdAndDelete(_id);
        res.json({ success: true, message: 'Food Removed' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error removing food' });
    }
};

const updateStock = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Log the incoming request body
        const { _id, stock } = req.body; // Extract stock from request body
        console.log({ _id, stock }); // Log the values being sent

        // Validate the input
        if (!(_id && typeof stock === 'boolean')) {
            return res.status(400).json({ success: false, message: "Invalid input" });
        }

        // Update the inStock field
        const updatedFood = await Food.findByIdAndUpdate(
            _id, 
            { inStock: stock }, // Correct field name in update
            { new: true } // Return the updated document
        );

        console.log("Updated Food:", updatedFood); // Log the updated food document

        // Check if the food item exists
        if (!updatedFood) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        res.json({ success: true, message: "Stock Updated Successfully" });
    } catch (error) {
        console.error("Error updating stock:", error); // Log the error
        res.status(500).json({ success: false, message: "Error updating stock" });
    }
};


export default updateStock;



const getReviewList = async (req, res) => {
    const { id } = req.params;

    try {
        const food = await Food.findById(id).populate('reviews'); 
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        res.json({ success: true, reviews: food.reviews });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error fetching reviews' });
    }
};

const searchFood = async (req, res) => {
    const { query } = req.query;

    try {
        if (!query) {
            return res.status(400).json({ success: false, message: 'No search query provided' });
        }

        // Trim and remove extra spaces from the query
        const cleanedQuery = query.replace(/\s+/g, '').toLowerCase();

        // Search food by name using regex for case-insensitive and gap-insensitive search
        const foods = await Food.find({
            name: {
                $regex: new RegExp(cleanedQuery, 'i')
            }
        });

        if (foods.length === 0) {
            return res.status(404).json({ success: false, message: 'No food items found' });
        }

        res.status(200).json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error searching for food' });
    }
};


export { addFood, listFood, removeFood, getReviewList, searchFood, updateStock };