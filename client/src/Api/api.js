import axios from "axios";
import { resolvePath } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

//this automatically attach JWT tocken to every request, in config
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("user"));

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

api.interceptors.request.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      //token expires and give 401 error
      localStorage.removeItem("user");
      window.location.href = "/login"; //hypertext reference
    }

    return Promise.reject(error); //after sending to login page this resolves the error
  },
);

export default api;
