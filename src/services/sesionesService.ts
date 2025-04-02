import { API_BASE_URL } from "@/config/config";

export interface Sesion {
  sesion_id: number;
  taller_id: number;
  fecha: string;
  estado: string;
}

export const guardarSesion = async (
  taller_id: number,
  fecha: Date,
  token: string
): Promise<Sesion> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sesiones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        taller_id,
        fecha: fecha.toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al guardar la sesión");
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
}; 