import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    inStock: { type: Boolean, default: true } 
});

const food = mongoose.models.food || mongoose.model("food", foodSchema);

export default food;
