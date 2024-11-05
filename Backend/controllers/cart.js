import userModel from '../models/user.js';

const addToCart = async (req, res) => {
    try {
        const userId = req.userId;  
        const { itemId } = req.body;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let cartData = userData.cartData || {};
        
        if (!cartData[itemId]) {
            cartData[itemId] = 1;
        } else {
            cartData[itemId] += 1;
        }

        await userModel.findByIdAndUpdate(userId, { $set: { cartData } });
        res.json({ success: true, message: "Added to cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to add to cart" });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.userId;  
        const { itemId, quantity } = req.body;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let cartData = userData.cartData || {};

        if (quantity <= 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }

        await userModel.findByIdAndUpdate(userId, { $set: { cartData } });
        res.json({ success: true, message: 'Cart item quantity updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update cart item quantity' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId;  
        const { itemId } = req.body;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let cartData = userData.cartData || {};
        delete cartData[itemId];

        await userModel.findByIdAndUpdate(userId, { $set: { cartData } });
        res.json({ success: true, message: "Removed from cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to remove" });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.userId;  

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const cartData = userData.cartData || {};

        res.json({ success: true, cartData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error retrieving cart data" });
    }
};

export { addToCart, removeFromCart, getCart, updateCartQuantity };
