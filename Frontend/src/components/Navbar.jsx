import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import '../styles/navbar.css';
import { assets } from '../assets/frontend_assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import {toast} from 'react-toastify'

const Navbar = ({ setShowLogin, setShowSearch }) => {
    const [menu, setMenu] = useState("home");
    const navigate = useNavigate();
    const { getTotalCartAmount, token, setToken, setUserId, setUserName, setUserEmail, setCartItems } = useContext(StoreContext);

    const logout = () => {
        setToken(null); 
        setUserId(null); 
        setUserEmail(null);
        setUserName(null);
        setCartItems({});
        localStorage.removeItem("cartItems")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userName")
        localStorage.removeItem("token"); 
        localStorage.removeItem("userId"); 
    };

    const scrollToElement = (targetId) => {
        const element = document.getElementById(targetId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop,
                behavior: 'smooth',
            });
        } else {
            console.log('Element not found:', targetId);
        }
    };

    const handleScrollAndNavigate = (section, targetId) => {
        setMenu(section);
        navigate('/');  

        setTimeout(() => {
            scrollToElement(targetId);
        }, 100); 
    };

    return (
        <div className='navbar'>
            <Link to='/'><FontAwesomeIcon icon={faUtensils} className='logo' /></Link>
            <ul className='navbar-menu'>
                <li>
                    <Link 
                        to='/' 
                        onClick={() => handleScrollAndNavigate("home")}
                        className={menu === "home" ? "active" : ""}
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <a 
                        href='#explore-menu' 
                        onClick={(e) => {
                            e.preventDefault();
                            handleScrollAndNavigate("menu", "explore-menu");
                        }} 
                        className={menu === "menu" ? "active" : ""}
                    >
                        Menu
                    </a>
                </li>
                <li>
                    <a 
                        href='#footer' 
                        onClick={(e) => {
                            e.preventDefault();
                            handleScrollAndNavigate("contact-us", "footer");
                        }} 
                        className={menu === "contact-us" ? "active" : ""}
                    >
                        Contact Us
                    </a>
                </li>
            </ul>
            <div className='navbar-right'>
                <img src={assets.search_icon} onClick={() => setShowSearch(true)} alt="Search" />
                <div className="navbar-search-icon">
                    <Link to='/cart'><img src={assets.basket_icon} alt="Basket" /></Link>
                    <div className={getTotalCartAmount()?"dot":""}></div>
                </div>
                {!token?<button onClick={() => setShowLogin(true)}>Sign In</button>
                :<div className='navbar-profile'>
                    <img src={assets.profile_icon} alt="" />
                    <ul className="nav-profile-dropdown">
                        <li onClick={() => navigate('/my-orders')} ><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                        <hr />
                        <li onClick={logout} ><img src={assets.logout_icon} alt="" />Logout</li>
                    </ul>
                </div>}
            </div>
        </div>
    );
};

export default Navbar;
