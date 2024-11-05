import React, { useState, useEffect, useContext } from 'react';
import '../styles/ExploreMenu.css';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';

const ExploreMenu = ({ category, setCategory }) => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const { url } = useContext(StoreContext);

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

    return (
        <div id='explore-menu' className='explore-menu'>
            <h1>Explore Our Menu</h1>
            <p>
                Explore our diverse menu to find the perfect dish for your taste. Whether you are in the mood for something adventurous or prefer a classic favorite, our descriptions will guide you to a choice that satisfies your cravings and dietary preferences.
            </p>
            <div className="explore-menu-list">
                {categories.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => setCategory(prev => prev === item.name ? "All" : item.name)}
                        className='explore-menu-list-items'
                    >
                        <img className={category === item.name ? "active" : ""} src={item.image} alt={item.name} />
                        <p>{item.name}</p>
                    </div>
                ))}
            </div>
            <hr />
        </div>
    );
};

export default ExploreMenu;
