// src/services/api.js
import axios from "axios";
import server from "../environment";

const api = axios.create({
  baseURL: `${server}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;