import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getAsistencia = async (
  estudiante_id: number,
  mes: number,
  anio: number
) => {
  return api
    .get(`/asistencias/${estudiante_id}/${mes}/${anio}`)
    .then((response) => response.data);
};
