import { API_BASE_URL } from "@/config/config";

// Definición de la interfaz para los roles
import { Curso } from "./types"; // Importa la interfaz desde el archivo types.ts

export const saveNew = async (newCurso: Partial<Curso>, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cursos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newCurso),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al guardar el rol");
    }

    return await response.json(); // Devolver los datos del rol creado
  } catch (error: unknown) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
};

export const savaEdit = async (
  token: string,
  currentCurso: {
    id: string;
    nombre: string;
    descripcion?: string;
    indice: number;
    codigo_ensenanza: number;
    profesor_jefe_id: number;
  }
): Promise<void> => {
  if (!currentCurso.nombre) {
    throw new Error("El nombre es obligatorio");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/cursos/${currentCurso.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(currentCurso),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al guardar el rol");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Unknown error occurred.");
    }
  }
};

export const deleteRole = async (
  token: string,
  rolToDelete: { id: string }
): Promise<void> => {
  if (!rolToDelete.id) {
    throw new Error("ID del rol es obligatorio");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/cursos/${rolToDelete.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar el rol");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Error desconocido");
    }
  }
};
