import React, { useState, useContext, useEffect } from 'react';
import '../styles/Login.css';
import { assets } from '../assets/frontend_assets/assets';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { jwtDecode } from "jwt-decode";
import { toast, Toaster } from 'react-hot-toast';


const Login = ({ setShowLogin }) => {
    const { signup, isLoading, login, forgotPassword } = useAuthStore();
    const { setToken, setUserId, setUserName, setUserEmail, setCartItems, setIsLoggedIn, setCurrState, currState } = useContext(StoreContext);

    const [data, setData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        type: "",
    });
    const [forgotInput, setForgotInput] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [resetMessage, setResetMessage] = useState("");

    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const handleLogout = () => {
        setToken(null);
        setUserId(null);
        setUserName(null);
        setUserEmail(null);
        setIsLoggedIn(false);
        localStorage.clear();
        toast.info("Session expired. Please log in again.");
        setShowLogin(true);
    };

    const isTokenExpired = (token) => {
        const decodedToken = jwtDecode(token);
        return decodedToken.exp * 1000 < Date.now();
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && isTokenExpired(token)) {
            handleLogout();
        }
    }, []);

    const handleSignup = async (data, type) => {
        if (currState === "signUp") {
            try {
                const response = await signup(data.email, data.password, data.name, data.phone, type);

                // If signup failed, check the response and handle accordingly
                if (!response.data.success) {
                    // Optionally, handle any non-toast-based error logic here
                    return; // Exit the function if signup was unsuccessful
                }

                // If signup was successful, update the UI state
                setShowLogin(false);
                setCurrState('Login');
                navigate('/verify'); // Redirect to verify page
            } catch (error) {
                // Optionally handle errors if signup itself fails (e.g., network issues)
                toast.error(error.message || 'Error during signup.');
                console.error("Sign-up error: ", error); // Log the error for debugging
            }
        }
    };



    const onLogin = async (event) => {
        event.preventDefault();

        if (currState === "Forgot Password") {
            try {
                const response = await forgotPassword(forgotInput);
                if (response.data.success) {
                    setIsSubmitted(true);
                    setResetMessage("A password reset link has been sent.");
                } else {
                    toast.error(response.data.message || "Failed to send reset link");
                }
            } catch (error) {
                toast.error("Error sending password reset link");
            }
        } else {
            try {
                const response = await login(data.phone, data.password, data.email);
                if (response.data.success) {
                    const token = response.data.token;
                    setToken(token);
                    localStorage.setItem("token", token);
                    localStorage.setItem("userId", response.data.userId);
                    localStorage.setItem("userName", response.data.name);
                    localStorage.setItem("userEmail", response.data.email);
                    localStorage.setItem("cartItems", response.data.cartItems);

                    setCartItems(response.data.cartItems);
                    setUserId(response.data.userId);
                    setUserName(response.data.name);
                    setUserEmail(response.data.email);
                    setIsLoggedIn(true);

                    const decodedToken = jwtDecode(token);
                    const expirationTime = decodedToken.exp * 1000 - Date.now();

                    if (expirationTime > 0) {
                        setTimeout(() => {
                            handleLogout();
                        }, expirationTime);
                    } else {
                        handleLogout();
                    }
                    setShowLogin(false);
                    navigate('/');
                } else {
                    toast.error(response.data.message || "Login failed");
                }
            } catch (error) {
                toast.error('Something went wrong during login');
            }
        }
    };

    return (
        <div className='login'>
            <form onSubmit={onLogin} className='login-container'>
                <div className="login-title">
                    <h2>{currState === 'signUp' ? 'Sign Up with Email or phone' : currState}</h2>
                    <img onClick={() => { setShowLogin(false); setCurrState('Login') }} src={assets.cross_icon} alt="Close" />
                </div>
                <div className="login-inputs">
                    {currState === 'signUp' ? (
                        <>
                            <input
                                name='name'
                                onChange={onChangeHandler}
                                value={data.name}
                                type='text'
                                placeholder='Your name'
                                required
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
                            <input
                                name='email'
                                onChange={onChangeHandler}
                                value={data.email}
                                type='email'
                                placeholder='Your Email (optional)'
                            />
                        </>
                    ) : currState === 'Forgot Password' ? (
                        <input
                            name='forgotInput'
                            onChange={(e) => {
                                const value = e.target.value;

                                // Check if the input is purely numeric
                                if (/^\d*$/.test(value)) {
                                    // If input is numeric and has length > 0, prepend +91
                                    setForgotInput(value ? `+91${value}` : '');
                                } else {
                                    // If input is an email or other characters, set it as is
                                    setForgotInput(value);
                                }
                            }}
                            value={forgotInput}
                            type='text'
                            placeholder={`Enter your Phone no.`}
                            required
                        />
                    ) : (
                        <>
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
                            <input
                                name='email'
                                onChange={onChangeHandler}
                                value={data.email}
                                type='email'
                                placeholder='Your email (optional)'
                            />
                        </>
                    )}
                </div>
                {currState === 'signUp' ? (
                    <div className="signup-method-texts">
                        <span
                            onClick={() => !isLoading && handleSignup(data, 'phone')}
                            style={{ cursor: isLoading ? 'default' : 'pointer', color: isLoading ? 'gray' : 'blue', textDecoration: 'underline', marginLeft: '10px' }}
                        >
                            {isLoading ? "Processing..." : "Signup"}
                        </span>
                    </div>
                ) : (
                    <button type='submit' disabled={isLoading}>
                        {currState === 'Forgot Password' ? "Send Reset Link" : "Login"}
                    </button>
                )}


                {currState === 'Login' && (
                    <>
                        <p>Forgot your password? <span onClick={() => setCurrState("Forgot Password")}>Reset</span></p>
                        <p>Don't have an account?
                            <span onClick={() => setCurrState("signUp")}>Sign up</span>
                        </p>
                    </>
                )}
                {currState === 'Forgot Password' && isSubmitted && <p style={{ color: 'tomato' }}>{resetMessage}</p>}
            </form>
            <Toaster />
        </div>
    );
};

export default Login;
