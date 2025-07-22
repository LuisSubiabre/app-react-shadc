import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getCasosEstudiante = async (estudiante_id: number) => {
    const response = await api.get(`/convivencia-casos/estudiante/${estudiante_id}`);
    return response.data || [];
  };
  