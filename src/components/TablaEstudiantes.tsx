import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { EstudianteType } from "@/types";
import { useState, useEffect } from "react";
import { getEstudiantes } from "@/services/estudiantesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAtraso } from "@/services/atrasosService";
import { printAtraso } from "@/services/printService";

const TablaEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("todos");

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const response = await getEstudiantes();
        if (response && Array.isArray(response.data)) {
          setEstudiantes(response.data);
        } else {
          setError("No se pudieron cargar los estudiantes");
          setEstudiantes([]);
        }
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        setError("Error al cargar los estudiantes");
        setEstudiantes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEstudiantes();
  }, []);

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Obtener lista única de cursos
  const cursos = Array.from(
    new Set(
      estudiantes
        .map((e) => e.curso_nombre)
        .filter(
          (curso): curso is string => curso !== undefined && curso !== null
        )
    )
  ).sort();

  const handleNewAtraso = async (estudianteId: number, tipo: "llegada" | "jornada") => {
    const estudiante = estudiantes.find((e) => e.id === estudianteId);
    if (!estudiante) return;

    const horaActual = new Date().toLocaleString("es-CL", {
      timeZone: "America/Punta_Arenas",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    try {
      // Crear el atraso
      await createAtraso({
        estudiante_id: estudianteId,
        fecha: new Date().toISOString(),
        hora: horaActual,
        hora_registro: horaActual,
        tipo: tipo,
        justificado: false,
        observaciones: "",
        fecha_registro: new Date().toISOString(),
      });

      // Imprimir el ticket
      const printSuccess = await printAtraso(estudiante, horaActual, tipo);

      if (!printSuccess) {
        alert("Error al imprimir el ticket");
      }
    } catch (error) {
      alert("Error al registrar el atraso:" + error);
    }
  };

  const filteredEstudiantes = estudiantes
    .filter((estudiante) => {
      // Primero aplicar filtro de curso
      if (
        cursoSeleccionado !== "todos" &&
        estudiante.curso_nombre !== cursoSeleccionado
      ) {
        return false;
      }

      // Luego aplicar filtro de búsqueda
      if (!searchTerm) return true;

      // Normalizar el término de búsqueda eliminando espacios múltiples
      const searchTermNormalized = normalizeString(searchTerm.toLowerCase().replace(/\s+/g, ' ').trim());
      const nombreNormalized = normalizeString(
        (estudiante.estudiante_nombre || estudiante.nombre || "").toLowerCase()
      );
      const rutNormalized = normalizeString((estudiante.rut || "").toLowerCase());
      const emailNormalized = normalizeString(
        (estudiante.email || "").toLowerCase()
      );

      // Si el término de búsqueda contiene espacios, buscar coincidencias exactas de palabras
      if (searchTermNormalized.includes(' ')) {
        const searchWords = searchTermNormalized.split(' ');
        return searchWords.every(word => 
          nombreNormalized.includes(word) ||
          rutNormalized.includes(word) ||
          emailNormalized.includes(word)
        );
      }

      return (
        nombreNormalized.includes(searchTermNormalized) ||
        rutNormalized.includes(searchTermNormalized) ||
        emailNormalized.includes(searchTermNormalized)
      );
    })
    .sort((a, b) => {
      if (!searchTerm) return 0;
      
      const searchTermNormalized = normalizeString(searchTerm.toLowerCase().replace(/\s+/g, ' ').trim());
      const nombreANormalized = normalizeString((a.estudiante_nombre || a.nombre || "").toLowerCase());
      const nombreBNormalized = normalizeString((b.estudiante_nombre || b.nombre || "").toLowerCase());
      
      // Obtener la posición del término en cada nombre
      const posA = nombreANormalized.indexOf(searchTermNormalized);
      const posB = nombreBNormalized.indexOf(searchTermNormalized);
      
      // Si el término está en diferentes posiciones, ordenar por posición
      if (posA !== posB) {
        return posA - posB;
      }
      
      // Si el término está en la misma posición, ordenar alfabéticamente
      return nombreANormalized.localeCompare(nombreBNormalized);
    });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Estudiantes</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            <span>Cargando estudiantes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[300px] text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Estudiantes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={cursoSeleccionado}
            onValueChange={setCursoSeleccionado}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los cursos</SelectItem>
              {cursos.map((curso) => (
                <SelectItem key={curso} value={curso}>
                  {curso}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-3 text-sm min-w-[300px]">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              <span className="font-medium">Total: </span>
              <span>{filteredEstudiantes.length}</span>
            </div>
            <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-green-700 dark:text-green-300">
              <span className="font-medium">Activos: </span>
              <span>{filteredEstudiantes.filter((e) => e.activo).length}</span>
            </div>
            <div className="bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full text-red-700 dark:text-red-300">
              <span className="font-medium">Inactivos: </span>
              <span>{filteredEstudiantes.filter((e) => !e.activo).length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableHead className="font-medium">Estudiante</TableHead>
                <TableHead className="font-medium">Email</TableHead>
                <TableHead className="font-medium">Curso</TableHead>
                <TableHead className="text-right font-medium">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstudiantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8 text-muted-foreground"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </div>
                      <p className="text-muted-foreground">
                        No se encontraron estudiantes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Intenta cambiar los filtros de búsqueda
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEstudiantes.map((estudiante) => (
                  <TableRow
                    key={estudiante.estudiante_id || estudiante.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className={`inline-flex items-center gap-2 ${
                            estudiante.activo
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {estudiante.activo ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <span className="font-medium">
                            {estudiante.estudiante_nombre || estudiante.nombre}
                          </span>
                        </span>
                        {estudiante.rut && (
                          <span className="text-sm text-muted-foreground">
                            {estudiante.rut}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-muted-foreground break-all">
                        {estudiante.email}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300">
                        {estudiante.curso_nombre || "Sin asignar"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNewAtraso(estudiante.id, "llegada")}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Atraso Llegada
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNewAtraso(estudiante.id, "jornada")}
                          className="hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-300"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Atraso Jornada
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TablaEstudiantes;
