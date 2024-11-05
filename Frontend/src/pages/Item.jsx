import React, { useState, useEffect, useContext } from 'react';
import '../styles/Item.css';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const Item = () => {
    const { token, url, userId, userName } = useContext(StoreContext);
    const location = useLocation();
    const { id, name, price, description, image } = location.state || {};
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ comment: '', rating: 1 });
    const [editReview, setEditReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false); // New state for showing the review form

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${url}/api/food/reviews/${id}`);
                setReviews(response.data.reviews);
            } catch (error) {
                console.error("Error fetching reviews", error);
            }
        };

        if (id) {
            fetchReviews();
        }
    }, [id, url]);

    const handleAddReview = async (event) => {
        event.preventDefault();
    
        if (!token) {
            toast.error("Please Login First");
            return;
        }
    
        try {
            const response = await axios.post(
                `${url}/api/review/add`,
                {
                    username: userName,
                    userid: userId,
                    foodId: id,
                    comment: newReview.comment,
                    rating: newReview.rating,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            // If successful, update the review list
            setReviews([...reviews, response.data.review]);
            setNewReview({ comment: '', rating: 1 });
            setShowReviewForm(false); // Hide the review form after submission
    
        } catch (error) {
            console.error("Error adding review", error);
            if (error.response && error.response.status === 401) {
                toast.error("Please Login First");
            } else {
                toast.error("Failed to add review, please try again.");
            }
        }
    };

    const handleEditReview = async (event) => {
        event.preventDefault();
        if (!editReview) return;

        try {
            const response = await axios.put(
                `${url}/api/review/update/${editReview._id}`,
                editReview,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews(reviews.map(review => review._id === editReview._id ? response.data.review : review));
            setEditReview(null);
        } catch (error) {
            console.error("Error editing review", error);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await axios.delete(`${url}/api/review/delete/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(reviews.filter(review => review._id !== reviewId));
        } catch (error) {
            console.error("Error deleting review", error);
        }
    };

    const handleStarClick = (rating) => {
        if (editReview) {
            setEditReview({ ...editReview, rating });
        } else {
            setNewReview({ ...newReview, rating });
        }
    };

    const renderStars = (rating, editable = true) => {
        return (
            <div className='star-rating'>
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''} ${editable ? 'clickable' : ''}`}
                        onClick={() => editable && handleStarClick(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (!id) {
        return <p>Item not found.</p>;
    }

    return (
        <div className='item-container'>
            <div className='item-image-container'>
                <img className='item-image' src={image} alt={name} />
            </div>
            <div className='item-info'>
                <h1>{name}</h1>
                <p>{description}</p>
                <p className='price'>₹{price}</p>
            </div>
            <div className='reviews-section'>
                {/* Add Review Button */}
                <button className='add-review-button' onClick={() => setShowReviewForm(!showReviewForm)}>
                    {showReviewForm ? 'Cancel' : 'Add a Review'}
                </button>

                {/* Add Review Form */}
                {showReviewForm && !editReview && (
                    <form onSubmit={handleAddReview} className='review-form'>
                        <h2>Add a Review</h2>
                        <label>
                            Rating:
                            <div className='star-rating'>
                                {renderStars(newReview.rating)}
                            </div>
                        </label>
                        <label>
                            Comment:
                            <textarea
                                value={newReview.comment}
                                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                            />
                        </label>
                        <button type='submit'>Submit Review</button>
                    </form>
                )}

                {/* Edit Review Form */}
                {editReview && (
                    <form onSubmit={handleEditReview} className='review-form'>
                        <h2>Edit Review</h2>
                        <label>
                            Rating:
                            <div className='star-rating'>
                                {renderStars(editReview.rating)}
                            </div>
                        </label>
                        <label>
                            Comment:
                            <textarea
                                value={editReview.comment}
                                onChange={e => setEditReview({ ...editReview, comment: e.target.value })}
                            />
                        </label>
                        <button type='submit'>Update Review</button>
                        <button type='button' onClick={() => setEditReview(null)}>Cancel</button>
                    </form>
                )}

                {/* Reviews List */}
                <h2>Reviews</h2>
                {reviews.length > 0 ? (
                    <div className='reviews-list'>
                        {reviews.map(review => (
                            <div key={review._id} className='review-item'>
                                <div className='review-content'>
                                    <div><strong>Rating:</strong> {renderStars(review.rating, false)}</div>
                                    <p><strong>Comment:</strong> {review.comment}</p>
                                    <p><strong>by: </strong> {review.by}</p>
                                </div>
                                {review.author === userId && (
                                    <div className='review-actions'>
                                        <button className='edit-button' onClick={() => setEditReview(review)}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button className='delete-button' onClick={() => handleDeleteReview(review._id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>
        </div>
    );
};

export default Item;
