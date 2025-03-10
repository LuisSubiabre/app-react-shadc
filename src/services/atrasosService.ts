import api from "../config/api.ts";

export interface Atraso {
  atraso_id: number;
  estudiante_id: number;
  fecha: string;
  hora_registro: string;
  tipo: "llegada" | "jornada";
  justificado: boolean;
  observaciones: string;
  fecha_registro: string;
}

export interface CreateAtrasoDTO {
  estudiante_id: number;
  fecha: string;
  hora: string;
  hora_registro: string;
  tipo: "llegada" | "jornada";
  justificado?: boolean;
  observaciones?: string;
  fecha_registro?: string;
}

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getAtrasos = async () => {
  return api.get("/atrasos").then((response) => response.data);
};

export const getAtrasoById = async (id: number) => {
  return api.get(`/atrasos/${id}`).then((response) => response.data);
};

export const createAtraso = async (data: CreateAtrasoDTO) => {
  return api.post("/atrasos", data).then((response) => response.data);
};

export const deleteAtraso = async (id: number) => {
  return api.delete(`/atrasos/${id}`).then((response) => response.data);
};
