import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ContactUs from "./pages/ContactUs";

const App = () => {
   const location = useLocation();
   const hideNavbar = ['/login', '/register'].includes(location.pathname);

   return (
      <div className="min-h-screen">
         {!hideNavbar && <Navbar />}
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="*" element={<Navigate to="/" />} />
         </Routes>
      </div>
   )
}

export default App