import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getJefatura = async (userId: number) => {
  return api.get(`/jefatura/${userId}`).then((response) => response.data);
};
