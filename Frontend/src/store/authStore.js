import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null, // Do not store the user here
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  signup: async (email, password, name, phone, type) => {
    set({ isLoading: true, error: null });
    console.log("Signup isLoading: true");

    try {
      const payload = { name, password, email, phone, type };
      console.log("Payload being sent:", payload);

      const response = await axios.post(
        `http://localhost:4000/api/user/register`,
        payload
      );
      const { success, message, user } = response.data;

      if (success) {
        set({ user, isAuthenticated: true, isLoading: false });
        localStorage.setItem("isVerified", user.isVerified); // Store isVerified in localStorage
        toast.success(message); // Display success toast
      } else {
        set({ error: message, isLoading: false });
        toast.error(message); // Display error toast
      }

      console.log("Signup response :--->> ", response.data);
      console.log("Signup isLoading: false");
      return response; // Return response data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error signing up";
      set({ error: errorMessage, isLoading: false });
      console.log("Signup isLoading: false");
      toast.error(errorMessage); // Display error toast
      throw error;
    }
  },

  login: async (phone, password, email) => {
    set({ isLoading: true, error: null });
    console.log("Login isLoading: true");

    try {
      const response = await axios.post(
        `http://localhost:4000/api/user/login`,
        { phone, password, email }
      );
      const { success, message, user } = response.data;

      if (success) {
        set({ user, isAuthenticated: true, isLoading: false });
        localStorage.setItem("isVerified", user.isVerified); // Store isVerified in localStorage
        toast.success(message); // Display success toast
      } else {
        set({ error: message, isLoading: false });
        toast.error(message); // Display error toast
      }

      console.log("Login response :--->> ", response.data);
      console.log("Login isLoading: false");
      return response; // Return response data
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error logging in";
      set({ error: errorMessage, isLoading: false });
      console.log("Login isLoading: false");
      toast.error(errorMessage); // Display error toast
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    console.log("Verify Email isLoading: true");

    try {
      const response = await axios.post(
        `http://localhost:4000/api/user/verify`,
        { code }
      );
      const { success, message, user } = response.data;

      if (success) {
        set({ user, isAuthenticated: true, isLoading: false });
        localStorage.setItem("isVerified", user.isVerified); // Update isVerified in localStorage
      } else {
        set({ error: message, isLoading: false });
        toast.error(message); // Display error toast
      }

      console.log("Email verification response :--->> ", response.data);
      console.log("Verify Email isLoading: false");
      return response; // Return response data
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error verifying email";
      set({ error: errorMessage, isLoading: false });
      console.log("Verify Email isLoading: false");
      toast.error(errorMessage); // Display error toast
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    console.log("CheckAuth isCheckingAuth: true");

    try {
      const response = await axios.get(
        `http://localhost:4000/api/user/check-auth`
      );
      const { success, message, user } = response.data;

      if (success) {
        set({ user, isAuthenticated: true, isCheckingAuth: false });
        localStorage.setItem("isVerified", user.isVerified); // Update isVerified in localStorage
      } else {
        const errorMessage = message || "Authentication check failed";
        set({
          error: errorMessage,
          isCheckingAuth: false,
          isAuthenticated: false,
        });
        toast.error(errorMessage); // Display error toast
      }

      console.log("CheckAuth response :--->> ", response.data);
      console.log("CheckAuth isCheckingAuth: false");
      return response; // Return response data
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred";
      set({
        error: errorMessage,
        isCheckingAuth: false,
        isAuthenticated: false,
      });
      console.log("CheckAuth isCheckingAuth: false");
      toast.error(errorMessage); // Display error toast
      throw error;
    }
  },

forgotPassword: async (contact) => {
    set({ isLoading: true, error: null });
    console.log("ForgotPassword isLoading: true");

    try {
      const response = await axios.post(
        `http://localhost:4000/api/user/forgot-password`,
        { contact } // Send either email or phone
      );
      const { success, message } = response.data;

      if (success) {
        set({ message, isLoading: false });
        toast.success(message); // Display success toast
      } else {
        set({ error: message, isLoading: false });
        toast.error(message); // Display error toast
      }

      console.log("ForgotPassword isLoading: false");
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error sending reset password instructions";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.log("ForgotPassword isLoading: false");
      toast.error(errorMessage); // Display error toast
      throw error;
    }
  },



  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    console.log("ResetPassword isLoading: true");

    try {
      const response = await axios.post(
        `http://localhost:4000/api/user/reset-password/${token}`,
        { password }
      );
      const { success, message } = response.data;

      if (success) {
        set({ message });
        toast.success(message); // Display success toast
      } else {
        const errorMessage = message || "Error resetting password";
        set({ error: errorMessage });
        toast.error(errorMessage); // Display error toast
      }

      console.log("ResetPassword response :--->> ", response.data);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error resetting password";
      set({ error: errorMessage });
      console.log("ResetPassword error: ", error);
      toast.error(errorMessage); // Display error toast
      throw error;
    } finally {
      set({ isLoading: false });
      console.log("ResetPassword isLoading: false");
    }
  },
}));
