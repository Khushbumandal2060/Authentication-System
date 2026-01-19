import axios from "axios";

const API = axios.create({
  baseURL: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/auth"
    : "https://authentication-system-backend-nyr9.onrender.com/api/auth",
});

// Axios request interceptor to inject JWT authToken automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;