import React, { useState, useEffect, useContext } from 'react';
import '../styles/menu.css';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import { useLocation } from 'react-router-dom'; // Added to access the URL query
import FoodItem from '../components/FoodItem';

const Menu = () => {
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("All");
    const [error, setError] = useState(null);
    const { url, food_list } = useContext(StoreContext);  // Access food_list from context
    const location = useLocation(); // Get the current location (URL)

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
            handleCategoryClick(selectedCategory);  // Ensure the category is selected and active
        }
    }, [location.search]); // Re-run when location.search changes

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
                // Get the position of the target element
                const targetPosition = element.offsetTop;
                // Scroll to the position, 40px above the element
                window.scrollTo({
                    top: targetPosition - 80, // Stop 40px above the target
                    behavior: 'smooth',
                });
            }
        }, 100); // Delay of 100ms for smooth transition
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
                {/* Render all categories or the selected one */}
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
        </div>
    );
};

export default Menu;
