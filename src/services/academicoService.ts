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

export const saveCalificacion = async (
  estudiante_id: number,
  asignatura_id: number,
  posicion: number,
  nota: number | null
) => {
  return api
    .patch(
      `/estudiantes-asignaturas/${estudiante_id}/${asignatura_id}/${posicion}`,
      {
        estudiante_id,
        asignatura_id,
        posicion,
        nota,
      }
    )
    .then((response) => response.data);
};
