import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AclesInscritos = () => {
  const [api, setApi] = useState<{
    taller_nombre: string;
    taller_horario: string;
    taller_cantidad_inscritos: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [estudiantes, setEstudiantes] = useState<
    {
      id: number;
      nombre: string;
      curso_nombre: string;
    }[]
  >([]); // Inicializa como un array vacío

  const [estudiantesInscritos, setEstudiantesInscritos] = useState<
    {
      estudiante_id: number;
      estudiante_nombre: string;
      curso_nombre: string;
    }[]
  >([]);

  const [totalInscritos, setTotalInscritos] = useState(0);

  const [query, setQuery] = useState("");
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchTalleres(Number(id));
      fetchEstudiantesInscritos(Number(id)); // Obtiene los estudiantes inscritos
    }
    fetchEstudiantes(); // Obtiene todos los estudiantes disponibles
  }, [id]); // Añade `id` como dependenciaAñade `id` como dependencia para que se vuelva a ejecutar si cambia

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  /* fetchs */
  const fetchTalleres = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3100/talleres/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Verifica si la respuesta tiene estado HTTP de error
      if (!response.ok) {
        // Intenta procesar el error si tiene un cuerpo JSON
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setErrorMessage("");
      setApi(data);
      setTotalInscritos(data.taller_cantidad_inscritos);
    } catch (error) {
      setErrorMessage("Error en consultar API: " + error);
    }
  };
  const fetchEstudiantes = async () => {
    try {
      const res = await fetch("http://localhost:3100/estudiantes");
      const data = await res.json();
      setEstudiantes(data.data); // Asegúrate de que data.data sea un array
    } catch (error) {
      console.error("Error fetching estudiantes:", error);
      setEstudiantes([]); // En caso de error, establece un array vacío
    }
  };

  const fetchEstudiantesInscritos = async (id_taller: number) => {
    try {
      const res = await fetch(
        `http://localhost:3100/talleres/estudiantes/${id_taller}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setEstudiantesInscritos(data.estudiantes); // Almacena los estudiantes inscritos
    } catch (error) {
      console.error("Error fetching estudiantes inscritos:", error);
      setEstudiantesInscritos([]); // En caso de error, establece un array vacío
    }
  };

  /* fetchs */

  // Función para normalizar textos y eliminar tildes
  const normalizarTexto = (texto: string) => {
    return texto
      .normalize("NFD") // Descompone los caracteres acentuados en sus partes
      .replace(/[\u0300-\u036f]/g, "") // Elimina los caracteres de acento
      .toLowerCase(); // Convierte todo a minúsculas
  };

  // Función para inscribir un estudiante en un taller
  const inscribirEstudiante = async (
    taller_id: number,
    estudiante_id: number
  ) => {
    try {
      const response = await fetch(
        "http://localhost:3100/talleres/inscripcion/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ taller_id, estudiante_id }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualiza la lista de estudiantes inscritos
      fetchEstudiantesInscritos(taller_id);
      setTotalInscritos(totalInscritos + 1);
    } catch (error) {
      console.error("Error inscribiendo estudiante:", error);
    }
  };

  // Función para desinscribir un estudiante de un taller
  const desinscribirEstudiante = async (
    taller_id: number,
    estudiante_id: number
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3100/talleres/inscripcion/${taller_id}/${estudiante_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualiza la lista de estudiantes inscritos
      fetchEstudiantesInscritos(taller_id);
      setTotalInscritos(totalInscritos - 1);
    } catch (error) {
      console.error("Error desinscribiendo estudiante:", error);
    }
  };

  const estudiantesDisponibles = estudiantes.filter((estudiante) => {
    if (estudiantesInscritos.length === 0 || !estudiantesInscritos) {
      return true;
    }
    return !estudiantesInscritos.some(
      (inscrito) => inscrito.estudiante_id === estudiante.id
    );
  });
  const estudiantesDisponiblesFiltrados = estudiantesDisponibles.filter(
    (estudiante) =>
      normalizarTexto(estudiante.nombre).includes(normalizarTexto(query))
  );
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <Toaster />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Talleres ACLE</h1>

        {errorMessage ? (
          <h4>{errorMessage}</h4>
        ) : (
          <div className="flex flex-col gap-2 p-4 bg-white rounded-md shadow-md">
            {api && (
              <>
                <h2 className="text-xl font-bold">{api.taller_nombre}</h2>
                <div className="text-sm text-gray-500">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span>Horario:</span> {api.taller_horario}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span>Total inscritos:</span>{" "}
                      {totalInscritos || "No hay inscritos"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 p-4 bg-white rounded-md shadow-md">
          <Input
            type="text"
            placeholder="Buscar estudiante"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="max-h-96 overflow-y-auto p-4 border border-gray-300 rounded-lg">
            <Table>
              <TableCaption>Listado de estudiantes</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudiantesDisponiblesFiltrados.map((estudiante) => (
                  <TableRow key={estudiante.id}>
                    <TableCell className="font-medium">
                      {estudiante.nombre}
                      <p>
                        <small>{estudiante.curso_nombre}</small>
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() =>
                          inscribirEstudiante(Number(id), estudiante.id)
                        }
                      >
                        Inscribir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <h2>Inscritos</h2>
        <Table>
          <TableCaption>
            Estudiantes inscritos en <strong>{api?.taller_nombre}</strong>
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estudiantesInscritos.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No hay estudiantes inscritos.
                </TableCell>
              </TableRow>
            )}
            {estudiantesInscritos.length > 0 &&
              estudiantesInscritos.map((estudiante) => (
                <TableRow key={estudiante.estudiante_id}>
                  <TableCell className="font-medium">
                    {estudiante.estudiante_nombre}
                    <p>
                      <small>{estudiante.curso_nombre}</small>
                    </p>
                  </TableCell>
                  <TableCell>{estudiante.curso_nombre}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() =>
                        desinscribirEstudiante(
                          Number(id),
                          estudiante.estudiante_id
                        )
                      }
                    >
                      Desinscribir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AclesInscritos;
