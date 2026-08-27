import axios from 'axios';

const API = axios.create({
   baseURL: import.meta.env.PROD
      ? 'https://food-delivery-app-backend-9dm5.onrender.com'
      : 'http://localhost:3000'
});

API.interceptors.request.use((req) => {
   if (localStorage.getItem('token')) {
      req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
   }
   return req;
});

export default API;
