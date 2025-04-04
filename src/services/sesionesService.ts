//import { CursoType } from "@/types/index.ts";
import api from "../config/api.ts";


export interface Sesion {
  sesion_id: number;
  taller_id: number;
  fecha: string;
  estado: string;
}

export const obtenerSesiones = async (taller_id: number) => {
  return api.get(`talleres-sesiones/taller/${taller_id}`).then((response) => response.data);
};

export const crearSesion = async (taller_id: number, profesor_id: number, fecha: string, hora: string, estado: string) => {
  //console.log(taller_id, profesor_id, fecha, hora, estado);
  return api.post(`talleres-sesiones`, { taller_id, profesor_id, fecha, hora, estado }).then((response) => response.data);
}

export const eliminarSesion = async (sesion_id: number) => {
  return api.delete(`talleres-sesiones/${sesion_id}`).then((response) => response.data);

}

export const obtenerEstudiantesSesion = async (sesion_id: number) => {
  return api.get(`talleres-sesiones/asistencia/${sesion_id}`).then((response) => response.data);
}

export const modificarAsistencia = async (asistencia_id: number, asistio: boolean) => {
  return api.put(`talleres-sesiones/asistencia/${asistencia_id}`, { asistio }).then((response) => response.data);
}