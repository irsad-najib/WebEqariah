import axios from "axios";

const API_URL = "https://api.eqariah.com";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;
