import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_BASE,
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

// Agregar interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar el token
      localStorage.removeItem("token");
      // Redirigir al login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
