import React, { useState, useEffect } from 'react';
import '../styles/add.css';
import { assets } from '../assets/admin_assets/assets';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import '../index.css';
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

const Add = ({ url }) => {
    const [image, setImage] = useState(null); // Use null instead of false for images
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "" // This will now store the category name
    });
    const [categories, setCategories] = useState([]);
    const {token} = useContext(StoreContext)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${url}/api/category/get-categories`);
                if (response.data.success) {
                    setCategories(response.data.categories);
                    if (response.data.categories.length > 0) {
                        setData(prevData => ({ ...prevData, category: response.data.categories[0].name }));
                    }
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error('Failed to fetch categories.');
            }
        };

        fetchCategories();
    }, [url]);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const selectedCategory = categories.find(cat => cat.name === data.category);
        const category = selectedCategory ? selectedCategory.name : "";

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("price", data.price);
        formData.append("description", data.description);
        formData.append("category", category); 
        if (image) formData.append("image", image);

        try {
            const response = await axios.post(`${url}/api/food/add`, formData, {
                headers: { Authorization: `Bearer ${token}` }, // Add the Authorization header
              });
            if (response.data.success) {
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: categories.length > 0 ? categories[0].name : "" 
                });
                setImage(null);
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred while adding the food item.');
        }
    };

    return (
        <div className='add'>
            <form className="flex-col" onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' hidden />
                </div>
                <div className="add-product-name flex-col">
                    <p>Product name</p>
                    <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' />
                </div>
                <div className="add-product-description flex-col">
                    <p>Product Description</p>
                    <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write about the item here.'></textarea>
                </div>
                <div className="add-category-price">
                    <div className="add-category flex-col">
                        <p>Product Category</p>
                        <select onChange={onChangeHandler} name="category" value={data.category}>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="add-price flex-col">
                        <p>Product Price</p>
                        <input onChange={onChangeHandler} value={data.price} type="number" name='price' />
                    </div>
                </div>
                <button type='submit' className='add-btn'>Add</button>
            </form>
            <Toaster/>
        </div>
    );
};

export default Add;
