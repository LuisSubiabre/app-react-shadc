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

export const fetchAsignaturaCursos = async (
  asignatura_id: number,
  token: string
): Promise<AsignaturaCursoUsuario[]> => {
  // try {
  //   const response = await fetch(
  //     `${API_BASE_URL}/asignaturascursos/asignatura/${asignatura_id}`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );
  //   if (!response.ok) {
  //     throw new Error("Error al obtener los cursos de la asignatura");
  //   }
  //   return await response.json();
  // } catch (error) {
  //   console.error("Error fetching asignatura cursos:", error);
  //   return [];
  // }
};

export const guardarAsignaciones = async (
  asignatura_id: number,
  asignaciones: { curso_id: number; usuarios: number[] }[],
  token: string
): Promise<void> => {
  // const promises = asignaciones.flatMap((asignacion) =>
  //   asignacion.usuarios.map((usuario_id) =>
  //     fetch(`${API_BASE_URL}/asignaturascursos`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         asignatura_id,
  //         curso_id: asignacion.curso_id,
  //         usuario_id,
  //       }),
  //     }).then(async (response) => {
  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(errorData.error || "Error al guardar la asignación");
  //       }
  //     })
  //   )
  // );
  // await Promise.all(promises);
};

export const eliminarAsignacion = async (
  asignatura_id: number,
  curso_id: number,
  usuario_id: number,
  token: string
): Promise<void> => {
  // const response = await fetch(
  //   `${API_BASE_URL}/asignaturascursos/${asignatura_id}/${curso_id}`,
  //   {
  //     method: "DELETE",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ profesor_id: usuario_id }),
  //   }
  // );
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.error || "Error al eliminar la asignación");
  // }
};

export const asignarCurso = async (
  asignatura_id: number,
  curso_id: number,
  usuario_id: number,
  token: string
): Promise<void> => {
  // const response = await fetch(`${API_BASE_URL}/asignaturascursos`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${token}`,
  //   },
  //   body: JSON.stringify({
  //     asignatura_id,
  //     curso_id,
  //     profesor_id: usuario_id,
  //   }),
  // });
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.error || "Error al asignar el curso");
  // }
};

export const actualizarAsignacion = async (
  asignatura_id: number,
  curso_id: number,
  usuario_id: number,
  token: string
): Promise<void> => {
  // const response = await fetch(
  //   `${API_BASE_URL}/asignaturascursos/${asignatura_id}/${curso_id}`,
  //   {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({
  //       profesor_id: usuario_id,
  //     }),
  //   }
  // );
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.error || "Error al actualizar la asignación");
  // }
};

export const obtenerAsignacionesPorAsignatura = async (
  asignatura_id: number,
  token: string
): Promise<ApiResponse<AsignaturaCursoResponse>> => {
  // const response = await fetch(
  //   `${API_BASE_URL}/asignaturascursos/asignatura/${asignatura_id}`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   }
  // );
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.error || "Error al obtener las asignaciones");
  // }
  // return response.json();
};
