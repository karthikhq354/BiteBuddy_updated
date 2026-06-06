import axios from "axios";
import { createContext, useEffect, useState, useRef } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems]       = useState({});
  const [food_list, setFoodList]        = useState([]);   // ← fixed typo: was setFoofList
  const [token, setToken]               = useState("");
  const [searchQuery, setSearchQuery]   = useState("");   // ← NEW: global search state
  const [promoCode, setPromoCode]       = useState("");   // ← NEW: applied promo code
  const [discount, setDiscount]         = useState(0);    // ← NEW: discount amount in ₹

  const url = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
  const buttonRef = useRef(null);

  // ── CART ───────────────────────────────────────────────
  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  // ── NEW: PROMO CODE ────────────────────────────────────
  // Sends the code + current cart total to backend for validation.
  // On success, stores the discount amount so Cart and PlaceOrder can use it.
  // Returns { success, message } so the Cart page can show feedback.
  const applyPromoCode = async (code) => {
    try {
      const cartAmount = getTotalCartAmount();
      const response = await axios.post(url + "/api/promo/validate", {
        code,
        cartAmount,
      });

      if (response.data.success) {
        setPromoCode(response.data.code);
        setDiscount(response.data.discountAmount);
      }

      return response.data; // { success, message, discountAmount }
    } catch (error) {
      return { success: false, message: "Error applying promo code" };
    }
  };

  // Clears any applied promo — called when cart changes or user removes code
  const clearPromo = () => {
    setPromoCode("");
    setDiscount(0);
  };

  // ── NEW: FINAL AMOUNT (with discount applied) ──────────
  // Used in both Cart.jsx and PlaceOrder.jsx
  const getFinalAmount = () => {
    const subtotal     = getTotalCartAmount();
    const delivery     = subtotal === 0 ? 0 : 99;
    const afterDiscount = Math.max(0, subtotal - discount);
    return afterDiscount + delivery;
  };

  // ── FOOD LIST ──────────────────────────────────────────
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data && Array.isArray(response.data.data)) {
        setFoodList(response.data.data);
      } else {
        setFoodList([]);
      }
    } catch (err) {
      console.error("Failed to fetch food list:", err.message);
      setFoodList([]);
    }
};

  const loadCartData = async (token) => {
  try {
    const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
    setCartItems(response.data.cartData || {});
  } catch (err) {
    setCartItems({});
  }
};

 useEffect(() => {
  async function loadData() {
    await fetchFoodList();
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      await loadCartData(savedToken);
    } else {
      setCartItems({});
      localStorage.removeItem("cartItems");
    }
  }
  loadData();
}, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getFinalAmount,           // ← NEW
    url,
    token,
    setToken,
    buttonRef,
    searchQuery,              // ← NEW
    setSearchQuery,           // ← NEW
    promoCode,                // ← NEW
    discount,                 // ← NEW
    applyPromoCode,           // ← NEW
    clearPromo,               // ← NEW
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;