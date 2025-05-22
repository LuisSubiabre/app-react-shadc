import api from "../config/api.ts";
import { InformePersonalidad } from "../types/informePersonalidad";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getInformePersonalidad = async (estudianteId: number) => {
  return api.get(`/informe-personalidad/${estudianteId}`).then((response) => response.data);
};

export const updateInformePersonalidad = async (estudianteId: number, data: Partial<InformePersonalidad>) => {
  return api.patch(`/informe-personalidad/${estudianteId}`, data).then((response) => response.data);
};
