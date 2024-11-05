import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { StoreContext } from '../context/StoreContext';
import '../styles/list.css';
import '../index.css';

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const { token } = useContext(StoreContext);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      setList(response.data.data);
    } else {
      toast.error(response.error);
    }
  }

  const removeFood = async (foodId) => {
    try {
      const response = await axios.delete(`${url}/api/food/remove`, {
        data: { _id: foodId },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        await fetchList();
        toast.success("Food successfully removed");
      } else {
        toast.error(response.data.message || "Failed to remove food");
      }
    } catch (error) {
      toast.error("You are not Authorized.");
      console.log(error);
    }
  }

  const stockHandler = async (event, _id) => {
    try {
      // Parse the selected value as a boolean
      const stockValue = event.target.value === "true"; // true if selected value is "true"

      const response = await axios.post(url + '/api/food/stock', {
        _id,
        stock: stockValue, // Send boolean value
      }, {
        headers: { Authorization: `Bearer ${token}` }, // Add the Authorization header
      });

      if (response.data.success) {
        await fetchList(); // Refresh the list after status update
        toast.success("Order status updated successfully");
      } else {
        toast.error("Failed to update order status"); // Optional error handling
      }
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='list add flex-col'>
      <p>All food list</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => {
          return (
            <div key={item._id} className="list-table-format">
              <img src={item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{item.price}</p>
              <p onClick={() => { removeFood(item._id) }} className='cursor'>X</p>
              <select
                onChange={(event) => stockHandler(event, item._id)}
                value={item.inStock} 
              >
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
          )
        })}
      </div>
      <Toaster />
    </div>
  )
}

export default List;
