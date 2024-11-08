import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";



export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000";

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCartItems = localStorage.getItem("cartItems");
      return savedCartItems ? JSON.parse(savedCartItems) : {};
    } catch (error) {
      console.error("Error parsing cart items from localStorage:", error);
      return {};
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [food_list, setFood_List] = useState([]);
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || "");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("userEmail") || "");
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");
  const [userPhone, setUserPhone] = useState(() => localStorage.getItem("userPhone") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [operationType, setOperationType] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(null);
  const [currState, setCurrState] = useState("Login");

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
    localStorage.removeItem("userPhone");
};

  const addToCartOnServer = async (itemId) => {
    if (token) {
      try {
        const response = await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (response.status === 200 || response.status === 201) {
          return true;
        }
      } catch (error) {
        if (error.response) {
          toast.error(`Failed to add item`);
          console.log(error)
          logout();
        } else {
          toast.error("Network error, please try again later.");
        }
        console.error("Error adding item to cart:", error);
      }
    } else {
      toast.error("Please log in first or login again.");
    }
  };

  const updateCartItemOnServer = async (id, quantity) => {
    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/update`,
          { itemId: id, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error updating item quantity:", error);
      }
    } else {
      console.log("No token for cart");
    }
  };

  const removeFromCartOnServer = async (itemId) => {
    if (token) {
      try {
        await axios.delete(`${url}/api/cart/remove`, {
          data: { itemId },
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Error removing item from cart:", error);
      }
    } else {
      console.log("No token for cart");
    }
  };


  // Fetch food list
  useEffect(() => {
    const fetchFoodList = async () => {
      try {
        const response = await axios.get(`${url}/api/food/list`);
        setFood_List(response.data.data);
      } catch (error) {
        console.error("Error fetching food list:", error);
      }
    };
    fetchFoodList();
  }, []);

  // Load cart data
  useEffect(() => {
    const loadCartData = async (token) => {
      try {
        const response = await axios.get(`${url}/api/cart/get`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const cartData = response.data.cartData;
          if (cartData) {
            setCartItems(cartData);
            localStorage.setItem("cartItems", JSON.stringify(cartData));
          } else {
            throw new Error("Cart data is empty");
          }
        } else {
          throw new Error(`Error: Received status code ${response.status}`);
        }
      } catch (error) {
        console.log("Error loading cart data:", error);
        if (error.response && error.response.status === 401) {
          alert("Your session has expired. Please log in again.");
        }
      }
    };

    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      loadCartData(savedToken);
    }
  }, [isLoggedIn, token]);

  // Handle adding items
  useEffect(() => {
    if (operationType === 'add' && currentItemId) {
      const addItem = async () => {
        await addToCartOnServer(currentItemId);
        setOperationType(null);
        setCurrentItemId(null);
      };
      addItem();
    }
  }, [operationType, currentItemId]);

  // Handle updating items
  useEffect(() => {
    if (operationType === 'update' && currentItemId !== null && currentQuantity !== null) {
      const updateItem = async () => {
        await updateCartItemOnServer(currentItemId, currentQuantity);
        setOperationType(null);
        setCurrentItemId(null);
        setCurrentQuantity(null);
      };
      updateItem();
    }
  }, [operationType, currentItemId, currentQuantity]);

  // Handle removing items
  useEffect(() => {
    if (operationType === 'remove' && currentItemId) {
      const removeItem = async () => {
        await removeFromCartOnServer(currentItemId);
        setOperationType(null);
        setCurrentItemId(null);
      };
      removeItem();
    }
  }, [operationType, currentItemId]);

  const addToCart = async (itemId) => {
    const success = await addToCartOnServer(itemId);
    
    if (success) {
      setCartItems((prev) => {
        const newCartItems = { ...prev };
        if (!newCartItems[itemId]) {
          newCartItems[itemId] = 1;
        } else {
          newCartItems[itemId] += 1;
        }
        localStorage.setItem("cartItems", JSON.stringify(newCartItems));
        setOperationType('add');
        setCurrentItemId(itemId);
        return newCartItems;
      });
    } else {
      console.log(success);
    }
  };

  const handleIncrement = (id) => {
    setCartItems((prevItems) => {
      const updatedItems = { ...prevItems, [id]: (prevItems[id] || 0) + 1 };
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      setOperationType('update');
      setCurrentItemId(id);
      setCurrentQuantity(updatedItems[id]);
      return updatedItems;
    });
  };

  const handleDecrement = (id) => {
    setCartItems((prevItems) => {
      const updatedItems = { ...prevItems };
      if (updatedItems[id] > 1) {
        updatedItems[id] -= 1;
        localStorage.setItem("cartItems", JSON.stringify(updatedItems));
        setOperationType('update');
        setCurrentItemId(id);
        setCurrentQuantity(updatedItems[id]);
      } else {
        delete updatedItems[id];
        localStorage.setItem("cartItems", JSON.stringify(updatedItems));
        setOperationType('remove');
        setCurrentItemId(id);
      }
      return updatedItems;
    });
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCartItems = { ...prev };
      delete newCartItems[itemId];
      localStorage.setItem("cartItems", JSON.stringify(newCartItems));
      setOperationType('remove');
      setCurrentItemId(itemId);
      return newCartItems;
    });
  };

  const updateCartItemQuantity = (id, quantity) => {
    setCartItems((prevItems) => {
      const updatedItems = { ...prevItems, [id]: quantity };
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      setOperationType('update');
      setCurrentItemId(id);
      setCurrentQuantity(quantity);
      return updatedItems;
    });
  };

  const contextValue = {
    food_list,
    cartItems,
    url,
    token,
    userId,
    userName,
    userEmail,
    isLoggedIn,
    currState,
    userPhone,
    setCurrState,
    setIsLoggedIn,
    setToken,
    setUserId,
    setCartItems,
    setUserEmail,
    setUserName,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    updateCartItemQuantity,
    handleDecrement,
    handleIncrement,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
      <Toaster/>
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
