import { AsignaturasEncuestaFDResponseType, InscritoAnteriorEncuestaFDType, InscritosEncuestaFDResponseType } from "@/types/index.ts";
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

// Tipo para actualizar asignatura (incluye ID)
export interface UpdateAsignaturaEncuestaFDType extends CreateAsignaturaEncuestaFDType {
  asignatura_encuesta_id: number;
}

export const postAsignaturaEncuestaFD = async (asignatura: CreateAsignaturaEncuestaFDType) => {
  return api.post(`/fd-encuesta/asignaturas`, asignatura).then((response) => response.data);
};

export const updateAsignaturaEncuestaFD = async (asignatura: UpdateAsignaturaEncuestaFDType) => {
  return api.patch(`/fd-encuesta/asignaturas/${asignatura.asignatura_encuesta_id}`, asignatura).then((response) => response.data);
};

export const deleteAsignaturaEncuestaFD = async (asignatura_encuesta_id: number) => {
  return api.delete(`/fd-encuesta/asignaturas/${asignatura_encuesta_id}`).then((response) => response.data);
};

export const inscritosAnterioresEncuestaFD = async (asignatura_encuesta_id: number): Promise<InscritoAnteriorEncuestaFDType[]> => {
  const url = `/fd-encuesta/anterior/${asignatura_encuesta_id}`;
  console.log('Calling inscritosAnterioresEncuestaFD with URL:', url);
  return api.get(url).then((response) => response.data);
};

export const getInscritosEncuestaFD = async (asignatura_encuesta_id: number): Promise<InscritosEncuestaFDResponseType> => {
  const url = `/fd-encuesta/elecciones/asignatura/${asignatura_encuesta_id}`;
  console.log('Calling getInscritosEncuestaFD with URL:', url);
  return api.get(url).then((response) => response.data);
};

export const eliminarInscritoEncuestaFD = async (inscrito_encuesta_id: number) => {
  const url = `/fd-encuesta/elecciones/${inscrito_encuesta_id}`;
  console.log('Calling eliminarInscritoEncuestaFD with URL:', url);
  return api.delete(url).then((response) => response.data);
};

