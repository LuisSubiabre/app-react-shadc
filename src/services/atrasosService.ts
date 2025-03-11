import api from "../config/api.ts";

export interface Atraso {
  id: number;
  estudiante_id: number;
  fecha: string;
  hora: string;
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
  const response = await api.get("/atrasos");
  return response.data.data || [];
};

export const getAtrasoById = async (id: number) => {
  const response = await api.get(`/atrasos/${id}`);
  return response.data.data || null;
};

export const createAtraso = async (data: CreateAtrasoDTO) => {
  const response = await api.post("/atrasos", data);
  return response.data.data;
};

export const deleteAtraso = async (id: number) => {
  const response = await api.delete(`/atrasos/${id}`);
  return response.data.data;
};

export const getAtrasosByEstudiante = async (estudianteId: number) => {
  try {
    const response = await api.get(`/atrasos/estudiante/${estudianteId}`);
    console.log("Respuesta completa:", response);
    console.log("Datos de atrasos:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener atrasos:", error);
    throw error;
  }
};
