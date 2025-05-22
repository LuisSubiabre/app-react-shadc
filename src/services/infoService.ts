import api from "../config/api.ts";

// ** Rutas Públicas **
// ** Rutas Privadas (requieren autenticación) **
export const getUltimosInscritos = async () => {
  return api.get(`/info/ultimosestudiantes/`).then((response) => response);
};

export const getUltimosRetirados = async () => {
  return api.get(`/info/ultimosretirados/`).then((response) => response);
}

export const getPromedioPorCurso = async (curso_id: number) => {
  return api.get(`/info/promedioporcurso/${curso_id}`).then((response) => response);
}
