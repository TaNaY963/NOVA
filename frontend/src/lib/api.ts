import axios from "axios";
import { basename } from "path";

const api = axios.create({
  baseURL: process.env.FRONTEND_API_URL || "http://localhost:5002/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;