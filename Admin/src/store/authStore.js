import { create } from "zustand";
import axios from "axios";
import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";
import { toast } from "react-hot-toast";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null,
    isLoading: false,
    isCheckingAuth: true,

    login: async (phone, password, email) => {
        set({ isLoading: true, error: null });
        console.log("Admin Login isLoading: true");
    
        try {
    
            const response = await axios.post(
                `http://localhost:4000/api/admin/login-admin`,  // Admin-specific endpoint
                {email, phone, password}
            );
    
            const { success, message, user } = response.data;
    
            if (success) {
                // Ensure the user has an admin role
                if (user.role !== "ADMIN" && user.role !== "MANAGER") {
                    const roleError = "You do not have permission to log in.";
                    set({ error: roleError, isLoading: false });
                    toast.error(roleError);
                    return;
                }
    
                // Set user data and authentication status
                set({ user, isAuthenticated: true, isLoading: false });
                localStorage.setItem("isVerified", user.isVerified);
                localStorage.setItem("userPhone", user.phone);
                toast.success(message); // Display success toast
            } else {
                set({ error: message, isLoading: false });
                toast.error(message); // Display error toast
            }
    
            console.log("Admin Login response :--->> ", response.data);
            console.log("Admin Login isLoading: false");
            return response; // Return response data
    
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error logging in";
            set({ error: errorMessage, isLoading: false });
            console.log("Admin Login isLoading: false");
            toast.error(errorMessage); // Display error toast
            throw error;
        }
    },
    
    

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`http://localhost:4000/api/admin/verify`, { code });
            const { user } = response.data;
            
            // Save user data in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
            
            set({ user, isAuthenticated: true, isLoading: false });
            console.log("Email verification response :--->> ", response.data);

            return response;  // Return response data
        } catch (error) {
            set({ error: error.response.data.message || "Error verifying email", isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const { token } = useContext(StoreContext);
            const response = await axios.get(`http://localhost:4000/api/admin/check-auth`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            const { user } = response.data;
    
            // Save user data in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
            
            set({ user, isAuthenticated: true, isCheckingAuth: false });
            console.log("CheckAuth response :--->> ", response.data);
    
            return response;  // Return response data
        } catch (error) {
    
            // Enhanced error handling
            const errorMessage = error.response?.data?.message || "An unexpected error occurred"; // Fallback message
    
            console.log("Error from auth :===>>>", error);
            set({ error: errorMessage, isCheckingAuth: false, isAuthenticated: false });
            return error;
        }
    },

    forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`http://localhost:4000/api/admin/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
            return response;
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},

	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`http://localhost:4000/api/admin/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
            return response
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},
}));
