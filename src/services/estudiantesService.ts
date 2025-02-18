import api from "../config/api.ts";

// ** Rutas Públicas **

// ** Rutas Privadas (requieren autenticación) **
export const estudiantesCurso = async (cursoId: number) => {
  return api
    .get(`/cursos/estudiantes/${cursoId}`)
    .then((response) => response.data);
};

//   const estudiantesCurso = async (curso_id: number) => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/cursos/estudiantes/${curso_id}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const responseData = await response.json();
//       const mappedData = Array.isArray(responseData)
//         ? responseData.map((estudiante) => ({
//             ...estudiante,
//             id: estudiante.estudiante_id,
//           }))
//         : [];
//       setDataEstudiantes(mappedData);
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       setDataEstudiantes([]);
//     }
//   };
