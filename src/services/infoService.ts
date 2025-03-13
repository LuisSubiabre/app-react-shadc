import api from "../config/api.ts";

// ** Rutas Públicas **
// ** Rutas Privadas (requieren autenticación) **
export const getUltimosInscritos = async () => {
  return api.get(`/info/ultimosestudiantes/`).then((response) => response);
};
