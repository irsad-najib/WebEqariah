import axios from "axios";

const API_URL = "https://BEeqariah-endpoint-d5akg9g9csfcfqa2.z02.azurefd.net";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;
