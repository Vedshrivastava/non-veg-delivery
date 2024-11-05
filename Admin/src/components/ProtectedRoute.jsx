import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore'; 
import { StoreContext } from '../context/StoreContext';
import { Toaster, toast } from 'react-hot-toast'; // Adjusted import

const ProtectedRoute = ({ children, setShowLogin }) => {
    const { user } = useAuthStore(); 
    const { isLoggedIn } = useContext(StoreContext);
    const navigate = useNavigate();
    const userRole = user?.role; 

    useEffect(() => {
        console.log("ProtectedRoute: Checking authentication status...");
        console.log("Is Logged In:", isLoggedIn);
        console.log("User Role:", userRole);

        if (!isLoggedIn) {
            console.log("ProtectedRoute: User is not logged in. Showing login modal and navigating to home.");
            setShowLogin(true); 
            toast.error("Please login first"); 
            navigate('/');
            return;
        } else if (userRole === 'MANAGER') {
            console.log("ProtectedRoute: User is a MANAGER. Not authorized. Navigating to orders.");
            toast.error("Not authorized");
            navigate('/orders');
            return;
        } else {
            console.log("ProtectedRoute: User is not authorized. Showing login modal and navigating to home.");
            toast.error("Not Authorized")
                navigate('/');
            return;
        }
    }, [isLoggedIn, userRole, navigate, setShowLogin]); 

    if (!isLoggedIn || userRole !== 'ADMIN') {
        console.log("ProtectedRouteForManager: User is not authorized. Rendering nothing.");
        return null; 
    }

    return (
        <>
            <Toaster /> {/* Using Toaster from react-hot-toast */}
            {children}
        </>
    );
};

const ProtectedRouteForManager = ({ children, setShowLogin }) => {
    const { user } = useAuthStore(); 
    const { isLoggedIn } = useContext(StoreContext); 
    const navigate = useNavigate();
    const userRole = user?.role; 

    useEffect(() => {
        console.log("ProtectedRouteForManager: Checking authentication status...");
        console.log("Is Logged In:", isLoggedIn);
        console.log("User Role:", userRole);

        if (!isLoggedIn) {
            console.log("ProtectedRouteForManager: User is not authorized. Showing login modal and navigating to home.");
            toast.error("Please login first"); 
                setShowLogin(true)
                navigate('/');
                return;
        } 
        else if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
            console.log("ProtectedRouteForManager: User is not authorized. Showing login modal and navigating to home.");
            toast.error("Not authorized"); 
                setShowLogin(true);
                navigate('/');
        } 
        else {
            console.log("ProtectedRouteForManager: User is authorized.");
        }
    }, [isLoggedIn, userRole, navigate, setShowLogin]); 

    if (!isLoggedIn || (userRole !== 'MANAGER' && userRole !== 'ADMIN')) {
        console.log("ProtectedRouteForManager: User is not authorized. Rendering nothing.");
        return null; 
    }

    console.log("ProtectedRouteForManager: User is authorized. Rendering children.");
    return (
        <>
            <Toaster /> {/* Using Toaster from react-hot-toast */}
            {children}
        </>
    );
};

export { ProtectedRoute, ProtectedRouteForManager };
