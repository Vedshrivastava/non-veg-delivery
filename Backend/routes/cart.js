import express from 'express'
import {addToCart, removeFromCart, getCart, updateCartQuantity, updateDeliveryType} from '../controllers/cart.js'
import {authMiddleware} from '../middlewares/auth.js'

const cart = express.Router()

cart.post('/add', authMiddleware, addToCart)
cart.delete('/remove', authMiddleware, removeFromCart)
cart.get('/get', authMiddleware, getCart)
cart.post('/update', authMiddleware, updateCartQuantity)
cart.post('/update-delivery-type', authMiddleware, updateDeliveryType)

export default cart;