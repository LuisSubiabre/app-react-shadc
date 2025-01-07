import { API_BASE_URL } from "@/config/config.ts";

// Definición de la interfaz para los roles
import { Estudiante } from "./types"; // Importa la interfaz desde el archivo types.ts

export const saveNew = async (estudiante: Estudiante, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/estudiantes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(estudiante),
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
  currentEstudiante: { id: string; nombre: string; descripcion?: string }
): Promise<void> => {
  if (!currentEstudiante.nombre) {
    throw new Error("El nombre es obligatorio");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/estudiantes/${currentEstudiante.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentEstudiante),
      }
    );

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

export const deleteEstudiante = async (
  token: string,
  estudianteToDelete: { id: string }
): Promise<void> => {
  if (!estudianteToDelete.id) {
    throw new Error("ID del rol es obligatorio");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/estudiantes/${estudianteToDelete.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar el estudiante");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error("-" + err.message);
    } else {
      throw new Error("Error desconocido");
    }
  }
};

export const updatePassword = async (
  token: string,
  userId: number,
  newPassword: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/estudiantes/password/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clave: newPassword }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al cambiar la contraseña.");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Error desconocido.");
    }
  }
};
