import React, { useContext } from 'react';
import '../styles/FoodDisplay.css';
import { StoreContext } from '../context/StoreContext';
import FoodItem from './FoodItem';

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  console.log('Food List:', food_list);
  console.log('Selected Category:', category);

  return (
    <div className='food-display' id='food-display'>
      <h2>Top Dishes Near You</h2>
      <div className="food-display-list">
        {food_list.map((item) => {
          if (category === "All" || category === item.category) {
            return (
              <FoodItem 
                key={item._id} 
                id={item._id} 
                name={item.name} 
                description={item.description} 
                price={item.price} 
                image={item.image} 
                inStock={item.inStock}
              />
            );
          }
          return null; 
        })}
      </div>
    </div>
  );
}

export default FoodDisplay;
