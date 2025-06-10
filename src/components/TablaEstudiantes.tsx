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
import { Search, Clock, Users, BookOpen, AlertCircle } from "lucide-react";
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
import TalleresInscritosButton from "./TalleresInscritosButton";

interface TablaEstudiantesProps {
  showAtrasosButtons?: boolean;
}

const TablaEstudiantes = ({
  showAtrasosButtons = true,
}: TablaEstudiantesProps) => {
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

  const handleNewAtraso = async (
    estudianteId: number,
    tipo: "llegada" | "jornada"
  ) => {
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
      const searchTermNormalized = normalizeString(
        searchTerm.toLowerCase().replace(/\s+/g, " ").trim()
      );
      const nombreNormalized = normalizeString(
        (estudiante.estudiante_nombre || estudiante.nombre || "").toLowerCase()
      );
      const rutNormalized = normalizeString(
        (estudiante.rut || "").toLowerCase()
      );
      const emailNormalized = normalizeString(
        (estudiante.email || "").toLowerCase()
      );

      // Si el término de búsqueda contiene espacios, buscar coincidencias exactas de palabras
      if (searchTermNormalized.includes(" ")) {
        const searchWords = searchTermNormalized.split(" ");
        return searchWords.every(
          (word) =>
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

      const searchTermNormalized = normalizeString(
        searchTerm.toLowerCase().replace(/\s+/g, " ").trim()
      );
      const nombreANormalized = normalizeString(
        (a.estudiante_nombre || a.nombre || "").toLowerCase()
      );
      const nombreBNormalized = normalizeString(
        (b.estudiante_nombre || b.nombre || "").toLowerCase()
      );

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
        <div className="flex flex-col gap-2">
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Estudiantes
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Gestiona los estudiantes del establecimiento
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">
                Buscar estudiante
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nombre, RUT o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">
                Filtrar por curso
              </label>
              <Select
                value={cursoSeleccionado}
                onValueChange={setCursoSeleccionado}
              >
                <SelectTrigger className="w-full h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Seleccionar curso" />
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
            </div>

            <div className="flex items-end">
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total estudiantes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredEstudiantes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudiantes activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredEstudiantes.filter((e) => e.activo).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudiantes inactivos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredEstudiantes.filter((e) => !e.activo).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lista de Estudiantes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredEstudiantes.length} estudiantes encontrados
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Estudiante</TableHead>
                
                
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Curso</TableHead>
                {showAtrasosButtons && (
                  <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                    Acciones
                  </TableHead>
                )}
                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                  Talleres
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstudiantes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showAtrasosButtons ? 5 : 4}
                    className="text-center py-10"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        No hay estudiantes disponibles
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
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
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                              estudiante.activo
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
                          
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {estudiante.estudiante_nombre || estudiante.nombre}
                          </span>
                        </div>
                        {estudiante.email && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {estudiante.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
  
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10">
                        {estudiante.curso_nombre || "Sin asignar"}
                      </span>
                    </TableCell>
                    {showAtrasosButtons && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNewAtraso(estudiante.id, "llegada")}
                            className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Registrar Atraso
                          </Button>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <TalleresInscritosButton estudianteId={estudiante.id} />
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
