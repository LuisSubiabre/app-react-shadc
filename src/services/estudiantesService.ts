import { EstudianteType } from "@/types/index.ts";
import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getEstudiantes = async () => {
  return api.get("/estudiantes").then((response) => response.data);
};

export const estudiantesCurso = async (cursoId: number) => {
  return api
    .get(`/cursos/estudiantes/${cursoId}`)
    .then((response) => response.data);
};

export const saveEstudiante = async (estudiante: EstudianteType) => {
  return api
    .post("/estudiantes", estudiante)
    .then((response) => response.data.result);
};

export const saveEditEstudiante = async (estudiante: EstudianteType) => {
  return api
    .patch(`/estudiantes/${estudiante.id}`, estudiante)
    .then((response) => response.data);
};

export const deleteEstudiante = async (id: number) => {
  return api.delete(`/estudiantes/${id}`).then((response) => response.data);
};

export const changePasswordEstudiante = async (id: number, clave: string) => {
  return api
    .patch(`/estudiantes/password/${id}`, { clave })
    .then((response) => response.data);
};
