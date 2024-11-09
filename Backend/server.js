import express from "express";
import cors from "cors";
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import food from "./routes/food.js";
import user from "./routes/user.js";
import admin from "./routes/admin.js";
import cart from "./routes/cart.js";
import category from "./routes/category.js";
import order from "./routes/order.js";
import review from "./routes/review.js";
import { wss } from "./middlewares/webSocket.js"; // Import WebSocket server

dotenv.config();

const app = express();
const port = 4000;

app.use(express.json());
app.use(cookieParser());

// Allowed origins for CORS
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:4000", "null", "ws://localhost:4000"];

// CORS middleware configuration
app.use(cors({
    origin: function (origin, callback) {
        console.log('Origin:', origin);
        if (!origin || allowedOrigins.includes(origin) || origin === null) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Connect to the database
connectDB(process.env.MONGO_URI);

// API routes
app.use('/api/food', food);
app.use('/api/user', user);
app.use('/api/admin', admin);
app.use('/api/cart', cart);
app.use('/api/order', order);
app.use('/api/category', category);
app.use('/api/review', review);
app.use('/images', express.static('uploads'));

// WebSocket upgrade event handler
app.server = app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

// Handle WebSocket upgrade request
app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Default route for health check
app.get("/", (req, res) => {
    res.send("API Working");
});
