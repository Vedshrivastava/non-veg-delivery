import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId},
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Food Processing" },
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: false },
    restaurantPhone: { type: String, default: "6262909398" },
});

const orderModel = mongoose.models.orders || mongoose.model("order", orderSchema);
export default orderModel;
