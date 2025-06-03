import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

/* refactory */
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts"; // Asegúrate de importar el hook que creaste
/* refactory */

import { AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";

import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CursoApiResponseType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPromedioPorCurso,
  getPromedioPorAsignatura,
} from "@/services/infoService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface PromedioData {
  curso: string;
  asignatura: string;
  cantidad_estudiantes: string;
  promedio_general: string;
  concepto?: boolean;
}

interface PromedioEstudianteData {
  curso: string;
  estudiante_nombre: string;
  estudiante_rut: string;
  asignatura: string;
  indice: number;
  promedio_asignatura: string;
  promedio_general_estudiante: string;
}

interface PromedioEstudianteAgrupado {
  curso: string;
  estudiante_nombre: string;
  estudiante_rut: string;
  promedio_general_estudiante: string;
  asignaturas: {
    [key: string]: string;
  };
}

type SortDirection = "asc" | "desc";
type SortField = "estudiante" | "promedio_general" | string;

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

const AcademicoCursoAsignaturas: React.FC = () => {
  const { error, loading, funcionarioCursos } = useCursosFuncionarios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEstudiantesOpen, setIsModalEstudiantesOpen] = useState(false);
  const [promediosData, setPromediosData] = useState<PromedioData[]>([]);
  const [promediosEstudiantesData, setPromediosEstudiantesData] = useState<
    PromedioEstudianteAgrupado[]
  >([]);
  const [loadingPromedios, setLoadingPromedios] = useState(false);
  const [loadingPromediosEstudiantes, setLoadingPromediosEstudiantes] =
    useState(false);
  const [selectedCurso, setSelectedCurso] =
    useState<CursoApiResponseType | null>(null);
  const [sortField, setSortField] = useState<SortField>("estudiante");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    if (funcionarioCursos) {
      console.log("Cursos del funcionario cargados:", funcionarioCursos);
    }
  }, [funcionarioCursos]);

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }

  const convertirPromedioALetra = (promedio: string): string => {
    const numPromedio = parseFloat(promedio);
    if (isNaN(numPromedio)) return promedio;

    if (numPromedio >= 70) return "MB";
    if (numPromedio >= 50) return "B";
    if (numPromedio >= 40) return "S";
    if (numPromedio >= 30) return "I";
    return promedio;
  };

  const handleOpenModal = async (curso: CursoApiResponseType) => {
    setSelectedCurso(curso);
    setIsModalOpen(true);
    setLoadingPromedios(true);
    try {
      const response = await getPromedioPorCurso(curso.id);
      const data = response.data as PromedioData[];

      // Convertir promedios a letras si tienen concepto
      const dataConvertida = data.map((item) => ({
        ...item,
        promedio_general: item.concepto
          ? convertirPromedioALetra(item.promedio_general)
          : item.promedio_general,
      }));

      setPromediosData(dataConvertida);
    } catch (error) {
      console.error("Error al cargar los promedios:", error);
    } finally {
      setLoadingPromedios(false);
    }
  };

  const handleOpenModalEstudiantes = async (curso: CursoApiResponseType) => {
    setSelectedCurso(curso);
    setIsModalEstudiantesOpen(true);
    setLoadingPromediosEstudiantes(true);
    try {
      const response = await getPromedioPorAsignatura(curso.id);
      const data = response.data as PromedioEstudianteData[];

      // Obtener todas las asignaturas únicas
      const todasLasAsignaturas = Array.from(
        new Set(data.map((item) => item.asignatura))
      );

      // Agrupar datos por estudiante
      const estudiantesAgrupados = data.reduce(
        (acc: { [key: string]: PromedioEstudianteAgrupado }, curr) => {
          if (!acc[curr.estudiante_rut]) {
            acc[curr.estudiante_rut] = {
              curso: curr.curso,
              estudiante_nombre: curr.estudiante_nombre,
              estudiante_rut: curr.estudiante_rut,
              promedio_general_estudiante: curr.promedio_general_estudiante,
              asignaturas: {},
            };
            // Inicializar todas las asignaturas como vacías
            todasLasAsignaturas.forEach((asignatura) => {
              acc[curr.estudiante_rut].asignaturas[asignatura] = "";
            });
          }
          acc[curr.estudiante_rut].asignaturas[curr.asignatura] =
            curr.promedio_asignatura;
          return acc;
        },
        {}
      );

      setPromediosEstudiantesData(Object.values(estudiantesAgrupados));
    } catch (error) {
      console.error("Error al cargar los promedios de estudiantes:", error);
    } finally {
      setLoadingPromediosEstudiantes(false);
    }
  };

  const handleExportExcel = () => {
    if (!promediosData.length || !selectedCurso) return;

    const excelData = promediosData.map((promedio) => ({
      "Nombre del Curso": promedio.curso,
      Asignatura: promedio.asignatura,
      "Cantidad de Estudiantes": promedio.cantidad_estudiantes,
      "Promedio General": promedio.promedio_general,
    }));

    // Agregar fila de promedio general
    const promedioGeneral = {
      "Nombre del Curso": selectedCurso.nombre,
      Asignatura: "Promedio General",
      "Cantidad de Estudiantes": "",
      "Promedio General": (
        promediosData
          .filter((promedio) => !promedio.concepto)
          .reduce((acc, curr) => acc + parseFloat(curr.promedio_general), 0) /
        promediosData.filter((promedio) => !promedio.concepto).length
      ).toFixed(1),
    };
    excelData.push(promedioGeneral);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const colWidths = [
      { wch: 30 }, // Nombre del Curso
      { wch: 40 }, // Asignatura
      { wch: 20 }, // Cantidad de Estudiantes
      { wch: 20 }, // Promedio General
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Promedios");
    XLSX.writeFile(wb, `Promedios_${selectedCurso.nombre}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!promediosData.length || !selectedCurso) return;

    const doc = new jsPDF() as JsPDFWithAutoTable;

    // Título
    doc.setFontSize(16);
    doc.text("Informe de Promedios", 14, 15);
    doc.setFontSize(12);
    doc.text(`Curso: ${selectedCurso.nombre}`, 14, 25);
    doc.text(`Jefatura: ${selectedCurso.jefatura}`, 14, 32);
    doc.text(`Fecha: ${format(new Date(), "dd-MM-yyyy")}`, 14, 39);

    // Línea horizontal
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 45, 196, 45);

    // Tabla de promedios
    const tableData = promediosData.map((promedio) => [
      promedio.asignatura,
      promedio.cantidad_estudiantes,
      promedio.promedio_general,
    ]);

    // Agregar fila de promedio general
    const promedioGeneral = [
      "Promedio General",
      "",
      (
        promediosData
          .filter((promedio) => !promedio.concepto)
          .reduce((acc, curr) => acc + parseFloat(curr.promedio_general), 0) /
        promediosData.filter((promedio) => !promedio.concepto).length
      ).toFixed(1),
    ];
    tableData.push(promedioGeneral);

    autoTable(doc, {
      startY: 50,
      head: [["Asignatura", "Cantidad de Estudiantes", "Promedio General"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 45 },
        2: { cellWidth: 45 },
      },
      didDrawPage: function (data) {
        doc.setFontSize(10);
        doc.text(
          `Página ${data.pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save(
      `promedios-${selectedCurso.nombre.toLowerCase().replace(/\s+/g, "-")}.pdf`
    );
  };

  const handleExportExcelEstudiantes = () => {
    if (!promediosEstudiantesData.length || !selectedCurso) return;

    // Preparar los datos para Excel
    const excelData = promediosEstudiantesData.map((estudiante) => {
      const rowData: Record<string, string> = {
        Estudiante: estudiante.estudiante_nombre,
      };

      // Agregar cada asignatura como una columna
      Object.entries(estudiante.asignaturas).forEach(
        ([asignatura, promedio]) => {
          rowData[asignatura] = promedio || "-";
        }
      );

      // Agregar el promedio general al final
      rowData["Promedio General"] = estudiante.promedio_general_estudiante;

      return rowData;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar el ancho de las columnas
    const colWidths = [
      { wch: 40 }, // Estudiante
      ...Object.keys(promediosEstudiantesData[0].asignaturas).map(() => ({
        wch: 15,
      })), // Asignaturas
      { wch: 15 }, // Promedio General
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Promedios por Estudiante");
    XLSX.writeFile(wb, `Promedios_Estudiantes_${selectedCurso.nombre}.xlsx`);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedData = () => {
    return [...promediosEstudiantesData].sort((a, b) => {
      let comparison = 0;

      if (sortField === "estudiante") {
        comparison = a.estudiante_nombre.localeCompare(b.estudiante_nombre);
      } else if (sortField === "promedio_general") {
        const aValue = parseFloat(a.promedio_general_estudiante) || 0;
        const bValue = parseFloat(b.promedio_general_estudiante) || 0;
        comparison = aValue - bValue;
      } else {
        // Ordenar por asignatura específica
        const aValue = parseFloat(a.asignaturas[sortField]) || 0;
        const bValue = parseFloat(b.asignaturas[sortField]) || 0;
        comparison = aValue - bValue;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    ); // Spinner de carga

  if (error)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    ); // Mensaje de error al cargar los datos de la API

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <Toaster />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promedios</h1>
            <p className="text-muted-foreground">
              Visualiza los promedios de asignaturas por curso
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[200px] font-semibold">
                  Nombre del Curso
                </TableHead>
                <TableHead className="w-[200px] font-semibold">
                  Jefatura
                </TableHead>
                <TableHead className="w-[150px] font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarioCursos.length > 0 ? (
                funcionarioCursos.map((c: CursoApiResponseType) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.jefatura}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(c)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 mr-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                            />
                          </svg>
                          Promedio Consolidado
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModalEstudiantes(c)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 mr-2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                            />
                          </svg>
                          Promedio Estudiantes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
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
                      <p className="text-muted-foreground">
                        No hay cursos disponibles
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Promedios por Asignatura</DialogTitle>
          </DialogHeader>
          {loadingPromedios ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="flex items-center gap-2"
                >
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
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Exportar a Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="flex items-center gap-2"
                >
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  Exportar a PDF
                </Button>
              </div>
              <div className="mt-4 overflow-auto flex-1">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[50%]">Asignatura</TableHead>
                      <TableHead className="text-right w-[25%]">
                        Cantidad de Estudiantes
                      </TableHead>
                      <TableHead className="text-right w-[25%]">
                        Promedio General
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promediosData.map((promedio, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {promedio.asignatura}
                        </TableCell>
                        <TableCell className="text-right">
                          {promedio.cantidad_estudiantes}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {promedio.promedio_general}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell className="font-medium">
                        Promedio General
                      </TableCell>
                      <TableCell className="text-right">
                        {/* {promediosData
                          .reduce(
                            (acc, curr) =>
                              acc + parseInt(curr.cantidad_estudiantes),
                            0
                          )
                          .toString()} */}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(
                          promediosData
                            .filter((promedio) => !promedio.concepto)
                            .reduce(
                              (acc, curr) =>
                                acc + parseFloat(curr.promedio_general),
                              0
                            ) /
                          promediosData.filter((promedio) => !promedio.concepto)
                            .length
                        ).toFixed(1)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isModalEstudiantesOpen}
        onOpenChange={setIsModalEstudiantesOpen}
      >
        <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Promedios por Estudiante</DialogTitle>
          </DialogHeader>
          {loadingPromediosEstudiantes ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcelEstudiantes}
                  className="flex items-center gap-2"
                >
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
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Exportar a Excel
                </Button>
              </div>
              <div className="mt-4 overflow-auto flex-1">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead
                        className="w-[200px] cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("estudiante")}
                      >
                        <div className="flex items-center gap-2">
                          Estudiante
                          {sortField === "estudiante" && (
                            <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </TableHead>
                      {promediosEstudiantesData.length > 0 &&
                        Object.keys(
                          promediosEstudiantesData[0].asignaturas
                        ).map((asignatura) => (
                          <TableHead
                            key={asignatura}
                            className="text-right cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort(asignatura)}
                          >
                            <div className="flex items-center justify-end gap-2">
                              {asignatura}
                              {sortField === asignatura && (
                                <span>
                                  {sortDirection === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </TableHead>
                        ))}
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("promedio_general")}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Promedio General
                          {sortField === "promedio_general" && (
                            <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSortedData().map((estudiante) => (
                      <TableRow
                        key={estudiante.estudiante_rut}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {estudiante.estudiante_nombre}
                        </TableCell>
                        {Object.entries(estudiante.asignaturas).map(
                          ([asignatura, promedio]) => (
                            <TableCell key={asignatura} className="text-right">
                              {promedio || "-"}
                            </TableCell>
                          )
                        )}
                        <TableCell className="text-right font-medium">
                          {estudiante.promedio_general_estudiante}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicoCursoAsignaturas;
