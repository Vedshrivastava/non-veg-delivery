import React, { useState, useContext } from 'react';
import '../styles/Login.css';
import { assets_frontend } from '../assets/frontend_assets/assets';
import { StoreContext } from '../context/StoreContext';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import {jwtDecode} from 'jwt-decode';

const Login = ({ setShowLogin }) => {
    const { isLoading, login, forgotPassword } = useAuthStore();
    const { setToken, setUserId, setUserName, setUserEmail, setIsLoggedIn } = useContext(StoreContext);

    const [currState, setCurrState] = useState("Login");
    const [data, setData] = useState({
        email: "",
        phone: "",
        password: ""
    });
    const [forgotEmail, setForgotEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [resetMessage, setResetMessage] = useState("");

    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const onForgotEmailChange = (event) => {
        setForgotEmail(event.target.value);
    };

    const onLogin = async (event) => {
        event.preventDefault();

        if (currState === "Forgot Password") {
            try {
                const response = await forgotPassword(forgotEmail);
                if (response.data.success) {
                    toast.success("Password reset link sent to your email.");
                    setIsSubmitted(true);
                    setResetMessage("A password reset link has been sent to your email.");
                } else {
                    toast.error(response.data.message || "Failed to send password reset link");
                }
            } catch (error) {
                toast.error("Error sending password reset link");
                console.error(error);
            }
        } else {
            try {
                
                const response = await login(data.phone, data.password, data.email);
                if (response.data.success) {
                    // Check if the user is an admin or manager
                    if (response.data.role !== "ADMIN" && response.data.role !== "MANAGER") {
                        toast.error("You do not have permission to log in.");
                        return; 
                    }

                    const token = response.data.token;
                    setToken(token);
                    localStorage.setItem("token", token);

                    const decodedToken = jwtDecode(token);
                    localStorage.setItem("userId", decodedToken.id);
                    localStorage.setItem("userName", decodedToken.name);
                    localStorage.setItem("userEmail", decodedToken.email);

                    setUserId(decodedToken.id);
                    setUserName(decodedToken.name);
                    setUserEmail(decodedToken.email);
                    setIsLoggedIn(true);

                    setTimeout(() => {
                        setShowLogin(false);
                        navigate('/');
                    }, 2000);

                    const expirationTime = decodedToken.exp * 1000;
                    const logoutTime = expirationTime - Date.now();

                    if (logoutTime > 0) {
                        setTimeout(() => {
                            handleLogout();
                        }, logoutTime);
                    }
                } else {
                    toast.error(response.data.message || "Login failed");
                }
            } catch (error) {
                console.error(error);
                toast.error('Something went wrong during login');
            }
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        setIsLoggedIn(false);
        toast.info("You have been logged out.");
    };

    return (
        <div className='login'>
            <form onSubmit={onLogin} className='login-container'>
                <div className="login-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets_frontend.cross_icon} alt="Close" />
                </div>
                <div className="login-inputs">
                    {currState === 'Forgot Password' ? (
                        <input
                            name='forgotEmail'
                            onChange={onForgotEmailChange}
                            value={forgotEmail}
                            type='email'
                            placeholder='Enter your Email for reset'
                            required
                        />
                    ) : (
                        <>
                            <input
                                name='email'
                                onChange={onChangeHandler}
                                value={data.email}
                                type='email'
                                placeholder='Your Email'
                            />
                            <input
                                name='phone'
                                onChange={(event) => {
                                    // Get the user input
                                    const value = event.target.value;

                                    // Check if the input starts with +91 or is empty
                                    if (value === "" || value.startsWith("+91")) {
                                        // Update the state without modifying the prefix
                                        setData((prevData) => ({
                                            ...prevData,
                                            phone: value
                                        }));
                                    } else {
                                        // Prepend +91 to the input value
                                        setData((prevData) => ({
                                            ...prevData,
                                            phone: `+91${value}`
                                        }));
                                    }
                                }}
                                value={data.phone}
                                type='text'
                                placeholder='Your Phone Number'
                                required
                            />
                            <input
                                name='password'
                                onChange={onChangeHandler}
                                value={data.password}
                                type='password'
                                placeholder='Enter your password'
                                required
                            />
                        </>
                    )}
                </div>
                <button type='submit' disabled={isLoading}>
                    {currState === 'Forgot Password' ? "Send Reset Link" : "Login"}
                </button>
                {currState === 'Login' && (
                    <p>Forgot your password? <span onClick={() => setCurrState("Forgot Password")}>Reset</span></p>
                )}
                {currState === 'Forgot Password' && (
                    <p>Remembered your password? <span onClick={() => setCurrState("Login")}>Login</span></p>
                )}
                {isSubmitted && resetMessage && (
                    <div className='submitted-message'>
                        <p>{resetMessage}</p>
                    </div>
                )}
            </form>
            <Toaster />
        </div>
    );
};

export default Login;
