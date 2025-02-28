import api from "../config/api.ts";

// ** Rutas Públicas **
// ** Rutas Privadas (requieren autenticación) **
export const getAsignaturasCurso = async (curso_id: number) => {
  return api
    .get(`/asignaturascursos/curso/${curso_id}`)
    .then((response) => response.data);
};

export const getEstudiantesEnAsignatura = async (
  asignatura_id: number,
  curso_id: number
) => {
  return api
    .get(`/estudiantes-asignaturas/notas/${asignatura_id}/${curso_id}`)
    .then((response) => response.data);
};
