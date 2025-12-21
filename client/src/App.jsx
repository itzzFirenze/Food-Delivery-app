import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Restaurants from "./pages/Restaurants";

const App = () => {
   return (
      <div className="min-h-screen">
         <Navbar />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="*" element={<Navigate to="/" />} />
         </Routes>
      </div>
   )
}

export default App