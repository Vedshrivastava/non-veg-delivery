import { create } from "zustand";
import axios from "axios";
import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null,
    isLoading: false,
    isCheckingAuth: true,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`http://localhost:4000/api/admin/login-admin`, { email, password });
            const { user } = response.data;

            // Save user data in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');

            set({ user, isAuthenticated: true, isLoading: false });
            console.log("Login response :--->> ", response.data);

            return response;  // Return response data
        } catch (error) {
            set({ error: error.response.data.message || "Error logging in", isLoading: false });
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
