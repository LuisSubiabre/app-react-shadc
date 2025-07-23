import { AsignaturasEncuestaFDResponseType } from "@/types/index.ts";
import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getAsignaturasEncuestaFD = async (): Promise<AsignaturasEncuestaFDResponseType> => {
  return api.get(`/fd-encuesta/asignaturas`).then((response) => response.data);
};

// Tipo para crear nueva asignatura (sin campos de ID y fechas)
export interface CreateAsignaturaEncuestaFDType {
  nombre: string;
  area: string;
  bloque: string;
  cupos_totales: number;
  cupos_actuales: number;
  estado: string;
  asignatura_id?: number | null; // Campo opcional para vincular con asignatura existente
}

export const postAsignaturaEncuestaFD = async (asignatura: CreateAsignaturaEncuestaFDType) => {
  return api.post(`/fd-encuesta/asignaturas`, asignatura).then((response) => response.data);
};


