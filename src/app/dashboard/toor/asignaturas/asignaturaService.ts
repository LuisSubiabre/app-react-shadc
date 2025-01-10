import { API_BASE_URL } from "@/config/config.ts";
import { Asignatura } from "./types";

export const saveNew = async (newAsignatura: Partial<Asignatura>, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/asignaturas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAsignatura),
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
  currentAsignatura: Asignatura
): Promise<void> => {
  if (!currentAsignatura.nombre) {
    throw new Error("El nombre es obligatorio");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/asignaturas/${currentAsignatura.asignatura_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(currentAsignatura),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar la asignatura");
    }
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
};

export const deleteAsignatura = async (
  token: string,
  asignaturaToDelete: { asignatura_id: number }
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/asignaturas/${asignaturaToDelete.asignatura_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar la asignatura");
    }
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
};
