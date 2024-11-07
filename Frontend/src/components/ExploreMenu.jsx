import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ExploreMenu.css';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';

const ExploreMenu = ({ setCategory }) => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

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

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleCategoryClick = (categoryName) => {
        setCategory(categoryName); // Set the category in parent state
        navigate(`/menu?category=${categoryName}`); // Navigate to Menu page with the category
    };

    return (
        <div id='explore-menu' className='explore-menu'>
            <h1>Explore Our Menu</h1>
            <p>
                Explore our diverse menu to find the perfect dish for your taste.
            </p>
            <hr />
            <div className="explore-menu-list">
                {categories.map((item) => (
                    <div
                        key={item._id}
                        onClick={() => handleCategoryClick(item.name)}
                        className='explore-menu-list-items'
                    >
                        <img src={item.image} alt={item.name} />
                        <p>{item.name}</p>
                    </div>
                ))}
            </div>
            <hr />
        </div>
    );
};

export default ExploreMenu;
