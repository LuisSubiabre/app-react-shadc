import api from "../config/api.ts";

interface Accidente {
  estudiante_id: number;
  rut_estudiante: string;
  nombre_estudiante: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: string;
  direccion: string;
  celular: string;
  curso: string;
  fecha_registro: string;
  fecha_accidente: string;
  hora_accidente: string;
  dia_semana: string;
  tipo_accidente: string;
  horario: string;
  circunstancia: string;
  testigo1_nombre: string;
  testigo1_cedula: string;
  testigo2_nombre: string;
  testigo2_cedula: string;
}

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

export const insertAccidente = async (accidente: Accidente) => {
  return api
    .post("/accidentes", accidente)
    .then((response) => response.data);
};

export const getAccidenteByEstudiante = async (estudiante_id: number) => {
  return api
    .get(`/accidentes/estudiante/${estudiante_id}`)
    .then((response) => response.data);
};

export const deleteAccidente = async (accidente_id: number) => {
  return api
    .delete(`/accidentes/${accidente_id}`)
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
