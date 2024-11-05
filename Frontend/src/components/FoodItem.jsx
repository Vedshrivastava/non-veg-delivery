import React, { useContext, useEffect, useState } from 'react';
import '../styles/FoodItem.css';
import { assets } from '../assets/frontend_assets/assets';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const truncateDescription = (description, maxWords) => {
    const words = description.split(' ');
    if (words.length <= maxWords) return description;
    return words.slice(0, maxWords).join(' ') + '...';
};

const FoodItem = ({ id, name, price, description, image, inStock }) => {
    const [averageRating, setAverageRating] = useState(0);
    const { cartItems = {}, addToCart, handleDecrement, handleIncrement } = useContext(StoreContext);
    const navigate = useNavigate();
    const { url } = useContext(StoreContext); 

    const handleClick = () => {
        navigate(`/item/${id}`, {
            state: {
                id,
                name,
                price,
                description,
                image,
            },
        });
    };

    const itemQuantity = cartItems[id] || 0;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${url}/api/food/reviews/${id}`);
                const reviews = response.data.reviews;

                if (reviews.length > 0) {
                    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
                    const average = (totalRating / reviews.length).toFixed(1);
                    setAverageRating(average);
                } else {
                    setAverageRating(0);
                }
            } catch (error) {
                console.error("Error fetching reviews", error);
            }
        };

        if (id) {
            fetchReviews();
        }
    }, [id, url]);

    const renderStars = (rating) => {
        return (
            <div className='star-rating'>
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className='food-item'>
            <div className="food-item-img-container">
                <img onClick={handleClick} className='food-item-image' src={image} alt={name} />
                {
                    !inStock ? (
                        <div className="out-of-stock-message">Out of Stock</div>
                    ) : itemQuantity === 0 ? (
                        <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} />
                    ) : (
                        <div className='food-item-counter'>
                            <img onClick={() => handleDecrement(id)} src={assets.remove_icon_red} />
                            <p>{itemQuantity}</p>
                            <img onClick={() => handleIncrement(id)} src={assets.add_icon_green} />
                        </div>
                    )
                }
            </div>
            <div onClick={handleClick} className='food-item-info'>
                <div className='food-item-name-rating'>
                    <p>{name}</p>
                    {renderStars(averageRating)}
                </div>
                <p className='food-item-desc'>{truncateDescription(description, 12)}</p>
                <p className='food-item-price'>₹{price}</p>
            </div>
        </div>
    );
}

export default FoodItem;
