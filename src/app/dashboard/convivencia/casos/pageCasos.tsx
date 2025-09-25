"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CursoApiResponseType, EstudianteType } from "@/types";
import { getCursos } from "@/services/cursosService";
import {
  estudiantesCurso,
  getEstudiantes,
} from "@/services/estudiantesService";
import { Search, List, Users, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalCasosCompleto } from "@/components/ModalCasosCompleto";
import { ModalTodosCasos } from "@/components/convivencia/ModalTodosCasos";

const ITEMS_PER_PAGE = 20;

const PageCasos = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteType | null>(null);
  const [isTodosCasosModalOpen, setIsTodosCasosModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredEstudiantes = useMemo(() => {
    return estudiantes
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
  }, [estudiantes, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredEstudiantes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEstudiantes = filteredEstudiantes.slice(startIndex, endIndex);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCurso]);

  const stats = useMemo(() => ({
    total: filteredEstudiantes.length,
    activos: filteredEstudiantes.filter((e) => e.activo).length,
    inactivos: filteredEstudiantes.filter((e) => !e.activo).length,
  }), [filteredEstudiantes]);

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

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Estudiantes</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {stats.total} estudiantes registrados
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {stats.activos} activos
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {stats.inactivos} inactivos
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Filtros compactos */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nombre, RUT o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <Select
                  value={selectedCurso}
                  onValueChange={setSelectedCurso}
                >
                  <SelectTrigger className="w-48 h-9">
                    <SelectValue placeholder="Filtrar por curso" />
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

              {/* Tabla optimizada */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Estudiante</TableHead>
                      <TableHead className="w-[20%]">Curso</TableHead>
                      <TableHead className="w-[15%] text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                            <span className="text-sm text-muted-foreground">
                              Cargando estudiantes...
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedEstudiantes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-muted-foreground">
                              No se encontraron estudiantes
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEstudiantes.map((estudiante) => (
                        <TableRow
                          key={estudiante.estudiante_id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                estudiante.activo ? "bg-green-500" : "bg-red-500"
                              }`} />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">
                                  {estudiante.nombre}
                                </div>
                                {estudiante.email && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {estudiante.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {estudiante.curso_nombre || "Sin asignar"}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(estudiante)}
                              className="h-7 px-3 text-xs"
                            >
                              Gestionar Casos
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredEstudiantes.length)} de {filteredEstudiantes.length} estudiantes
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="h-8 w-8 p-0 text-xs"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Casos */}
      <ModalCasosCompleto
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
