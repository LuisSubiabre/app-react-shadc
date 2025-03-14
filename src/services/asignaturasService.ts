import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getAsignaturas = async () => {
  return api.get(`/asignaturas`).then((response) => response.data);
};

export const saveNewAsignatura = async (newAsignatura: {
  nombre: string;
  descripcion: string;
  indice: number;
  concepto: boolean;
  codigo_sige: number;
  nivel_educativo: number;
  es_comun: boolean;
}) => {
  return api
    .post(`/asignaturas`, newAsignatura)
    .then((response) => response.data);
};
export const saveEditAsignatura = async (
  asignatura_id: number,
  asignatura: {
    nombre: string;
    descripcion: string;
    indice: number;
    concepto: boolean;
    codigo_sige: number;
    nivel_educativo: number;
    es_comun: boolean;
  }
) => {
  return api
    .put(`/asignaturas/${asignatura_id}`, asignatura)
    .then((response) => response.data);
};
export const deleteAsignatura = async (asignatura_id: number) => {
  return api
    .delete(`/asignaturas/${asignatura_id}`)
    .then((response) => response.data);
};
