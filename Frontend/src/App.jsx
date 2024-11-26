import React, { useEffect, useState, useContext } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import PlaceOrder from './pages/PlaceOrder';
import Footer from './components/Footer';
import Login from './components/Login';
import { Toaster, toast } from 'react-hot-toast';
import Verify from './pages/Verify';
import MyOrders from './pages/MyOrders';
import Item from './pages/Item';
import Success from './pages/Success';
import Email_verification from './pages/Email_verification';
import ResetPassword from './pages/ResetPassword';
import Search from './components/Search';
import { useAuthStore } from './store/authStore';
import { StoreContext } from './context/StoreContext';
import Menu from './pages/Menu';




const ProtectedRoute = ({ children, setShowLogin }) => {
  const { user } = useAuthStore();
  const { isLoggedIn, setCurrState, cartItems } = useContext(StoreContext);
  const [redirectPath, setRedirectPath] = useState(null);
  const isVerified = localStorage.getItem('isVerified');

  console.log('user verification protected route ---->>>', isVerified)

  useEffect(() => {
    if (isVerified === 'false') {
      toast.error("not verified, please signup again.");
      setShowLogin(true);
      setCurrState('signUp');
      setRedirectPath('/'); // Set the redirect path
      return;
    } else if (!isLoggedIn) {
      toast.error("User not logged in");
      setRedirectPath('/'); // Set the redirect path
      return;
    }
  }, [user, isLoggedIn, cartItems]); // Only runs when `user`, `isLoggedIn`, or `setCurrState` changes

  // Redirect if needed
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Render the protected content if no redirect is needed
  return children;
};



const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  console.log("RedirectAuthenticatedUser Rendered");
  console.log("isAuthenticated:", isAuthenticated);
  console.log("User:", user);

  if (isAuthenticated && user.isVerified) {
    console.log("Authenticated user detected. Redirecting to home page.");
    return <Navigate to='/' replace />;
  }

  console.log("User is not authenticated or not verified. Rendering children.");
  return children;
}

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      {showSearch && <Search setShowSearch={setShowSearch} />}
      {showLogin && <Login setShowLogin={setShowLogin} />}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} setShowSearch={setShowSearch} />
        <Routes>
          <Route path='/' element={
            <Home setShowSearch={setShowSearch} />
          } />
          <Route path='/cart' element={
            <ProtectedRoute setShowLogin={setShowLogin}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path='/order' element={
            <ProtectedRoute setShowLogin={setShowLogin}>
              <PlaceOrder />
            </ProtectedRoute>
          } />
          <Route path='/success' element={<Success />} />
          <Route path='/my-orders' element={
            <ProtectedRoute setShowLogin={setShowLogin}>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path='/item/:id' element={<Item />} />
          <Route path='/verify' element={
            <RedirectAuthenticatedUser>
              <Email_verification />
            </RedirectAuthenticatedUser>
          } />
          <Route path='/reset-password/:token' element={
            <ResetPassword setShowLogin={setShowLogin} />
          } />

          <Route path='/menu' element={
            <Menu />
          } />
        </Routes>



      </div>

      <Toaster />
    </>
  );
};

export default App;
