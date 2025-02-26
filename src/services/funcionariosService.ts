//import { CursoType } from "@/types/index.ts";
import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getFuncionarios = async () => {
  return api.get(`/usuarios`).then((response) => response.data);
};

// export const saveNewCurso = async (newCurso: Partial<CursoApiResponseType>) => {
//   console.log(newCurso);
//   //return api.post(`/cursos`, newCurso).then((response) => response.data.result);
// };

//   export const savaEditRol = async (currentRol: {
//     id: number;
//     nombre: string;
//     descripcion?: string;
//   }) => {
//     return api
//       .patch(`/roles/${currentRol.id}`, currentRol)
//       .then((response) => response.data);
//   };

//   export const deleteRol = async (id: number) => {
//     return api.delete(`/roles/${id}`).then((response) => response.data);
//   };
