import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [token, setToken] = useState(localStorage.getItem('token') || '');

   useEffect(() => {
      if (token) {
         try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
               logout();
            } else {
               setUser(decoded);
            }
         } catch (error) {
            logout();
         }
      }
   }, [token]);

   const login = (newToken, userData) => {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
   };

   const logout = () => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
   };

   return (
      <AuthContext.Provider value={{ user, login, logout }} >
         {children}
      </AuthContext.Provider>
   );
};

export default AuthContext;