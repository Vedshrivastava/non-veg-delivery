import React, { useState } from 'react'
import '../styles/Home.css'
import Header from '../components/Header'
import ExploreMenu from '../components/ExploreMenu'
import FoodDisplay from '../components/FoodDisplay'

const Home = () => {

  const [category, setCategory] = useState("All")
  console.log("Type of setShowSearch:", typeof setShowSearch); // Should log "function"

  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
    </div>
  )
}

export default Home