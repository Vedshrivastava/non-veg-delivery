import React, { useContext, useEffect, useState } from "react";
import "../styles/PlaceOrder.css";
import { StoreContext } from "../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, setCartItems, food_list, cartItems, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "Nagod",
    state: "Madhya Pradesh",
    zipcode: "485446",
    country: "India",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log(`Field changed: ${name} = ${value}`); // Log field change
    setData((data) => ({ ...data, [name]: value }));
  };

  const placeOrderPhonepe = async (event) => {
    event.preventDefault();
    console.log("Placing order with PhonePe...");

    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        ...item,
        quantity: cartItems[item._id],
      }));
    console.log("PhonePe order items:", orderItems);

    let orderDataPhonepe = {
      userId: localStorage.getItem("userId"),
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() ? getTotalCartAmount() + 20 : 0,
      MID: 'MID' + Date.now(),
      transactionId: 'T' + Date.now(),
      customer: {
        name: `${data.firstName} ${data.lastName}`,
        address: {
          line1: data.street,
          city: data.city,
          postal_code: 452003,
          state: data.state,
          country: 'IN',
        },
      },
    };

    console.log("PhonePe order data:", orderDataPhonepe);

    try {
      let responsePhonepe = await axios.post(url + "/api/order/order", orderDataPhonepe, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("PhonePe order response:", responsePhonepe.data);

      if (responsePhonepe.data.success) {
        window.location.href = responsePhonepe.data.data.instrumentResponse.redirectInfo.url;
      } else {
        alert("Error placing order.");
        console.log("PhonePe error message:", responsePhonepe.data.message);
      }
    } catch (error) {
      console.error("Error placing PhonePe order:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const placeOrderCod = async (event) => {
    event.preventDefault();
    console.log("Placing order with Cash on Delivery (COD)...");
  
    const { firstName, lastName, email, street, city, state, zipcode, phone } = data;
    if (!firstName || !lastName || !email || !street || !city || !state || !zipcode || !phone) {
      alert("Please fill out all required fields.");
      return;
    }
  
    console.log("Current form data:", data);
  
    const orderItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        ...item,
        quantity: cartItems[item._id],
      }));
  
    console.log("COD order items:", orderItems);
  
    let orderDataCod = {
      userId: localStorage.getItem("userId"),
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() ? getTotalCartAmount() + 20 : 0,
      customer: {
        name: `${data.firstName} ${data.lastName}`,
        address: {
          line1: data.street,
          city: data.city,
          postal_code: data.zipcode,
          state: data.state,
          country: data.country,
        },
      },
    };
  
    console.log("COD order data:", orderDataCod);
  
    try {
      let responseCod = await axios.post(url + "/api/order/cod", orderDataCod, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("COD order response:", responseCod.data);
  
      if (responseCod.data.success) {
        // Clear cart in the frontend
        console.log("COD order placed successfully, clearing cart...");
  
        // Assuming you have a function or context state to clear the cart
        setCartItems([]); // Update your cart state to be empty
        localStorage.removeItem("cartItems"); // Clear localStorage if cart is stored there
  
        navigate("/success"); // Navigate to success page
      } else {
        console.error("Error placing COD order:", responseCod.data.message);
        alert("Error placing COD order: " + responseCod.data.message);
      }
    } catch (error) {
      console.error("Error occurred while placing COD order:", error);
      alert("An error occurred while placing the order. Please try again.");
    }
  };
  
  

  useEffect(() => {
    console.log("Checking user token and cart amount...");
    if (!token) {
      navigate("/");
    } else if (getTotalCartAmount() === 0) {
      navigate("/");
      toast.error("Cart Is Empty");
    }
  }, [token]);

  return (
    <form onSubmit={placeOrderPhonepe} className="place-order">
      <div className="place-order-left">
        <h2>Delivery Information</h2>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="E-mail"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="City"
            readOnly
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="State"
            readOnly
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder="Phone"
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
        </div>
        <div className="cart-total-details">
          <p>Subtotal</p>
          <p>₹{getTotalCartAmount()}</p>
        </div>
        <hr />
        <div className="cart-total-details">
          <p>Delivery Fee</p>
          <p>₹{getTotalCartAmount() ? 20 : 0}</p>
        </div>
        <hr />
        <div className="cart-total-details">
          <b>Total</b>
          <b>₹{getTotalCartAmount() ? getTotalCartAmount() + 20 : 0}</b>
        </div>
        <div className="button-container">
          <button type="submit">PAY ONLINE</button>
        </div>
        <div className="button-container">
        <button type="button" onClick={placeOrderCod}>CASH ON DELIVERY</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
