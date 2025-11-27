import api from "../config/api.ts";

// ** Rutas Públicas **
// ** Rutas Privadas (requieren autenticación) **
export const getSigeArchivo4 = async (curso_id: number) => {
  return api.get(`/sige/archivo4/${curso_id}`).then((response) => response);
};
