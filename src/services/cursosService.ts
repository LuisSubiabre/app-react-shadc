//import { CursoType } from "@/types/index.ts";
import { CursoApiResponseType } from "@/types/index.ts";
import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getCursos = async () => {
  return api.get(`/cursos`).then((response) => response.data);
};

export const saveNewCurso = async (newCurso: Partial<CursoApiResponseType>) => {
  return api.post(`/cursos`, newCurso).then((response) => response.data);
};

export const savaEditCurso = async (currentCurso: {
  id: number;
  nombre: string;
  descripcion?: string;
  indice: number;
  codigo_ensenanza: number;
  profesor_jefe_id: number;
}) => {
  return api
    .put(`/cursos/${currentCurso.id}`, currentCurso)
    .then((response) => response.data);
};

export const deleteCurso = async (id: number) => {
  return api.delete(`/cursos/${id}`).then((response) => response.data);
};
