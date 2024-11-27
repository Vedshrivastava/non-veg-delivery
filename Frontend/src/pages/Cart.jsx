import React, { useContext, useState, useEffect } from 'react';
import '../styles/Cart.css';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const {
    cartItems = {},
    food_list = [],
    removeFromCart,
    getTotalCartAmount,
    handleDecrement,
    handleIncrement,
    userId,
    orderType,
    setOrderType,
    updateOrderType,
    fetchOrderAndSetType
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const totalAmount = getTotalCartAmount() || 0;
  const deliveryFee = totalAmount ? 20 : 0;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Sync orderType from localStorage on mount
  useEffect(() => {
    const fetchInitialOrderType = async () => {
      const savedOrderType = localStorage.getItem('orderType') || 'Delivery';
      console.log("localstorage returned value======>>>>>", savedOrderType)
      setOrderType(savedOrderType); // First prioritize localStorage
  
      try {
        const backendOrderType = await fetchOrderAndSetType(userId);
        console.log("backend returned value=====>>>>>>", backendOrderType);
        setOrderType(backendOrderType); // Overwrite only if backend returns a value
      } catch (err) {
        console.error("Failed to fetch and set order type:", err);
      }
    };
    fetchInitialOrderType();
  }, [fetchOrderAndSetType, userId]);
  

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle delivery type selection change
  const handleDeliveryTypeChange = (event) => {
    const selectedType = event.target.value;
    updateOrderType(selectedType); // Update orderType in context
  };

  console.log("Rendered orderType value:", orderType); // Log before rendering

  return (
    <div className="cart-main">
      <div className="cart">
        <h2>My Cart</h2>
        <div className="cart-items">
          <br />
          <hr />
          {food_list.map((item) => {
            const quantity = cartItems[item._id] || 0;
            if (quantity > 0) {
              return (
                <div key={item._id} className="cart-items-title cart-items-item">
                  <img src={item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <div className="quantity-controls">
                    <button onClick={() => handleDecrement(item._id)}>-</button>
                    <p>{quantity}</p>
                    <button onClick={() => handleIncrement(item._id)}>+</button>
                  </div>
                  <p className="total">₹{item.price * quantity}</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">x</p>
                  {windowWidth <= 700 && <><hr /><hr /><hr /></>}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
        </div>
        <div className="cart-total-details">
          <p>Subtotal</p>
          <p>₹{totalAmount}</p>
        </div>
        <hr />
        <div className="cart-total-details">
          <p>Delivery Fee</p>
          <p>₹{deliveryFee}</p>
        </div>
        <hr />
        <div className="cart-total-details">
          <b>Total</b>
          <b>₹{totalAmount + deliveryFee}</b>
        </div>
        <div className="delivery-options">
          <select
          key={orderType}
            className="delivery-select"
            value={orderType} // Controlled input
            onChange={handleDeliveryTypeChange}
          >
            <option value="Delivery">Delivery</option>
            <option value="In Car">In Car</option>
            <option value="Take Away">Take Away</option>
          </select>
        </div>
        <div className="button-container">
          <button onClick={() => navigate('/order')}>Select Delivery Address</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
