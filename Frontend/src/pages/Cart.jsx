import React, { useContext } from 'react';
import '../styles/Cart.css';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';

const Cart = () => {
  const { cartItems = {}, food_list = [], removeFromCart, getTotalCartAmount, url, handleDecrement, handleIncrement } = useContext(StoreContext);
  const navigate = useNavigate();

  const totalAmount = getTotalCartAmount() || 0;
  const deliveryFee = totalAmount ? 20 : 0;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='cart-main'>
      <div className='cart'>
      <h2>My Cart</h2>
        <div className="cart-items">
          <br />
          <hr />
          {
            food_list.map((item) => {
              const quantity = cartItems[item._id] || 0; 
              if (quantity > 0) {
                return (
                  <div key={item._id} className="cart-items-title cart-items-item">
                    <img src={item.image} alt="" />
                    <p>{item.name}</p>
                    <p>₹{item.price}</p>
                    <div className="quantity-controls">
                      <button onClick={() => handleDecrement(item._id)}>-</button>
                      <p>{quantity}</p>
                      <button onClick={() => handleIncrement(item._id)}>+</button>
                    </div>
                    <p className='total'>₹{item.price * quantity}</p>
                    <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                    {windowWidth <= 700 ? (
                <>
                  <hr />
                  <hr />
                  <hr />
                </>
              ) : (
                <></>
              )}
                  </div>
                );
              }
              return null; 
            })
          }
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
                    <select className="delivery-select">
                        <option value="delivery">Delivery</option>
                        <option value="in-car">In Car</option>
                        <option value="take-away">Take Away</option>
                    </select>
                </div>
        <div className="button-container">
          <button onClick={() => navigate('/order')}>Select Delivery Address</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
