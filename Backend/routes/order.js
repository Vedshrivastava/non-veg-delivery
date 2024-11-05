import express from 'express'
import {adminAuthMiddleware, authMiddleware, managerAuthMiddleware, verifyUserMiddleware} from '../middlewares/auth.js';
import { userOrders, listOrders, phonepeOrder, codOrder, updateStatus } from '../controllers/Order.js';

const order = express.Router()

order.post('/user-orders', authMiddleware, userOrders)

order.get('/list', managerAuthMiddleware, listOrders)

order.post('/order', verifyUserMiddleware, phonepeOrder)

order.post('/status', managerAuthMiddleware, updateStatus)

order.post('/cod', verifyUserMiddleware, codOrder)

export default order;