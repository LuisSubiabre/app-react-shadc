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
import { CursoApiResponseType, EstudianteType, Atraso } from "@/types";
import { ModalAtrasos } from "@/components/atrasos/ModalAtrasos";
import { Clock } from "lucide-react";
import { getCursos } from "@/services/cursosService";
import {
  estudiantesCurso,
  getEstudiantes,
} from "@/services/estudiantesService";
import { getAtrasosByEstudiante } from "@/services/atrasosService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

const PageControlAtrasos = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEstudiante, setSelectedEstudiante] =
    useState<EstudianteType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [atrasos, setAtrasos] = useState<Atraso[]>([]);

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

  const handleOpenModal = async (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsModalOpen(true);
    try {
      const response = await getAtrasosByEstudiante(
        estudiante.estudiante_id || estudiante.id
      );
      setAtrasos(response);
    } catch (error) {
      console.error("Error al cargar atrasos:", error);
      setAtrasos([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEstudiante(null);
  };

  const handleAtrasosChange = async () => {
    if (selectedEstudiante) {
      try {
        const response = await getAtrasosByEstudiante(selectedEstudiante.id);
        setAtrasos(response);
      } catch (error) {
        console.error("Error al recargar atrasos:", error);
      }
    }
  };

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredEstudiantes = estudiantes
    .filter((estudiante) => {
      if (!searchTerm) return true;

      // Normalizar el término de búsqueda eliminando espacios múltiples
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

      // Si el término de búsqueda contiene espacios, buscar coincidencias exactas de palabras
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

  const exportarPDFAtrasos = (
    estudiante: EstudianteType,
    atrasos: Atraso[]
  ) => {
    if (!estudiante || !atrasos || atrasos.length === 0) return;

    const doc = new jsPDF() as JsPDFWithAutoTable;

    // Título
    doc.setFontSize(16);
    doc.text("Historial de Atrasos", 14, 15);
    doc.setFontSize(12);
    doc.text(`Estudiante: ${estudiante.nombre}`, 14, 25);
    doc.text(`RUT: ${estudiante.rut || "No disponible"}`, 14, 32);
    doc.text(`Curso: ${estudiante.curso_nombre || "No disponible"}`, 14, 39);
    doc.text(`Total Atrasos: ${atrasos.length}`, 14, 46);

    // Tabla
    const tableData = atrasos.map((atraso) => [
      new Date(atraso.fecha).toLocaleDateString(),
      atraso.hora,
      atraso.tipo === "llegada" ? "Llegada" : "Jornada",
      atraso.observaciones || "Sin observaciones",
    ]);

    autoTable(doc, {
      startY: 51,
      head: [["Fecha", "Hora", "Tipo", "Observaciones"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 90 },
      },
    });

    // Guardar el PDF
    doc.save(
      `atrasos-${estudiante.nombre.toLowerCase().replace(/\s+/g, "-")}.pdf`
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          {/* Título y descripción */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Control de Atrasos
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los atrasos de los estudiantes por curso
            </p>
          </div>

          {/* Filtros en card */}
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

                {/* Estadísticas rápidas */}
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

            {/* Tabla en card */}
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
                            onClick={() => handleOpenModal(estudiante)}
                            className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Gestionar Atrasos
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

      <ModalAtrasos
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estudiante={selectedEstudiante}
        atrasos={atrasos}
        onAtrasosChange={handleAtrasosChange}
        onExportPDF={() =>
          selectedEstudiante && exportarPDFAtrasos(selectedEstudiante, atrasos)
        }
      />
    </div>
  );
};

export default PageControlAtrasos;
