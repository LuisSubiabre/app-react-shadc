import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const getCasosEstudiante = async (estudiante_id: number) => {
    try {
      console.log('🔍 Llamando a getCasosEstudiante con ID:', estudiante_id);
      
      // Probar diferentes endpoints
      const endpoints = [
        `/convivencia-casos/estudiantes/${estudiante_id}`,
        `/convivencia-casos/estudiante/${estudiante_id}`,
        `/convivencia-casos/${estudiante_id}`,
        `/casos-convivencia/estudiantes/${estudiante_id}`,
        `/casos-convivencia/estudiante/${estudiante_id}`,
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔗 Probando endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          console.log(`✅ Respuesta exitosa del endpoint: ${endpoint}`);
          console.log('📊 response.data:', response.data);
          console.log('📊 Tipo de response.data:', typeof response.data);
          console.log('📊 Es array?', Array.isArray(response.data));
          
          // Manejar diferentes estructuras de respuesta
          if (Array.isArray(response.data)) {
            console.log('✅ La respuesta es un array directo, longitud:', response.data.length);
            return response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            console.log('✅ La respuesta está en response.data.data, longitud:', response.data.data.length);
            return response.data.data;
          } else if (response.data && Array.isArray(response.data.casos)) {
            console.log('✅ La respuesta está en response.data.casos, longitud:', response.data.casos.length);
            return response.data.casos;
          } else {
            console.log(`❌ Estructura de respuesta no reconocida para endpoint: ${endpoint}`);
            console.log('📊 Estructura completa:', JSON.stringify(response.data, null, 2));
            continue;
          }
        } catch (endpointError) {
          console.log(`❌ Error con endpoint: ${endpoint}`, endpointError);
          continue;
        }
      }
      
      console.log('❌ Ningún endpoint funcionó, devolviendo array vacío');
      return [];
    } catch (error) {
      console.error('❌ Error en getCasosEstudiante:', error);
      throw error;
    }
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
}) => {
  const response = await api.put(`/convivencia-casos/${caso_id}`, data);
  return response.data;
};

export const deleteCaso = async (caso_id: number) => {
    const response = await api.delete(`/convivencia-casos/${caso_id}`);
    return response.data || [];
  };
  