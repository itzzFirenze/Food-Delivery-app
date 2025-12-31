import axios from 'axios';

const API = axios.create({ baseURL: 'https://food-delivery-app-backend-9dm5.onrender.com' });

// Add a request interceptor to include the Token in every request
API.interceptors.request.use((req) => {
   if (localStorage.getItem('token')) {
      req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
   }
   return req;
});

export default API;