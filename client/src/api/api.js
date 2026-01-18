import axios from "axios";

const API = axios.create({
  baseURL: "https://authentication-system-backend-nyr9.onrender.com/api/auth",
});

export default API;