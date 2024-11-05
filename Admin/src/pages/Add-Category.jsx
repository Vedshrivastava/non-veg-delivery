import React, { useState } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import '../index.css';
import '../styles/add-category.css';
import { assets } from '../assets/admin_assets/assets.js';
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

const AddCategory = ({ url, onCategoryAdded }) => {
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);
    const {token} = useContext(StoreContext);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('name', category);  // Use 'name' to match the schema
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await axios.post(`${url}/api/category/add-category`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });

            // Check if response is as expected
            if (response && response.data && response.data.success) {
                setCategory('');
                setImage(null);
                if (onCategoryAdded) onCategoryAdded(); // Notify parent component to refresh category list
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message || 'Unexpected error occurred.');
            }
        } catch (error) {
            console.error('Error adding category:', error); // Log error details for debugging
            toast.error('An error occurred while adding the category. Please try again.');
        }
    };

    return (
        <div className='add-category-panel'>
            <form onSubmit={onSubmitHandler}>
            <div className="category-name">
            <p>Category Name</p>
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="New Category Name"
                    required
                />
            </div>
                <div className="add-category-image">
                <p>Upload Category Image</p>
                    <label htmlFor="category-image">
                        <img
                            src={image ? URL.createObjectURL(image) : assets.upload_area}
                            alt="Category"
                        />
                    </label>
                    <input
                        type="file"
                        id="category-image"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        hidden
                    />
                </div>
                <button type="submit">Add Category</button>
            </form>
            <Toaster/>
        </div>
    );
};

export default AddCategory;
