//import { CursoType } from "@/types/index.ts";
import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getFuncionarios = async () => {
  return api.get(`/usuarios`).then((response) => response.data);
};

export const saveNewFuncionario = async (newFuncionario: {
  nombre: string;
  email: string;
  rut: string;
  clave: string;
}) => {
  return api
    .post(`/usuarios`, newFuncionario)
    .then((response) => response.data.result);
};

export const saveEditFuncionario = async (
  id: number,
  funcionario: {
    nombre: string;
    email: string;
    rut: string;
    activo: boolean;
  }
) => {
  return api
    .patch(`/usuarios/${id}`, funcionario)
    .then((response) => response.data.result);
};

export const deleteFuncionario = async (id: number) => {
  return api.delete(`/usuarios/${id}`).then((response) => response.data);
};

export const getFuncionarioCursos = async (id: number) => {
  return api.get(`/usuarioscursos/${id}`).then((response) => response.data);
};

export const asignarCursoFuncionario = async (
  curso_id: number,
  usuario_id: number
) => {
  return api
    .post(`/usuarioscursos`, { curso_id, usuario_id })
    .then((response) => response.data);
};

export const eliminarCursoFuncionario = async (
  curso_id: number,
  usuario_id: number
) => {
  return api
    .delete(`/usuarioscursos`, { data: { curso_id, usuario_id } })
    .then((response) => response.data);
};

export const changePassword = async (id: number, clave: string) => {
  return api
    .patch(`/usuarios/password/${id}`, { clave })
    .then((response) => response.data.result);
};

export const getRolesFuncionario = async (id: number) => {
  return api.get(`/usuariosroles/${id}`).then((response) => response.data);
};

export const asignarRolFuncionario = async (
  rol_id: number,
  usuario_id: number
) => {
  return api
    .post(`/usuariosroles`, { rol_id, usuario_id })
    .then((response) => response.data);
};

export const eliminarRolFuncionario = async (
  rol_id: number,
  usuario_id: number
) => {
  return api
    .delete(`/usuariosroles/${usuario_id}/${rol_id}`, {
      data: { rol_id, usuario_id },
    })
    .then((response) => response.data);
};
