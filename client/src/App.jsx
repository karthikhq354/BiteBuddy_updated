import Navbar from "./components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import { useState, useEffect } from "react";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import Menu from "./pages/Menu/Menu";
import Profile from "./pages/Profile/Profile";
import Track from "./pages/Track/Track";
import Search from "./pages/Search/Search";
import AboutUs from "./pages/AboutUs/AboutUs";
import ContactUs from "./pages/ContactUs/ContactUs";
import NutritionMode from "./components/NutritionMode/NutritionMode";
import GroupOrder from "./components/GroupOrder/GroupOrder";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import FloatingCartButton from "./components/FloatingCartButton/FloatingCartButton";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Chatbot from "./components/Chatbot/Chatbot";

const App = () => {
  const [showLogin,      setShowLogin]      = useState(false);
  const [darkMode,       setDarkMode]       = useState(() => localStorage.getItem("darkMode") === "true");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
      <ScrollToTop />
      
      <Navbar
        setShowLogin={setShowLogin}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        openCart={() => setCartDrawerOpen(true)}
      />
      
      <div className="app">
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/menu"           element={<Menu />} />
          <Route path="/cart"           element={<Cart />} />
          <Route path="/order"          element={<PlaceOrder />} />
          <Route path="/verify"         element={<Verify />} />
          <Route path="/myorders"       element={<MyOrders />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="/track/:orderId" element={<Track />} />
          <Route path="/search"         element={<Search />} />
          <Route path="/about"          element={<AboutUs />} />
          <Route path="/contact"        element={<ContactUs />} />
          <Route path="/nutrition"      element={<NutritionMode />} />
          <Route path="/group-order"    element={<GroupOrder />} />
        </Routes>
      </div>
      <Footer />
      <Chatbot />
      <FloatingCartButton onClick={() => setCartDrawerOpen(true)} />
    </>
  );
};

export default App;