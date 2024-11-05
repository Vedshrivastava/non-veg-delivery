import React, { useContext, useEffect } from 'react';
import '../styles/navbar.css';
import { assets } from '../assets/admin_assets/assets';
import { StoreContext } from '../context/StoreContext';
import {jwtDecode} from 'jwt-decode';

const Navbar = ({ setShowLogin }) => {
    const { token, setToken, setUserId, setUserEmail, setUserName } = useContext(StoreContext);

    // Check token validity on initial render
    useEffect(() => {
        const checkTokenValidity = () => {
            if (!isTokenValid(token)) {
                logout(); // Call logout if token is expired or invalid
            }
        };

        checkTokenValidity();
    }, [token]); // Runs every time the token changes

    const logout = () => {
        setToken(null);
        setUserId(null);
        setUserEmail(null);
        setUserName(null);
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
    };

    const isTokenValid = (token) => {
        if (!token) return false;

        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Current time in seconds
            return decodedToken.exp > currentTime;
        } catch (error) {
            console.error("Token decoding error:", error);
            return false;
        }
    };

    return (
        <div className='navbar'>
            <img className='logo' src={assets.logo} alt="Logo" />
            {!token || !isTokenValid(token) ? (
                <button onClick={() => setShowLogin(true)}>Sign In</button> // Show Sign In button if not authenticated
            ) : (
                <div className='navbar-profile'>
                    <img src={assets.profile_image} alt="Profile" />
                    <ul className="nav-profile-dropdown">
                        <li onClick={logout}>Logout</li> // Show Logout option if authenticated
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Navbar;
