import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3100",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (config?.headers?.noAuth) {
      delete config.headers.noAuth; // Eliminar para que no se envíe en la solicitud real
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
