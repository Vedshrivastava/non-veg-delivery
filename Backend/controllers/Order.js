import Order from "../models/Order.js";  // Capitalized
import User from "../models/user.js";    // Assuming 'user.js' exports in lowercase
import Stripe from "stripe";
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';
import userModel from "../models/user.js";

const frontend_url = "http://localhost:5173";

// User's Orders
const userOrders = async (req, res) => {
    try {
        console.log("This is userID in order Controller", req.userId);

        // Fetch paid orders for the user
        const orders = await Order.find({
            userId: req.userId,
        }).sort({ date: -1 });

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error retrieving orders" });
    }
};

// List all paid orders
const listOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ date: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error retrieving orders" });
    }
};

// Update order status
const updateStatus = async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated Successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error updating status" });
    }
};
const phonepeOrder = async (req, res) => {
    try {
        console.log("Received request:", req.body);

        // Step 1: Create the order in your database
        const newOrder = new Order({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount, // Storing the amount in paise
            address: req.body.address,
            payment: false // Payment not yet completed
        });
        const savedOrder = await newOrder.save(); // Save the order to the database
        const transactionId = savedOrder._id; // Use order ID as the transaction ID

        // Step 2: Prepare the data object for PhonePe payment
        const data = {
            merchantId: process.env.MERCHANT_ID,
            merchantTransactionId: transactionId, // Use the newly created order's ID
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount * 100, // Convert amount to paise if needed
            address: req.body.address,
            redirectUrl: `http://localhost:4000/api/order/status?id=${transactionId}`, // Redirect URL with transaction ID (order ID)
            redirectMode: "POST",
            paymentInstrument: {
                type: "PAY_PAGE"
            },
        };

        console.log("Payload data prepared:", data);

        // Step 3: Create checksum and send request to PhonePe
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        console.log("Base64 encoded payload:", payloadMain);

        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + process.env.SALT_KEY;
        console.log("String for checksum:", string);

        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        console.log("SHA256 checksum:", sha256);

        const checksum = sha256 + '###' + keyIndex;
        console.log("Final checksum:", checksum);

        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
        console.log("Production URL:", prod_URL);

        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            },
        };

        console.log("Options for axios request:", options);

        await axios(options).then(function(response) {
            console.log("Response from PhonePe API:", response.data);
            console.log("Transaction ID used for payment:", transactionId); // Log the transaction ID used for payment
            return res.json(response.data); // Consider extracting transaction ID from response if available
        }).catch(function(error) {
            console.error("Error occurred:", error);
            return res.status(500).json({ error: error.response ? error.response.data : "Internal Server Error" });
        });

    } catch (error) {
        console.error("Error occurred:", error.response ? error.response.data : error.message);
        return res.status(500).json({ error: error.response ? error.response.data : "Internal Server Error" });
    }
};

const status = async (req, res) => {
    try {
        const merchantTransactionId = req.query.id; // This should match the ID used in phonepeOrder (order ID)
        const merchantId = process.env.MERCHANT_ID;
        const salt_key = process.env.SALT_KEY;

        console.log("Checking status for transaction ID:", merchantTransactionId); // Log the transaction ID for status check

        const keyIndex = 1;
        const SHA256 = (input) => {
            return crypto.createHash('sha256').update(input).digest('hex');
        };
        const checksum = SHA256("/pg/v1/status/" + merchantId + "/" + merchantTransactionId + salt_key) + "###" + keyIndex;

        const options = {
            method: 'GET',
            url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': `${merchantId}`
            }
        };

        // Step 4: Making the request to PhonePe to check payment status
        const response = await axios.request(options);

        console.log('Response from PhonePe API:', response.data);

        if (response.data.success === true) {
            // Step 5: If the transaction was successful, update the order status
            await Order.findByIdAndUpdate(merchantTransactionId, { payment: true });

            // Step 6: Clear the user's cart
            const order = await Order.findById(merchantTransactionId);  // Get the order details
            const userId = order.userId;  // Get the user ID from the order

            // Clear the cart data for the user
            await userModel.findByIdAndUpdate(userId, { $set: { cartData: {} } });

            // Step 7: Redirect to the success URL
            const successUrl = `http://localhost:5173/success`;
            console.log('Redirecting to:', successUrl);
            return res.redirect(successUrl);
        } else {
            // Step 8: If the transaction failed, redirect to failure URL
            const failureUrl = `http://localhost:5173/fail`;
            console.log('Redirecting to:', failureUrl);
            return res.redirect(failureUrl);
        }
    } catch (error) {
        console.error('Error while processing status:', error);

        // Redirecting to the failure URL in case of an error
        const failureUrl = `http://localhost:5173/api/order/fail`;
        console.log('Error occurred, redirecting to:', failureUrl);
        return res.redirect(failureUrl);
    }
};

const codOrder = async (req, res) => {
    try {
        console.log("Received COD order request:", req.body);

        const newOrder = new Order({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false
        });

        const savedOrder = await newOrder.save();
        const transactionId = savedOrder._id;

        console.log("Transaction ID for COD order:", transactionId);

        const order = await Order.findById(transactionId);  
        const userId = order.userId;  

        // Clear the cart data for the user
        await userModel.findByIdAndUpdate(userId, { $set: { cartData: {} } });

        const successUrl = `http://localhost:5173/success`;
        return res.status(200).json({ success: true, successUrl });

    } catch (error) {
        console.error("Error occurred while processing COD order:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export { userOrders, listOrders, updateStatus, phonepeOrder, status, codOrder };
