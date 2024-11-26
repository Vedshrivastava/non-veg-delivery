import React, { useState, useEffect, useContext } from 'react';
import '../styles/menu.css';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import { useLocation, useNavigate } from 'react-router-dom';
import FoodItem from '../components/FoodItem';

const Menu = () => {
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("All");
    const [deliveryType, setDeliveryType] = useState("Delivery"); // State for delivery type
    const [error, setError] = useState(null);
    const { url, food_list, getTotalCartAmount, handleDecrement, handleIncrement, removeFromCart, cartItems } = useContext(StoreContext);
    const location = useLocation();
    const navigate = useNavigate();

    const totalAmount = getTotalCartAmount() || 0;
    const deliveryFee = totalAmount ? 20 : 0;

    // Update deliveryType state in localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('deliveryType', deliveryType);
    }, [deliveryType]);


    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${url}/api/category/get-categories`);
                if (response.data.success) {
                    setCategories(response.data.categories);
                } else {
                    setError(response.data.message || 'Failed to fetch categories.');
                }
            } catch (error) {
                setError('Error fetching categories: ' + error.message);
            }
        };
        fetchCategories();
    }, [url]);

    // Parse query parameters to get the selected category from the URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const selectedCategory = queryParams.get('category');
        if (selectedCategory) {
            setCategory(selectedCategory);
        }
    }, [location.search]);

    // Scroll to the category section once `category` state is updated
    useEffect(() => {
        const scrollToCategory = () => {
            if (category) {
                const element = document.getElementById(category);
                if (element) {
                    const scrollOffset = window.innerWidth <= 480 ? 65 : 80;
                    window.scrollTo({
                        top: element.offsetTop - scrollOffset,
                        behavior: 'auto',
                    });
                }
            }
        };

        // Delay to ensure the DOM is fully updated
        const timeoutId = setTimeout(scrollToCategory, 150); // Delay for smooth transition
        return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
    }, [category]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Group food items by category
    const groupedFoodItems = categories.reduce((acc, category) => {
        acc[category.name] = food_list.filter(item => item.category === category.name);
        return acc;
    }, {});

    const handleCategoryClick = (categoryName) => {
        setCategory(categoryName);

        // Adding a slight delay for smooth scrolling
        setTimeout(() => {
            const element = document.getElementById(categoryName);
            if (element) {
                const targetPosition = element.offsetTop;
                const scrollOffset = window.innerWidth <= 480 ? 65 : 80;

                window.scrollTo({
                    top: targetPosition - scrollOffset,
                    behavior: 'smooth',
                });
            }
        }, 50); // Delay of 100ms for smooth transition
    };



    return (
        <div id='menu' className='menu'>
            <div className="menu-categories">
                {categories.map((item) => (
                    <div
                        key={item._id}
                        onClick={() => handleCategoryClick(item.name)}
                        className={`menu-category-item ${category === item.name ? "active" : ""}`}
                    >
                        <img src={item.image} alt={item.name} />
                        <p>{item.name}</p>
                    </div>
                ))}
            </div>
            <div className="menu-food-items">
                {Object.keys(groupedFoodItems).map((cat) => (
                    <div key={cat} className="category-section" id={cat}>
                        <h2>{cat}</h2>
                        <div className="food-items">
                            {groupedFoodItems[cat].map((item) => (
                                <FoodItem
                                    key={item._id}
                                    id={item._id}
                                    name={item.name}
                                    description={item.description}
                                    price={item.price}
                                    image={item.image}
                                    inStock={item.inStock}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-right">
                <div className="cart-right-total">
                    <h2>Cart</h2>
                </div>
                <div className="delivery-options">
                    <select
                        className="delivery-select"
                        value={deliveryType}
                        onChange={(e) => setDeliveryType(e.target.value)}
                    >
                        <option value="Delivery">Delivery</option>
                        <option value="In Car">In Car</option>
                        <option value="Take Away">Take Away</option>
                    </select>
                </div>

                <div>
                    {
                        food_list.map((item) => {
                            const quantity = cartItems[item._id] || 0;
                            if (quantity > 0) {
                                return (
                                    <div key={item._id} className="cart-items-title cart-items-item">
                                        <p>{item.name}</p>
                                        <p>x {quantity}</p>
                                        <p className='total'>₹{item.price * quantity}</p>
                                        <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                                    </div>
                                );
                            }
                            return null;
                        })
                    }
                </div>
                <div className="cart-right-total-details">
                    <p>Subtotal</p>
                    <p>₹{totalAmount}</p>
                </div>
                <hr />
                <div className="cart-right-total-details">
                    <p>Delivery Fee</p>
                    <p>₹{deliveryFee}</p>
                </div>
                <hr />
                <div className="cart-right-total-details">
                    <b>Total</b>
                    <b>₹{totalAmount + deliveryFee}</b>
                </div>
                <div className="button-container">
                    <button onClick={() => navigate('/order')}>Select Delivery Address</button>
                </div>
            </div>
        </div>
    );
};

export default Menu;
