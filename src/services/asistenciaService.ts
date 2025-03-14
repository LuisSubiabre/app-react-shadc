import { API_BASE_URL } from "@/config/config";
import { AsistenciaEstudiante } from "@/types/asistencia";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types";

export const getAsistencia = async (
  estudianteId: number,
  mes: number,
  anio: number,
  token: string
): Promise<AsistenciaEstudiante | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/asistencias/${estudianteId}/${mes}/${anio}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    return null;
  }
};

export const saveAsistencia = async (
  estudianteId: number,
  mes: number,
  anio: number,
  diasAsistidos: number,
  totalDias: number,
  token: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/asistencias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estudiante_id: estudianteId,
        mes,
        anio,
        dias_asistidos: diasAsistidos,
        total_dias: totalDias,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error al guardar asistencia:", error);
    return false;
  }
};

export const getEstudiantesCurso = async (
  cursoId: number,
  token: string
): Promise<Estudiante[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cursos/estudiantes/${cursoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data)
      ? data.map((estudiante) => ({
          ...estudiante,
          id: estudiante.estudiante_id,
        }))
      : [];
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    return [];
  }
};
