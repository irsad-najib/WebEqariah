import axios from "axios";

const API_URL = "http://localhost:5000/"; // Replace with your API URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;
