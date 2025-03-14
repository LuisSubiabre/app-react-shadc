import { RolType } from "@/types/index.ts";
import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getRoles = async () => {
  return api.get(`/roles`).then((response) => response.data);
};

export const saveNewRol = async (newRol: Partial<RolType>) => {
  return api.post(`/roles`, newRol).then((response) => response.data.result);
};

export const savaEditRol = async (currentRol: {
  id: number;
  nombre: string;
  descripcion?: string;
}) => {
  return api
    .patch(`/roles/${currentRol.id}`, currentRol)
    .then((response) => response.data);
};

export const deleteRol = async (id: number) => {
  return api.delete(`/roles/${id}`).then((response) => response.data);
};
