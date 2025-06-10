"use client";

import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CursoApiResponseType, EstudianteType } from "@/types";
import { getCursos } from "@/services/cursosService";
import {
  estudiantesCurso,
  getEstudiantes,
} from "@/services/estudiantesService";

const PageCasos = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await getCursos();
        if (response) {
          setCursos(response.data);
        }
      } catch (error) {
        console.error("Error al obtener cursos:", error);
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      setIsLoading(true);
      try {
        if (selectedCurso === "all") {
          const response = await getEstudiantes();
          setEstudiantes(Array.isArray(response.data) ? response.data : []);
          setIsLoading(false);
          return;
        }

        const response = await estudiantesCurso(parseInt(selectedCurso));

        if (response) {
          setEstudiantes(response);
        } else {
          setEstudiantes([]);
        }
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        setEstudiantes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEstudiantes();
  }, [selectedCurso]);

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredEstudiantes = estudiantes
    .filter((estudiante) => {
      if (!searchTerm) return true;

      const searchTermNormalized = normalizeString(
        searchTerm.toLowerCase().replace(/\s+/g, " ").trim()
      );
      const nombreNormalized = normalizeString(estudiante.nombre.toLowerCase());
      const rutNormalized = normalizeString(
        estudiante.rut?.toLowerCase() || ""
      );
      const emailNormalized = normalizeString(
        estudiante.email?.toLowerCase() || ""
      );
      const cursoNormalized = normalizeString(
        estudiante.curso_nombre?.toLowerCase() || ""
      );

      if (searchTermNormalized.includes(" ")) {
        const searchWords = searchTermNormalized.split(" ");
        return searchWords.every(
          (word) =>
            nombreNormalized.includes(word) ||
            rutNormalized.includes(word) ||
            emailNormalized.includes(word) ||
            cursoNormalized.includes(word)
        );
      }

      return (
        nombreNormalized.includes(searchTermNormalized) ||
        rutNormalized.includes(searchTermNormalized) ||
        emailNormalized.includes(searchTermNormalized) ||
        cursoNormalized.includes(searchTermNormalized)
      );
    })
    .sort((a, b) => {
      if (!searchTerm) return 0;

      const searchTermNormalized = normalizeString(
        searchTerm.toLowerCase().replace(/\s+/g, " ").trim()
      );
      const nombreANormalized = normalizeString(a.nombre.toLowerCase());
      const nombreBNormalized = normalizeString(b.nombre.toLowerCase());

      const posA = nombreANormalized.indexOf(searchTermNormalized);
      const posB = nombreBNormalized.indexOf(searchTermNormalized);

      if (posA !== posB) {
        return posA - posB;
      }

      return nombreANormalized.localeCompare(nombreBNormalized);
    });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestión de Casos
            </h1>
            <p className="text-muted-foreground mt-2">
              Administra los casos de convivencia escolar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Filtrar por curso
                  </label>
                  <Select
                    value={selectedCurso}
                    onValueChange={setSelectedCurso}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los cursos</SelectItem>
                      {cursos?.map((curso) => (
                        <SelectItem key={curso.id} value={curso.id.toString()}>
                          {curso.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Buscar estudiante
                  </label>
                  <Input
                    placeholder="Nombre, RUT o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                      <span className="font-medium">Total: </span>
                      <span>{filteredEstudiantes.length}</span>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-green-700 dark:text-green-300">
                      <span className="font-medium">Activos: </span>
                      <span>
                        {filteredEstudiantes.filter((e) => e.activo).length}
                      </span>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full text-red-700 dark:text-red-300">
                      <span className="font-medium">Inactivos: </span>
                      <span>
                        {filteredEstudiantes.filter((e) => !e.activo).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    <TableHead className="font-medium">ID</TableHead>
                    <TableHead className="font-medium">Nombre</TableHead>
                    <TableHead className="font-medium">Curso</TableHead>
                    <TableHead className="text-right font-medium">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                          <p className="text-muted-foreground">
                            Cargando estudiantes...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : estudiantes.length > 0 ? (
                    filteredEstudiantes.map((estudiante) => (
                      <TableRow
                        key={estudiante.estudiante_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <TableCell className="font-mono">
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
                            {estudiante.estudiante_id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {estudiante.nombre}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {estudiante.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300">
                            {estudiante.curso_nombre}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          >
                            Gestionar Casos
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
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
                            No hay estudiantes disponibles.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Intenta cambiar los filtros de búsqueda
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageCasos;
