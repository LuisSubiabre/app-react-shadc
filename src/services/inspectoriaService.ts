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

// export const getAtrasosRangoFecha = async (fechaInicio: string, fechaFin: string) => {
//   console.log("Llamando a getAtrasosRangoFecha con:", { fechaInicio, fechaFin });
  
//   return api
//     .post('/api/atrasos/rango-fecha', { fechaInicio, fechaFin })
//     .then((response) => {
//       console.log("Respuesta de getAtrasosRangoFecha:", response);
//       return response.data;
//     })
//     .catch((error) => {
//       console.error("Error en getAtrasosRangoFecha:", error);
//       throw error;
//     });
// };
