import axios from "axios";

const api = axios.create({
  baseURL: "https://art-dinginess-activity.ngrok-free.dev",
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

//this automatically attach JWT tocken to every request, in config
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("user"));

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

api.interceptors.response.use(
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
