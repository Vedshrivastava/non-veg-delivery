import React, { useEffect, useState } from 'react';
import '../styles/orders.css';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { assets } from '../assets/admin_assets/assets';
import moment from 'moment'; // Import moment.js for date formatting
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const { token } = useContext(StoreContext);

  // Fetch all orders (whether paid or unpaid)
  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`, {
        headers: { Authorization: `Bearer ${token}` }, // Add the Authorization header
      });

      if (response.data.success) {
        setOrders(response.data.data); // Set the orders if the response is successful
      } else {
        toast.error('Error fetching orders'); // Show error if response is not successful
      }
    } catch (error) {
      toast.error('Failed to fetch orders'); // Show general error
      console.error(error); // Log the error for debugging
    }
  };

  // Group orders by date
  const groupOrdersByDate = (orders) => {
    return orders.reduce((groups, order) => {
      const date = moment(order.date).format('YYYY-MM-DD'); // Format the order date
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
      return groups;
    }, {});
  };

  // Update the status of an order
  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + '/api/order/status', {
        orderId,
        status: event.target.value,
      }, {
        headers: { Authorization: `Bearer ${token}` }, // Add the Authorization header
      });
      if (response.data.success) {
        await fetchAllOrders(); // Refresh orders after status update
        toast.success("Order status updated successfully")
      }
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllOrders(); // Fetch orders when component mounts
  }, []);

  // Group orders by date
  const groupedOrders = groupOrdersByDate(orders);

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className='order-list'>
        {Object.keys(groupedOrders).map((date) => (
          <div key={date} className='order-date-group'>
            {/* Display the date as a header */}
            <h4 className='order-date'>{moment(date).format('MMMM Do, YYYY')}</h4>

            {/* Display the orders for that date */}
            {groupedOrders[date].map((order, index) => (
              <div key={index} className='order-item'>
                <img src={assets.parcel_icon} alt="" />
                <div>
                  <p className='order-item-food'>
                    {order.items.map((item, idx) => {
                      return `${item.name} x ${item.quantity}${idx === order.items.length - 1 ? '' : ', '}`;
                    })}
                  </p>
                  <p className='order-item-name'>
                    {order.address.firstName + ' ' + order.address.lastName}
                  </p>
                  <div className='order-item-address'>
                    <p>{order.address.street}</p>
                    <p>
                      {order.address.city + ' ' + order.address.state + ' ' + order.address.country + ' ' + order.address.zipcode}
                    </p>
                  </div>
                  <div className='order-item-phone'>
                    <p>{order.address.phone}</p>
                    <a href={`tel:${order.address.phone}`} className="call-button">
                      📞 Call Now
                    </a>
                  </div>
                </div>

                <p>Items: {order.items.length}</p>
                <p style={{ color: order.payment ? 'green' : 'red' }}>
                  ₹{order.amount}
                  {order.payment ? ' Paid ✅' : ' Unpaid ❌'}
                </p>


                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                >
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            ))}
            {/* Add a separator after each date group */}
            <hr className="order-date-separator" />
          </div>
        ))}
      </div>
      <Toaster />
    </div>
  );
};

export default Orders;
