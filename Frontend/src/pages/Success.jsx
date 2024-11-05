import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/success.css'; // Import the CSS file for styling

const Success = () => {
  const navigate = useNavigate();

  // Function to navigate to My Orders
  const handleGoToOrders = () => {
    navigate('/my-orders');
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <img 
          src="https://img.icons8.com/clouds/500/000000/checked.png" 
          alt="Payment Successful Sticker" 
          className="success-sticker"
        />
        <h1 className="success-message">Payment Successful!</h1>
        <p className="success-description">
          Thank you for ordering from <strong>Shree's Restaurant</strong>. We are preparing your order!
        </p>
        <button className="success-button" onClick={handleGoToOrders}>
          Go to My Orders
        </button>
      </div>
    </div>
  );
};

export default Success;
