import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getCasosEstudiante = async (estudiante_id: number) => {
    try {
      const response = await api.get(`/convivencia-casos/estudiante/${estudiante_id}`);
      
      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && Array.isArray(response.data.casos)) {
        return response.data.casos;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error en getCasosEstudiante:', error);
      throw error;
    }
  };

export const createCaso = async (data: {
  estudiante_id: number;
  paso1: boolean;
  fecha_paso1: string | null;
  paso2: boolean;
  fecha_paso2: string | null;
  paso3: boolean;
  fecha_paso3: string | null;
  paso4: boolean;
  fecha_paso4: string | null;
  url: string | null;
  observaciones: string | null;
  falta_id: number;
}) => {
  const response = await api.post('/convivencia-casos', data);
  return response.data;
};

export const updateCaso = async (caso_id: number, data: {
  estudiante_id: number;
  paso1: boolean;
  fecha_paso1: string | null;
  paso2: boolean;
  fecha_paso2: string | null;
  paso3: boolean;
  fecha_paso3: string | null;
  paso4: boolean;
  fecha_paso4: string | null;
  url: string | null;
  observaciones: string | null;
  falta_id: number;
}) => {
  const response = await api.put(`/convivencia-casos/${caso_id}`, data);
  return response.data;
};

export const deleteCaso = async (caso_id: number) => {
    const response = await api.delete(`/convivencia-casos/${caso_id}`);
    return response.data || [];
  };

export const getAllCasos = async () => {
  const response = await api.get('/convivencia-casos/all');
  return response.data;
}

// ** Servicios para Comentarios de Convivencia **

export const getComentariosConvivenciaCaso = async (casoId: number) => {
  try {
    const response = await api.get(`/convivencia-casos/comentarios/${casoId}/`);
    return response.data;
  } catch (error) {
    console.error('Error en getComentariosConvivenciaCaso:', error);
    throw error;
  }
};

export const insertComentarioConvivencia = async (data: {
  caso_id: number;
  comentario: string;
  usuario_id: number;
}) => {
  try {
    const response = await api.post('/convivencia-casos/comentarios/', data);
    return response.data;
  } catch (error) {
    console.error('Error en insertComentarioConvivencia:', error);
    throw error;
  }
};

export const updateComentarioConvivencia = async (comentarioId: number, data: {
  comentario: string;
}) => {
  try {
    const response = await api.put(`/convivencia-casos/comentarios/${comentarioId}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error en updateComentarioConvivencia:', error);
    throw error;
  }
};

export const deleteComentarioConvivencia = async (comentarioId: number) => {
  try {
    const response = await api.delete(`/convivencia-casos/comentarios/${comentarioId}/`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteComentarioConvivencia:', error);
    throw error;
  }
};

export const getFaltas = async () => {
  const response = await api.get(`/convivencia-casos/faltas`);
  return response.data;
};

// ** Servicios para Gestión de Faltas **

export const postFaltas = async (data: {
  nombre: string;
  descripcion: string;
  color: string;
}) => {
  try {
    const response = await api.post('/convivencia-casos/faltas', data);
    return response.data;
  } catch (error) {
    console.error('Error en postFaltas:', error);
    throw error;
  }
};

export const updateFaltas = async (faltaId: number, data: {
  nombre: string;
  descripcion: string;
  color: string;
}) => {
  try {
    const response = await api.put(`/convivencia-casos/faltas/${faltaId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error en updateFaltas:', error);
    throw error;
  }
};

export const deleteFaltas = async (faltaId: number) => {
  try {
    const response = await api.delete(`/convivencia-casos/faltas/${faltaId}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteFaltas:', error);
    throw error;
  }
};
