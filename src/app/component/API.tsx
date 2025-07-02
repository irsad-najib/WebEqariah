import axios from "axios";

const API_URL = "https://1302-36-81-64-232.ngrok-free.app/"; // Replace with your API URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true", // Add this header for ngrok
  },
});

export default axiosInstance;