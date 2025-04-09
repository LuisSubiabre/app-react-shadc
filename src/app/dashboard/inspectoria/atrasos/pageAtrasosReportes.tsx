"use client";

import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { getAtrasosRangoFecha, getAtrasosCursoRangoFecha } from "@/services/atrasosService";
import { getCursos } from "@/services/cursosService";
import { CursoApiResponseType } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipo para los atrasos del reporte
type AtrasoReporteType = {
  atraso_id: number;
  fecha: string;
  hora: string;
  tipo: string;
  justificado: boolean;
  observaciones: string;
  fecha_registro: string;
  estudiante_id: number;
  nombre_estudiante: string;
  nombre_curso: string;
};

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

const PageAtrasosReportes = () => {
  // Estados para el reporte de atrasos
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [isLoadingPDFGeneral, setIsLoadingPDFGeneral] = useState(false);
  const [isLoadingPDFCurso, setIsLoadingPDFCurso] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("");

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

  // Función para mostrar el diálogo
  const showDialog = (title: string, description: string) => {
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

  // Función para generar y descargar el PDF de atrasos general
  const handleGenerarPDF = async () => {
    if (!fechaInicio || !fechaFin) {
      showDialog("Error", "Por favor, selecciona un rango de fechas");
      return;
    }

    const fechaInicioFormateada = new Date(fechaInicio).toISOString().split('T')[0];
    const fechaFinFormateada = new Date(fechaFin).toISOString().split('T')[0];

    setIsLoadingPDFGeneral(true);
    try {
      const response = await getAtrasosRangoFecha(fechaInicioFormateada, fechaFinFormateada);
      
      const atrasos = response && response.data ? response.data : response;
      
      if (!atrasos || atrasos.length === 0) {
        showDialog("Sin resultados", "No se encontraron atrasos en el rango de fechas seleccionado");
        setIsLoadingPDFGeneral(false);
        return;
      }

      // Generar el PDF
      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Agrupar y ordenar atrasos por tipo
      const atrasosLlegada = atrasos
        .filter((atraso: AtrasoReporteType) => atraso.tipo === 'llegada')
        .sort((a: AtrasoReporteType, b: AtrasoReporteType) => {
          // Primero por nombre
          const nombreCompare = a.nombre_estudiante.localeCompare(b.nombre_estudiante);
          if (nombreCompare !== 0) return nombreCompare;
          
          // Luego por fecha
          const fechaCompare = a.fecha.localeCompare(b.fecha);
          if (fechaCompare !== 0) return fechaCompare;
          
          // Finalmente por hora
          return a.hora.localeCompare(b.hora);
        });
      
      const atrasosJornada = atrasos
        .filter((atraso: AtrasoReporteType) => atraso.tipo === 'jornada')
        .sort((a: AtrasoReporteType, b: AtrasoReporteType) => {
          // Primero por nombre
          const nombreCompare = a.nombre_estudiante.localeCompare(b.nombre_estudiante);
          if (nombreCompare !== 0) return nombreCompare;
          
          // Luego por fecha
          const fechaCompare = a.fecha.localeCompare(b.fecha);
          if (fechaCompare !== 0) return fechaCompare;
          
          // Finalmente por hora
          return a.hora.localeCompare(b.hora);
        });

      // Título
      doc.setFontSize(16);
      doc.text("Reporte de Atrasos", 14, 15);
      doc.setFontSize(12);
      
      // Formatear fechas para mostrar correctamente
      const fechaInicioParts = fechaInicio.split('-');
      const fechaFinParts = fechaFin.split('-');
      
      // Formatear como DD/MM/YYYY
      const fechaInicioFormatted = `${fechaInicioParts[2]}/${fechaInicioParts[1]}/${fechaInicioParts[0]}`;
      const fechaFinFormatted = `${fechaFinParts[2]}/${fechaFinParts[1]}/${fechaFinParts[0]}`;
      
      doc.text(`Período: ${fechaInicioFormatted} - ${fechaFinFormatted}`, 14, 25);
      doc.text(`Total de atrasos: ${atrasos.length}`, 14, 32);
      doc.text(`Atrasos por llegada: ${atrasosLlegada.length}`, 14, 39);
      doc.text(`Atrasos por jornada: ${atrasosJornada.length}`, 14, 46);

      // Función para crear datos de tabla
      const createTableData = (atrasos: AtrasoReporteType[]) => {
        return atrasos.map((atraso: AtrasoReporteType) => [
          atraso.nombre_estudiante,
          atraso.nombre_curso,
          atraso.fecha.split('T')[0].split('-').reverse().join('/'),
          atraso.hora,
          atraso.tipo === 'llegada' ? 'Llegada' : 'Jornada'
        ]);
      };

      // Tabla de atrasos por llegada
      if (atrasosLlegada.length > 0) {
        doc.setFontSize(14);
        doc.text("Atrasos por Llegada", 14, 58);
        doc.setFontSize(12);
        
        autoTable(doc, {
          startY: 63,
          head: [["Estudiante", "Curso", "Fecha", "Hora", "Tipo"]],
          body: createTableData(atrasosLlegada),
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
          },
        });
      }

      // Tabla de atrasos por jornada
      if (atrasosJornada.length > 0) {
        // Obtener la posición Y después de la tabla anterior
        const lastY = (doc as JsPDFWithAutoTable & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 63;
        
        doc.setFontSize(14);
        doc.text("Atrasos por Jornada", 14, lastY + 20);
        doc.setFontSize(12);
        
        autoTable(doc, {
          startY: lastY + 25,
          head: [["Estudiante", "Curso", "Fecha", "Hora", "Tipo"]],
          body: createTableData(atrasosJornada),
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
          },
        });
      }

      // Guardar el PDF
      doc.save(`reporte-atrasos-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF de atrasos:", error);
      showDialog("Error", "Error al generar el PDF: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoadingPDFGeneral(false);
    }
  };

  // Función para generar y descargar el PDF de atrasos por curso
  const handleGenerarPDFCurso = async () => {
    if (!fechaInicio || !fechaFin || !selectedCurso) {
      showDialog("Error", "Por favor, selecciona un rango de fechas y un curso");
      return;
    }

    const fechaInicioFormateada = new Date(fechaInicio).toISOString().split('T')[0];
    const fechaFinFormateada = new Date(fechaFin).toISOString().split('T')[0];

    setIsLoadingPDFCurso(true);
    try {
      const response = await getAtrasosCursoRangoFecha(
        fechaInicioFormateada,
        fechaFinFormateada,
        parseInt(selectedCurso)
      );
      
      const atrasos = response && response.data ? response.data : response;
      
      if (!atrasos || atrasos.length === 0) {
        showDialog("Sin resultados", "No se encontraron atrasos en el rango de fechas y curso seleccionado");
        setIsLoadingPDFCurso(false);
        return;
      }

      // Generar el PDF
      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Agrupar y ordenar atrasos por tipo
      const atrasosLlegada = atrasos
        .filter((atraso: AtrasoReporteType) => atraso.tipo === 'llegada')
        .sort((a: AtrasoReporteType, b: AtrasoReporteType) => {
          // Primero por nombre
          const nombreCompare = a.nombre_estudiante.localeCompare(b.nombre_estudiante);
          if (nombreCompare !== 0) return nombreCompare;
          
          // Luego por fecha
          const fechaCompare = a.fecha.localeCompare(b.fecha);
          if (fechaCompare !== 0) return fechaCompare;
          
          // Finalmente por hora
          return a.hora.localeCompare(b.hora);
        });
      
      const atrasosJornada = atrasos
        .filter((atraso: AtrasoReporteType) => atraso.tipo === 'jornada')
        .sort((a: AtrasoReporteType, b: AtrasoReporteType) => {
          // Primero por nombre
          const nombreCompare = a.nombre_estudiante.localeCompare(b.nombre_estudiante);
          if (nombreCompare !== 0) return nombreCompare;
          
          // Luego por fecha
          const fechaCompare = a.fecha.localeCompare(b.fecha);
          if (fechaCompare !== 0) return fechaCompare;
          
          // Finalmente por hora
          return a.hora.localeCompare(b.hora);
        });

      // Título
      doc.setFontSize(16);
      doc.text("Reporte de Atrasos por Curso", 14, 15);
      doc.setFontSize(12);
      
      // Formatear fechas
      const fechaInicioParts = fechaInicio.split('-');
      const fechaFinParts = fechaFin.split('-');
      
      const fechaInicioFormatted = `${fechaInicioParts[2]}/${fechaInicioParts[1]}/${fechaInicioParts[0]}`;
      const fechaFinFormatted = `${fechaFinParts[2]}/${fechaFinParts[1]}/${fechaFinParts[0]}`;
      
      const cursoSeleccionado = cursos.find(c => c.id === parseInt(selectedCurso));
      
      doc.text(`Curso: ${cursoSeleccionado?.nombre || ''}`, 14, 25);
      doc.text(`Período: ${fechaInicioFormatted} - ${fechaFinFormatted}`, 14, 32);
      doc.text(`Total de atrasos: ${atrasos.length}`, 14, 39);
      doc.text(`Atrasos por llegada: ${atrasosLlegada.length}`, 14, 46);
      doc.text(`Atrasos por jornada: ${atrasosJornada.length}`, 14, 53);

      // Función para crear datos de tabla
      const createTableData = (atrasos: AtrasoReporteType[]) => {
        return atrasos.map((atraso: AtrasoReporteType) => [
          atraso.nombre_estudiante,
          atraso.nombre_curso,
          atraso.fecha.split('T')[0].split('-').reverse().join('/'),
          atraso.hora,
          atraso.tipo === 'llegada' ? 'Llegada' : 'Jornada'
        ]);
      };

      // Tabla de atrasos por llegada
      if (atrasosLlegada.length > 0) {
        doc.setFontSize(14);
        doc.text("Atrasos por Llegada", 14, 63);
        doc.setFontSize(12);
        
        autoTable(doc, {
          startY: 68,
          head: [["Estudiante", "Curso", "Fecha", "Hora", "Tipo"]],
          body: createTableData(atrasosLlegada),
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
          },
        });
      }

      // Tabla de atrasos por jornada
      if (atrasosJornada.length > 0) {
        // Obtener la posición Y después de la tabla anterior
        const lastY = (doc as JsPDFWithAutoTable & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 68;
        
        doc.setFontSize(14);
        doc.text("Atrasos por Jornada", 14, lastY + 20);
        doc.setFontSize(12);
        
        autoTable(doc, {
          startY: lastY + 25,
          head: [["Estudiante", "Curso", "Fecha", "Hora", "Tipo"]],
          body: createTableData(atrasosJornada),
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
          },
        });
      }

      // Guardar el PDF
      doc.save(`reporte-atrasos-curso-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF de atrasos:", error);
      showDialog("Error", "Error al generar el PDF: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoadingPDFCurso(false);
    }
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
              Reporte de Atrasos
            </h1>
            <p className="text-muted-foreground mt-2">
              Genera reportes de atrasos en formato PDF
            </p>
          </div>

          {/* Formulario para generar PDF de atrasos general */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Generar PDF de Atrasos General</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Button 
                  onClick={handleGenerarPDF}
                  className="w-full"
                  disabled={isLoadingPDFGeneral}
                >
                  {isLoadingPDFGeneral ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Generar PDF General
                </Button>
              </div>
            </div>
          </div>

          {/* Formulario para generar PDF de atrasos por curso */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Generar PDF de Atrasos por Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Curso
                </label>
                <Select
                  value={selectedCurso}
                  onValueChange={setSelectedCurso}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos?.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id.toString()}>
                        {curso.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button 
                  onClick={handleGenerarPDFCurso}
                  className="w-full"
                  disabled={isLoadingPDFCurso}
                >
                  {isLoadingPDFCurso ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Generar PDF por Curso
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageAtrasosReportes;
