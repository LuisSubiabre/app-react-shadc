import React, { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts";
import { AlertCircle, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { Curso } from "./types";
import { User } from "@/app/dashboard/toor/usuarios/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CursoApiResponseType } from "@/types";
import { getFuncionarios } from "@/services/funcionariosService";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";
import { API_BASE_URL } from "@/config/config";
import { getLibretaEstudiante } from "@/services/academicoService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface AsignaturaLibreta {
  asignatura_id: number;
  nombre: string;
  descripcion: string;
  indice: number;
  concepto: boolean;
  codigo_sige: number;
  nivel_educativo: number;
  es_comun: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_asignacion: string;
  calificacion1: number | null;
  calificacion2: number | null;
  calificacion3: number | null;
  calificacion4: number | null;
  calificacion5: number | null;
  calificacion6: number | null;
  calificacion7: number | null;
  calificacion8: number | null;
  calificacion9: number | null;
  calificacion10: number | null;
  calificacion11: number | null;
  calificacion12: number | null;
  calificacion13: number | null;
  calificacion14: number | null;
  calificacion15: number | null;
  calificacion16: number | null;
  calificacion17: number | null;
  calificacion18: number | null;
  calificacion19: number | null;
  calificacion20: number | null;
  calificacion21: number | null;
  calificacion22: number | null;
  calificacion23: number | null;
  nombre_estudiante: string;
  nombre_curso: string;
  nombre_profesor_jefe: string;
}

const AcademicoImprimirLibreta: React.FC = () => {
  const { error, loading, funcionarioCursos, setFuncionarioCursos } =
    useCursosFuncionarios();

  const [isModalEstudiantesOpen, setIsModalEstudiantesOpen] =
    useState<boolean>(false);
  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null);
  const [dataUsuarios, setDataUsuarios] = useState<User[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [dataEstudiantes, setDataEstudiantes] = useState<Estudiante[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true);
        const response = await getFuncionarios();
        setDataUsuarios(response.data);
      } catch (err) {
        setErrorUsuarios(
          err instanceof Error ? err.message : "Error al cargar usuarios"
        );
        console.error("Error al cargar usuarios:", err);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (funcionarioCursos && dataUsuarios.length > 0) {
      const cursosActualizados = funcionarioCursos.map((curso) => ({
        ...curso,
        jefatura:
          dataUsuarios.find((user) => user.id === curso.profesor_jefe_id)
            ?.nombre || "S/N",
      }));
      setFuncionarioCursos(cursosActualizados);
    }
  }, [funcionarioCursos, dataUsuarios]);

  const handleEstudiantesClick = async (curso: Curso) => {
    setIsModalEstudiantesOpen(true);
    setCurrentCurso(curso);
    setLoadingEstudiantes(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/cursos/estudiantes/${curso.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar estudiantes");
      }

      const data = await response.json();
      const estudiantes = Array.isArray(data)
        ? data.map((estudiante) => ({
            ...estudiante,
            id: estudiante.estudiante_id,
          }))
        : [];
      setDataEstudiantes(estudiantes);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const generarPDFLibreta = async (estudiante: Estudiante) => {
    try {
      const response = await getLibretaEstudiante(estudiante.id);
      const libreta: AsignaturaLibreta[] = response.data;

      if (!libreta || libreta.length === 0) {
        throw new Error("No hay datos de calificaciones para este estudiante");
      }

      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString();

      // Agregar logo
      const logoUrl =
        "https://res.cloudinary.com/dx219dazh/image/upload/v1744723831/varios/urcbzygzvfvzupglmwqy.png";
      const logoWidth = 50; // Ajustado para que quede bien en la página
      const logoHeight = 15; // Manteniendo la proporción
      doc.addImage(logoUrl, "PNG", 20, 10, logoWidth, logoHeight);

      // Establecer fuente y colores
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);

      // Nombre de la institución
      doc.setFontSize(12);
      doc.text("Liceo Experimental UMAG", 80, 20);

      // Título principal
      doc.setFontSize(16);
      doc.text("Libreta de Calificaciones", 105, 30, { align: "center" });

      // Línea decorativa
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      // Información del estudiante
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const infoY = 45;
      //doc.text(`Fecha: ${fecha}`, 20, infoY);
      doc.text(`Estudiante: ${libreta[0].nombre_estudiante}`, 20, infoY + 7);
      doc.text(`Curso: ${libreta[0].nombre_curso}`, 20, infoY + 14);
      doc.text(
        `Profesor Jefe: ${libreta[0].nombre_profesor_jefe}`,
        20,
        infoY + 21
      );

      // Preparar datos para la tabla
      const tableData = libreta.map((asignatura: AsignaturaLibreta) => {
        const calificacionesPrimerSemestre = [];
        const calificacionesSegundoSemestre = [];

        // Primer semestre (C1-C8)
        for (let i = 1; i <= 8; i++) {
          const calificacion =
            asignatura[`calificacion${i}` as keyof AsignaturaLibreta];
          calificacionesPrimerSemestre.push(
            calificacion !== null ? calificacion.toString() : "-"
          );
        }

        // Segundo semestre (C13-C20)
        for (let i = 13; i <= 20; i++) {
          const calificacion =
            asignatura[`calificacion${i}` as keyof AsignaturaLibreta];
          calificacionesSegundoSemestre.push(
            calificacion !== null ? calificacion.toString() : "-"
          );
        }

        // Calcular PFS (Promedio Final Semestral)
        const pfs1 = calcularPromedio(calificacionesPrimerSemestre);
        const pfs2 = calcularPromedio(calificacionesSegundoSemestre);

        // Calcular PF (Promedio Final Anual)
        const pf = calcularPromedio([pfs1, pfs2]);

        return [
          asignatura.nombre,
          ...calificacionesPrimerSemestre,
          pfs1,
          ...calificacionesSegundoSemestre,
          pfs2,
          pf,
        ];
      });

      // Encabezados de la tabla
      const headers = [
        "Asignatura",
        ...Array.from({ length: 8 }, (_, i) => (i + 1).toString()),
        "PFS",
        ...Array.from({ length: 8 }, (_, i) => (i + 1).toString()),
        "PFS",
        "PF",
      ];

      // Crear tabla
      autoTable(doc, {
        startY: 75,
        head: [headers],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          fontSize: 8,
          cellPadding: 1,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          minCellHeight: 5,
        },
        styles: {
          fontSize: 8,
          cellPadding: 1,
          lineColor: [200, 200, 200],
          halign: "center",
          minCellHeight: 5,
        },
        columnStyles: {
          0: {
            cellWidth: 35, // Asignatura
            fontStyle: "bold",
            halign: "left",
          },
          ...Object.fromEntries(
            Array.from({ length: 8 }, (_, i) => [
              i + 1,
              {
                cellWidth: 8,
                halign: "center",
              },
            ])
          ),
          9: {
            // PFS 1er semestre
            cellWidth: 10,
            halign: "center",
            fontStyle: "bold",
          },
          ...Object.fromEntries(
            Array.from({ length: 8 }, (_, i) => [
              i + 10,
              {
                cellWidth: 8,
                halign: "center",
              },
            ])
          ),
          18: {
            // PFS 2do semestre
            cellWidth: 10,
            halign: "center",
            fontStyle: "bold",
          },
          19: {
            // PF
            cellWidth: 10,
            halign: "center",
            fontStyle: "bold",
          },
        },
        margin: { left: 10, right: 10 },
        tableWidth: 193, // Ajustado para eliminar el espacio en blanco
        didDrawPage: function () {
          // Agregar títulos de semestres con fondo
          doc.setFillColor(41, 128, 185);
          // 1er Semestre (desde columna 1 hasta PFS)
          doc.rect(45, 70, 75, 5, "F");
          // 2do Semestre (desde columna 1 hasta PFS)
          doc.rect(120, 70, 75, 5, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.text("1er Semestre", 82.5, 73, { align: "center" });
          doc.text("2do Semestre", 157.5, 73, { align: "center" });

          // Restaurar color del texto
          doc.setTextColor(0, 0, 0);
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableLineColor: [41, 128, 185],
        tableLineWidth: 0.5,
      });

      // Espacio para firmas y timbres
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);

      // Línea izquierda (Profesor Jefe)
      doc.line(20, 250, 100, 250);
      doc.setFontSize(8);
      doc.text(libreta[0].nombre_profesor_jefe, 20, 255);
      doc.setFontSize(7);
      doc.text("PROFESOR JEFE", 20, 260);

      // Línea derecha (Director)
      doc.line(110, 250, 190, 250);
      doc.setFontSize(8);
      doc.text("BRAVO JORQUERA PATRICIO BRAVO", 110, 255);
      doc.setFontSize(7);
      doc.text("DIRECTOR", 110, 260);

      // Pie de página con leyendas
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("PFS: Promedio Final Semestral", 20, 270);
      doc.text("PF: Promedio Final Anual", 20, 275);

      // Guardar el PDF
      doc.save(`libreta_${libreta[0].nombre_estudiante}_${fecha}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  // Función auxiliar para calcular promedios
  const calcularPromedio = (calificaciones: (string | number)[]): string => {
    const numeros = calificaciones
      .map((c) => (typeof c === "string" ? parseFloat(c) : c))
      .filter((c) => !isNaN(c));

    if (numeros.length === 0) return "-";

    const promedio = numeros.reduce((a, b) => a + b, 0) / numeros.length;
    return promedio.toFixed(1);
  };

  if (loading || loadingUsuarios)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    );

  if (error || errorUsuarios)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || errorUsuarios}</AlertDescription>
        </Alert>
      </div>
    );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <Toaster />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Imprimir Libretas
          </h1>
          <p className="text-muted-foreground">
            Imprime las libretas de los estudiantes
          </p>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[200px] font-semibold">
                  Nombre
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
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEstudiantesClick(c)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Users className="size-5" />
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

      <Dialog
        open={isModalEstudiantesOpen}
        onOpenChange={setIsModalEstudiantesOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Estudiantes - {currentCurso?.nombre}
            </DialogTitle>
          </DialogHeader>
          {loadingEstudiantes ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-hidden">
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-auto max-h-[50vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>RUT</TableHead>
                        <TableHead>N° Lista</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataEstudiantes.length > 0 ? (
                        dataEstudiantes.map((estudiante) => (
                          <TableRow key={estudiante.id}>
                            <TableCell>{estudiante.nombre}</TableCell>
                            <TableCell>{estudiante.rut}</TableCell>
                            <TableCell>{estudiante.numlista}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-primary/10 hover:text-primary"
                                onClick={() => generarPDFLibreta(estudiante)}
                              >
                                Imprimir Libreta
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No hay estudiantes en este curso
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalEstudiantesOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicoImprimirLibreta;
