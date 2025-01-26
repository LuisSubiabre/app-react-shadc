import { API_BASE_URL } from "@/config/config.ts";
import { Taller } from "./typeTaller";

export const saveNew = async (newTaller: Partial<Taller>, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/talleres`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTaller),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al guardar la asignatura");
    }

    return await response.json();
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
};

export const saveEdit = async (
  token: string,
  currentTaller: Taller
): Promise<void> => {
  if (!currentTaller.taller_nombre) {
    throw new Error("El nombre es obligatorio");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/talleres/${currentTaller.taller_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentTaller),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar taller");
    }
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
};

export const deleteTaller = async (
  token: string,
  tallerToDelete: { taller_id: number }
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/talleres/${tallerToDelete.taller_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar taller");
    }
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
};

export const eliminarAsignacion = async (
  taller_id: number,
  curso_id: number,
  token: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/talleres-curso/${taller_id}/${curso_id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ taller_id: curso_id }),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al eliminar la asignación");
  }
};

export const asignarCurso = async (
  taller_id: number,
  curso_id: number,

  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/talleres-curso`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      taller_id,
      curso_id,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al asignar el curso");
  }
};

export const obtenerAsignaciones = async (
  taller_id: number,
  token: string
): Promise<{ data: Taller[] }> => {
  const response = await fetch(
    `${API_BASE_URL}/talleres-curso/listacursos/${taller_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al obtener las asignaciones");
  }

  return response.json();
};
