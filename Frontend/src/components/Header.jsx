import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../assets/frontend_assets/assets';

const Header = () => {
  const [menu, setMenu] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 435);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToElement = (targetId) => {
    const element = document.getElementById(targetId);
    console.log(`Scrolling to element with ID: ${targetId}`);
    if (element) {
      console.log(`Element found:`, element);
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth',
      });
    } else {
      console.log('Element not found.');
    }
  };

  const handleScrollAndNavigate = (section, targetId) => {
    setMenu(section);
    navigate('/#' + targetId); 
  };

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      scrollToElement(targetId);
    }
  }, [location]);

  return (
    <div className='header'>
      <img src={assets.header_img} alt="" />
      <div className="header-contents">
        <h2>Order your favourite food here</h2>
        <p>
          Explore our diverse food menu, crafted to tantalize your taste buds with an array of flavors. 
          From mouth-watering appetizers to hearty main courses and delectable desserts, each dish is prepared 
          with the finest ingredients and utmost care. Whether you're craving classic comfort food or innovative 
          culinary creations, our menu offers something delightful for every palate.
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleScrollAndNavigate("menu", "explore-menu");
          }}
          className={menu === "menu" ? "active" : ""}
        >
          View Menu
        </button>
      </div>
    </div>
  );
};

export default Header;
