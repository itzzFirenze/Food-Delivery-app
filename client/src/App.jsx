import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Restaurants from "./pages/Restaurants";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
   const location = useLocation();
   const hideNavbar = ['/login', '/register'].includes(location.pathname);

   return (
      <div className="min-h-screen">
         {!hideNavbar && <Navbar />}
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
         </Routes>
      </div>
   )
}

export default App