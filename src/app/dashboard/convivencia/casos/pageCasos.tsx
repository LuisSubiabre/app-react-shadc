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
import { Search, List } from "lucide-react";
import { ModalCasos } from "@/components/convivencia/ModalCasos";
import { ModalTodosCasos } from "@/components/convivencia/ModalTodosCasos";

const PageCasos = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteType | null>(null);
  const [isTodosCasosModalOpen, setIsTodosCasosModalOpen] = useState(false);

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

  const handleOpenModal = (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEstudiante(null);
  };

  const handleOpenTodosCasosModal = () => {
    setIsTodosCasosModalOpen(true);
  };

  const handleCloseTodosCasosModal = () => {
    setIsTodosCasosModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Gestión de Casos
                </h1>
                <p className="text-muted-foreground text-lg">
                  Administra los casos de convivencia escolar
                </p>
              </div>
              <Button
                onClick={handleOpenTodosCasosModal}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <List className="h-4 w-4" />
                Ver Todos los Casos
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">
                  Filtrar por curso
                </label>
                <Select
                  value={selectedCurso}
                  onValueChange={setSelectedCurso}
                >
                  <SelectTrigger className="w-full h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">ID</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nombre</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Curso</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        <p className="text-muted-foreground font-medium">
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
                          {estudiante.estudiante_id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {estudiante.nombre}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {estudiante.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10">
                          {estudiante.curso_nombre}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(estudiante)}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                        >
                          Gestionar Casos
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
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
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Modal de Casos */}
      <ModalCasos
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estudiante={selectedEstudiante}
      />

      {/* Modal de Todos los Casos */}
      <ModalTodosCasos
        isOpen={isTodosCasosModalOpen}
        onClose={handleCloseTodosCasosModal}
      />
    </div>
  );
};

export default PageCasos;
