import { TallerType } from "@/types/index.ts";
import api from "../config/api.ts";
import axios from "axios";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getTalleres = async () => {
  return api.get(`/talleres`).then((response) => response.data);
};

export const getTallerById = async (taller_id: number) => {
  return api.get(`/talleres/${taller_id}`).then((response) => response.data);
};

export const saveNewTaller = async (taller: TallerType) => {
  try {
    console.log("Enviando taller al servidor:", taller);
    const response = await api.post(`/talleres`, taller);
    console.log("Respuesta completa del servidor:", response);
    return response.data;
  } catch (error) {
    console.error("Error en saveNewTaller:", error);
    throw error;
  }
};

export const saveEditTaller = async (taller: TallerType) => {
  return api
    .put(`/talleres/${taller.taller_id}`, taller)
    .then((response) => response.data);
};

export const deleteTaller = async (taller_id: number) => {
  return api.delete(`/talleres/${taller_id}`).then((response) => response.data);
};

export const obtenerAsignaciones = async (taller_id: number) => {
  return api
    .get(`/talleres-curso/listacursos/${taller_id}`)
    .then((response) => response.data);
};
export const eliminarAsignacion = async (
  taller_id: number,
  curso_id: number
): Promise<void> => {
  return api
    .delete(`/talleres-curso/${taller_id}/${curso_id}`)
    .then((response) => response.data);
};
export const asignarCurso = async (
  taller_id: number,
  curso_id: number
): Promise<void> => {
  return api
    .post(`/talleres-curso`, { taller_id, curso_id })
    .then((response) => response.data);
};

export const getEstudiantesInscritos = async (taller_id: number) => {
  try {
    console.log(
      "Iniciando llamada a getEstudiantesInscritos con taller_id:",
      taller_id
    );
    const response = await api.get(`/talleres/estudiantes/${taller_id}`);
    console.log("Respuesta completa de la API:", response);
    return response.data;
  } catch (error) {
    console.error("Error en getEstudiantesInscritos:", error);
    if (axios.isAxiosError(error)) {
      console.error("Detalles del error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    throw error;
  }
};

export const inscribirEstudianteTaller = async (
  taller_id: number,
  estudiante_id: number
) => {
  return api
    .post(`/talleres/inscripcion`, { taller_id, estudiante_id })
    .then((response) => response.data);
};

export const desinscribirEstudianteTaller = async (
  taller_id: number,
  estudiante_id: number
) => {
  return api
    .delete(`/talleres/inscripcion/${taller_id}/${estudiante_id}`)
    .then((response) => response.data);
};

export const getTalleresByMonitor = async (monitor_id: number) => {
  return api
    .get(`/talleres/monitor/${monitor_id}`)
    .then((response) => response.data);
};

export const getTalleresByCursoJefatura = async (curso_id: number) => {
  return api
    .get(`/talleres/curso/${curso_id}`)
    .then((response) => response.data);
};
