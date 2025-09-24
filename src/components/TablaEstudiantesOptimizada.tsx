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
import { useState, useEffect, useMemo } from "react";
import { getEstudiantes } from "@/services/estudiantesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock, Users, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ModalCasosReadOnly } from "./ModalCasosReadOnly";
import { FileText } from "lucide-react";

interface TablaEstudiantesOptimizadaProps {
  showAtrasosButtons?: boolean;
}

const ITEMS_PER_PAGE = 20;

const TablaEstudiantesOptimizada = ({
  showAtrasosButtons = true,
}: TablaEstudiantesOptimizadaProps) => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCasosModalOpen, setIsCasosModalOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteType | null>(null);

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
  const cursos = useMemo(() => 
    Array.from(
      new Set(
        estudiantes
          .map((e) => e.curso_nombre)
          .filter(
            (curso): curso is string => curso !== undefined && curso !== null
          )
      )
    ).sort(),
    [estudiantes]
  );

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

      const printSuccess = await printAtraso(estudiante, horaActual, tipo);
      if (!printSuccess) {
        alert("Error al imprimir el ticket");
      }
    } catch (error) {
      alert("Error al registrar el atraso:" + error);
    }
  };

  const handleOpenCasosModal = (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsCasosModalOpen(true);
  };

  const handleCloseCasosModal = () => {
    setIsCasosModalOpen(false);
    setSelectedEstudiante(null);
  };

  const filteredEstudiantes = useMemo(() => {
    return estudiantes
      .filter((estudiante) => {
        // Filtro de curso
        if (
          cursoSeleccionado !== "todos" &&
          estudiante.curso_nombre !== cursoSeleccionado
        ) {
          return false;
        }

        // Filtro de búsqueda
        if (!searchTerm) return true;

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

        const posA = nombreANormalized.indexOf(searchTermNormalized);
        const posB = nombreBNormalized.indexOf(searchTermNormalized);

        if (posA !== posB) {
          return posA - posB;
        }

        return nombreANormalized.localeCompare(nombreBNormalized);
      });
  }, [estudiantes, searchTerm, cursoSeleccionado]);

  // Paginación
  const totalPages = Math.ceil(filteredEstudiantes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEstudiantes = filteredEstudiantes.slice(startIndex, endIndex);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, cursoSeleccionado]);

  const stats = useMemo(() => ({
    total: filteredEstudiantes.length,
    activos: filteredEstudiantes.filter((e) => e.activo).length,
    inactivos: filteredEstudiantes.filter((e) => !e.activo).length,
  }), [filteredEstudiantes]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estudiantes</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
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
          <CardTitle className="text-lg">Estudiantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[200px] text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
            value={cursoSeleccionado}
            onValueChange={setCursoSeleccionado}
          >
            <SelectTrigger className="w-48 h-9">
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
        </div>

        {/* Tabla optimizada */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Estudiante</TableHead>
                <TableHead className="w-[20%]">Curso</TableHead>
                {showAtrasosButtons && (
                  <TableHead className="w-[15%] text-center">Acciones</TableHead>
                )}
                <TableHead className="w-[15%] text-center">Talleres</TableHead>
                <TableHead className="w-[15%] text-center">Casos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEstudiantes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showAtrasosButtons ? 5 : 4}
                    className="text-center py-8"
                  >
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
                    key={estudiante.estudiante_id || estudiante.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          estudiante.activo ? "bg-green-500" : "bg-red-500"
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {estudiante.estudiante_nombre || estudiante.nombre}
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
                    
                    {showAtrasosButtons && (
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNewAtraso(estudiante.id, "llegada")}
                          className="h-7 px-3 text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Atraso
                        </Button>
                      </TableCell>
                    )}
                    
                    <TableCell className="text-center">
                      <TalleresInscritosButton estudianteId={estudiante.id} />
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCasosModal(estudiante)}
                        className="h-7 px-3 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Casos
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

      {/* Modal de Casos (Solo Lectura) */}
      <ModalCasosReadOnly
        isOpen={isCasosModalOpen}
        onClose={handleCloseCasosModal}
        estudiante={selectedEstudiante}
      />
    </Card>
  );
};

export default TablaEstudiantesOptimizada;
