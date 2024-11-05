import userModel from "../models/user.js";
import reviewModel from "../models/review.js";
import foodModel from "../models/food.js";
import mongoose from 'mongoose';

// Add a Review
const addReview = async (req, res) => {
    try {
        const { username, userid, foodId, comment, rating } = req.body;

        console.log("Received userId:", userid);  
        console.log("Received foodId:", foodId);  
        console.log("Received username:", username);  

        const userObjectId = new mongoose.Types.ObjectId(userid);
        const foodObjectId = new mongoose.Types.ObjectId(foodId);

        const user = await userModel.findById(userObjectId);
        const foodItem = await foodModel.findById(foodObjectId);

        console.log("User:", user);  
        console.log("Food item:", foodItem);  

        if (!user) {
            console.error("User not found:", userid);  
            return res.status(404).json({ message: "User not found" });
        }

        if (!foodItem) {
            console.error("Food item not found:", foodId);  
            return res.status(404).json({ message: "Food item not found" });
        }

        const review = new reviewModel({
            comment,
            rating,
            author: userObjectId,  
            by: username  
        });

        console.log("Saving review:", review);  
        await review.save();

        foodItem.reviews.push(review._id);
        console.log("Saving food item with new review:", foodItem);  
        await foodItem.save();

        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        console.error("Error in addReview:", error);  
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const editReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { comment, rating } = req.body;

        const review = await reviewModel.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.author.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to edit this review" });
        }

        if (comment) review.comment = comment;
        if (rating) review.rating = rating;

        await review.save();

        res.status(200).json({ message: "Review updated successfully", review });
    } catch (error) {
        console.error('Error updating review:', error);  
        res.status(500).json({ message: "Server error" });
    }
};


const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await reviewModel.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.author.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        await reviewModel.findByIdAndDelete(reviewId);

        const foodItem = await foodModel.findOne({ reviews: reviewId });
        if (foodItem) {
            foodItem.reviews = foodItem.reviews.filter(id => id.toString() !== reviewId);
            await foodItem.save();
        }

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


const getReviews = async (req, res) => {
    try {
        const { foodId } = req.params;

        const foodItem = await foodModel.findById(foodId).populate('reviews');

        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }

        res.status(200).json({ reviews: foodItem.reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export { addReview, editReview, deleteReview, getReviews };
