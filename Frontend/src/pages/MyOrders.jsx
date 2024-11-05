import React, { useContext, useEffect, useState } from 'react';
import '../styles/myorders.css';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';
import { assets } from '../assets/frontend_assets/assets';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { color } from 'framer-motion';

const MyOrders = () => {
    const [data, setData] = useState([]);
    const [prevStatuses, setPrevStatuses] = useState({}); // To track previous statuses
    const { url, token } = useContext(StoreContext);

    // Fetch all orders initially
    const fetchOrders = async () => {
        try {
            const response = await axios.post(
                `${url}/api/order/user-orders`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(response.data.data);

            // Store previous statuses for comparison
            const statuses = {};
            response.data.data.forEach(order => {
                statuses[order._id] = order.status;
            });
            setPrevStatuses(statuses);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    // Function to check for status updates
    const trackOrder = async (orderId, currentStatus) => {
        try {
            const response = await axios.post(
                `${url}/api/order/user-orders`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedOrder = response.data.data.find(order => order._id === orderId);

            if (updatedOrder) {
                // Compare the status
                if (updatedOrder.status === currentStatus) {
                    toast.error('No updates yet', { autoClose: 1500 }); // Ensure toast auto closes
                } else {
                    toast.success('Order status updated', { autoClose: 1500 });
                    setTimeout(() => {
                        window.location.reload(); // Refresh the page after 3 seconds
                    }, 1500);
                }
            }
        } catch (error) {
            console.error("Error tracking order:", error);
            toast.error('Failed to track order', { autoClose: 1500 });
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className='container'>
                {data.map((order) => (
                    <div className='my-orders-order' key={order._id}>
                        <img src={assets.parcel_icon} alt="Parcel Icon" />
                        <p>
                            {order.items.map((item, index) => (
                                <span key={index}>
                                    {item.name} x {item.quantity}
                                    {index !== order.items.length - 1 && ', '}
                                </span>
                            ))}
                        </p>
                        <p>₹{order.amount}.00</p>
                        <p>Items: {order.items.length}</p>
                        <p>
                            <span>&#x25cf;</span> <b>{order.status}</b>
                        </p>
                        <button onClick={() => trackOrder(order._id, order.status)}>
                            Track Order
                        </button>
                        {/* Add Call Restaurant button */}
                        {order.restaurantPhone && ( // Check if restaurantPhone exists
                            <a href={`tel:${order.restaurantPhone}`} className="call-button" style={{color: 'green'}}>
                                📞 Call Restaurant
                            </a>
                        )}
                    </div>
                ))}
            </div>
            <ToastContainer /> {/* Only one ToastContainer, make sure it's not duplicated */}
        </div>
    );
};

export default MyOrders;
