import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getJefatura } from "@/services/jefaturaService";
import { CursoType, EstudianteType } from "@/types/index.ts";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Calendar, FileText, BookOpen, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileDown } from "lucide-react";
import { estudiantesCurso } from "@/services/estudiantesService";
import { useAuth } from "@/hooks/useAuth";
import { getTalleresByCursoJefatura } from "@/services/talleresService";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ModalVerAtrasos } from "@/components/atrasos/ModalVerAtrasos";
import {
  getAtrasosByEstudiante,
  getAtrasosCursoRangoFecha,
} from "@/services/atrasosService";
import { Atraso } from "@/types";
import { ModalVerAsistencia } from "@/components/asistencia/ModalVerAsistencia";
import { getAsistenciaEstudiante } from "@/services/asistenciaService";
import { AsistenciaEstudiante } from "@/types/asistencia";
import {
  getInformePersonalidad,
  updateInformePersonalidad,
} from "@/services/informePersonalidadService";
import { InformePersonalidad } from "@/types/informePersonalidad";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ModalVerNotas from "@/components/notas/ModalVerNotas";
import { getPromedioPorCurso } from "@/services/infoService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GenerarPDFAsistencia } from "@/components/asistencia/GenerarPDFAsistencia";
import { Input } from "@/components/ui/input";

interface TallerACLE {
  estudiante_id: number;
  nombre_estudiante: string;
  nombre_curso: string;
  taller_id: number;
  nombre_taller: string;
  horario: string;
  ubicacion: string;
}

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

interface PromedioData {
  curso: string;
  asignatura: string;
  cantidad_estudiantes: string;
  promedio_general: string;
  concepto?: boolean;
}

const FORMACION_ETICA_ITEMS = [
  "Es responsable con sus tareas, trabajos y demás obligaciones escolares.",
  "Asiste a clases en forma puntual y constante",
  "Trata con respeto a sus compañeros/as, profesores/as y miembros de la comunidad",
  "Es honesto(a) en su trabajo y en su vida escolar en general, asumiendo responsabilidades en sus acciones",
  "Respeta las normas de convivencia establecidas",
  "Respeta ideas y creencias distintas a las propias",
  "Es un alumno(a) solidario(a) y generoso(a) con los demás",
  "Utiliza el diálogo como medio de resolución de conflictos",
];

const CRECIMIENTO_ITEMS = [
  "Reconoce sus virtudes y defectos",
  "Es responsable con los compromisos que adquiere",
  "Se preocupa por su higiene y presentación personal",
  "Reacciona positivamente frente a situaciones nuevas o conflictivas",
  "Reconoce sus errores y trata de superarlos",
];

const ENTORNO_ITEMS = [
  "Tiene un grupo de amigos(as) estable",
  "Ayuda a sus compañeros(as)",
  "Propone ideas al grupo",
  "Se ofrece voluntario(a) en las actividades a realizar",
  "Actúa con responsabilidad en el cuidado del medio ambiente",
  "Participa en actividades que el Liceo programa en la comunidad",
  "Respeta las normas disciplinarias y seguridad vigentes en el Liceo",
];

const APRENDIZAJE_ITEMS = [
  "Atiende en clases",
  "Se concentra adecuadamente en el trabajo",
  "Demuestra interés y compromiso por su aprendizaje",
  "Desarrolla al máximo sus capacidades",
  "Demuestra sentido de superación",
  "Participa activamente durante la clase y/o actividades",
  "Asiste regularmente a rendir sus evaluaciones, en fecha indicada",
];

const CONDUCTAS_ITEMS = [
  "Agresividad",
  "Estado de ánimo decaído",
  "Conflictos interpersonales",
  "Aislamiento, soledad",
  "Episodios de ansiedad inmanejables",
  "Excesiva pasividad",
  "Desinterés en labores académicas",
];

const EVALUACION_OPTIONS = [
  { value: "Siempre", label: "Siempre" },
  { value: "Aveces", label: "Aveces" },
  { value: "Nunca", label: "Nunca" },
  { value: "No observado", label: "No observado" },
];

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

const PageJefatura = () => {
  const [curso, setCurso] = useState<CursoType | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [error, setError] = useState("");
  const [errorEstudiantes, setErrorEstudiantes] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState<boolean>(true);
  const { user } = useAuth() || {};
  const [selectedEstudiante, setSelectedEstudiante] =
    useState<EstudianteType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [atrasos, setAtrasos] = useState<Atraso[]>([]);
  const [isModalAsistenciaOpen, setIsModalAsistenciaOpen] = useState(false);
  const [asistencias, setAsistencias] = useState<AsistenciaEstudiante[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(3);
  const [asistencia, setAsistencia] = useState<AsistenciaEstudiante | null>(
    null
  );
  const [loadingInforme, setLoadingInforme] = useState<number | null>(null);
  const [isModalInformeOpen, setIsModalInformeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [informePersonalidadTemp, setInformePersonalidadTemp] =
    useState<InformePersonalidad | null>(null);
  const [isModalNotasOpen, setIsModalNotasOpen] = useState(false);
  const [isModalPromediosOpen, setIsModalPromediosOpen] = useState(false);
  const [promediosData, setPromediosData] = useState<PromedioData[]>([]);
  const [loadingPromedios, setLoadingPromedios] = useState(false);
  const [informesGuardados, setInformesGuardados] = useState<{
    [key: number]: string;
  }>({});

  // Estados para el reporte de atrasos
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [isLoadingPDFAtrasos, setIsLoadingPDFAtrasos] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [isModalAtrasosOpen, setIsModalAtrasosOpen] = useState(false);

  useEffect(() => {
    getJefatura(Number(user?.id))
      .then((response) => {
        if (response) {
          setCurso(response);
          console.log("Curso: ", response);
        } else {
          setError("No se pudo cargar la información");
        }
      })
      .catch(() => {
        setError("No se pudo cargar la información");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (curso) {
      estudiantesCurso(curso.curso_id)
        .then((response) => {
          setEstudiantes(response);
        })
        .catch(() => {
          setErrorEstudiantes(
            "No se pudo cargar la información de los estudiantes"
          );
        })
        .finally(() => {
          setLoadingEstudiantes(false);
        });
    }
  }, [curso]);

  const exportarACLEs = async () => {
    if (!curso) return;

    try {
      const response = await getTalleresByCursoJefatura(curso.curso_id);
      const talleres = response.talleres as TallerACLE[];

      if (!talleres || talleres.length === 0) {
        setError("No hay talleres ACLE para este curso");
        return;
      }

      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Configuración de página
      doc.setProperties({
        title: `Listado ACLES - ${curso.curso_nombre}`,
        subject: "Listado de talleres ACLE",
        author: "Sistema Liceo Experimental",
        keywords: "ACLE, talleres, estudiantes",
        creator: "Sistema Liceo Experimental",
      });

      // Encabezado con logo (opcional)
      // doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);

      // Título principal
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("LISTADO DE TALLERES ACLE", 14, 20);

      // Información del curso
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`Curso: ${curso.curso_nombre}`, 14, 30);

      // Fecha y hora de generación
      doc.setFontSize(10);
      const fechaActual = new Date();
      const fechaFormateada = fechaActual.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const horaFormateada = fechaActual.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Fecha: ${fechaFormateada}`, 14, 38);
      doc.text(`Hora: ${horaFormateada}`, 14, 44);

      // Resumen
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total de estudiantes inscritos: ${talleres.length}`, 14, 54);

      // Línea separadora
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(14, 58, 196, 58);

      // Preparar datos para la tabla
      const tableData = talleres.map((taller: TallerACLE) => [
        taller.nombre_estudiante,
        taller.nombre_taller,
        taller.horario,
        taller.ubicacion,
      ]);

      // Configurar y generar la tabla
      autoTable(doc, {
        startY: 65,
        head: [["Estudiante", "Taller", "Horario", "Ubicación"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { top: 65, left: 14, right: 14, bottom: 20 },
      });

      // Pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);

        // Nombre del liceo
        doc.setFont("helvetica", "bold");
        doc.text(
          "Liceo Experimental Umag",
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 15,
          { align: "center" }
        );

        // Numeración de páginas
        doc.setFont("helvetica", "normal");
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Guardar el PDF
      doc.save(`ACLEs_${curso.curso_nombre.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error al exportar ACLEs:", error);
      setError("Error al exportar el listado de ACLEs");
    }
  };

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

  const handleOpenModalAsistencia = async (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsModalAsistenciaOpen(true);
    try {
      const response = await getAsistenciaEstudiante(
        estudiante.estudiante_id || estudiante.id
      );

      if (response && response.length > 0) {
        setAsistencias(response);
        // Encontrar la asistencia del mes actual
        const asistenciaActual = response.find(
          (a: AsistenciaEstudiante) => a.mes === mesSeleccionado
        );
        setAsistencia(asistenciaActual || null);
      } else {
        setAsistencias([]);
        setAsistencia(null);
      }
    } catch (error) {
      console.error("Error al cargar asistencia:", error);
      setAsistencias([]);
      setAsistencia(null);
    }
  };

  const handleCloseModalAsistencia = () => {
    setIsModalAsistenciaOpen(false);
    setSelectedEstudiante(null);
  };

  const handleMesChange = (mes: number) => {
    setMesSeleccionado(mes);
    const asistenciaDelMes = asistencias.find(
      (a: AsistenciaEstudiante) => a.mes === mes
    );
    setAsistencia(asistenciaDelMes || null);
  };

  const handleInformePersonalidad = async (estudiante: EstudianteType) => {
    setLoadingInforme(estudiante.id);
    try {
      const id = estudiante.estudiante_id || estudiante.id;
      const informe = await getInformePersonalidad(id);
      setInformePersonalidadTemp(informe);
      setIsModalInformeOpen(true);
    } catch (error) {
      console.error("Error al cargar el informe:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el informe de personalidad",
        variant: "destructive",
      });
    } finally {
      setLoadingInforme(null);
    }
  };

  const handleCloseModalInforme = () => {
    setIsModalInformeOpen(false);
    setInformePersonalidadTemp(null);
  };

  const handleSaveInforme = async () => {
    if (!informePersonalidadTemp) return;

    setIsSaving(true);
    try {
      const id =
        estudiantes.find((e) => e.id === informePersonalidadTemp.estudiante_id)
          ?.estudiante_id || informePersonalidadTemp.estudiante_id;
      const updatedInforme = await updateInformePersonalidad(
        id,
        informePersonalidadTemp
      );
      setInformePersonalidadTemp(updatedInforme);
      setInformesGuardados((prev) => ({
        ...prev,
        [id]: new Date().toLocaleDateString(),
      }));
      toast({
        title: "Éxito",
        description: "Informe de personalidad actualizado correctamente",
      });
      setIsModalInformeOpen(false);
    } catch (error) {
      console.error("Error al guardar el informe:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el informe de personalidad",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleValueChange = (
    field: keyof InformePersonalidad,
    value: string
  ) => {
    if (!informePersonalidadTemp) return;
    setInformePersonalidadTemp({
      ...informePersonalidadTemp,
      [field]: value,
    });
  };

  const handleOpenModalNotas = (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsModalNotasOpen(true);
  };

  const handleCloseModalNotas = () => {
    setIsModalNotasOpen(false);
    setSelectedEstudiante(null);
  };

  const convertirPromedioALetra = (promedio: string): string => {
    const numPromedio = parseFloat(promedio);
    if (isNaN(numPromedio)) return promedio;

    if (numPromedio >= 70) return "MB";
    if (numPromedio >= 50) return "B";
    if (numPromedio >= 40) return "S";
    if (numPromedio >= 30) return "I";
    return promedio;
  };

  const handleOpenModalPromedios = async () => {
    if (!curso) return;
    setIsModalPromediosOpen(true);
    setLoadingPromedios(true);
    try {
      const response = await getPromedioPorCurso(curso.curso_id);
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
      toast({
        title: "Error",
        description: "No se pudieron cargar los promedios",
        variant: "destructive",
      });
    } finally {
      setLoadingPromedios(false);
    }
  };

  // Función para abrir el modal de atrasos
  const handleOpenModalAtrasos = () => {
    setIsModalAtrasosOpen(true);
  };

  // Función para cerrar el modal de atrasos
  const handleCloseModalAtrasos = () => {
    setIsModalAtrasosOpen(false);
    setFechaInicio("");
    setFechaFin("");
  };

  // Función para mostrar el diálogo
  const showDialog = (title: string, description: string) => {
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

  // Función para generar y descargar el PDF de atrasos por curso
  const handleGenerarPDFAtrasos = async () => {
    if (!fechaInicio || !fechaFin || !curso) {
      showDialog("Error", "Por favor, selecciona un rango de fechas");
      return;
    }

    const fechaInicioFormateada = new Date(fechaInicio)
      .toISOString()
      .split("T")[0];
    const fechaFinFormateada = new Date(fechaFin).toISOString().split("T")[0];

    setIsLoadingPDFAtrasos(true);
    try {
      const response = await getAtrasosCursoRangoFecha(
        fechaInicioFormateada,
        fechaFinFormateada,
        curso.curso_id
      );

      const atrasos = response && response.data ? response.data : response;

      if (!atrasos || atrasos.length === 0) {
        showDialog(
          "Sin resultados",
          "No se encontraron atrasos en el rango de fechas seleccionado"
        );
        setIsLoadingPDFAtrasos(false);
        return;
      }

      // Generar el PDF
      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Agrupar y ordenar atrasos por tipo
      const atrasosLlegada = atrasos
        .filter((atraso: AtrasoReporteType) => atraso.tipo === "llegada")
        .sort((a: AtrasoReporteType, b: AtrasoReporteType) => {
          // Primero por nombre
          const nombreCompare = a.nombre_estudiante.localeCompare(
            b.nombre_estudiante
          );
          if (nombreCompare !== 0) return nombreCompare;

          // Luego por fecha
          const fechaCompare = a.fecha.localeCompare(b.fecha);
          if (fechaCompare !== 0) return fechaCompare;

          // Finalmente por hora
          return a.hora.localeCompare(b.hora);
        });

      const atrasosJornada = atrasos
        .filter((atraso: AtrasoReporteType) => atraso.tipo === "jornada")
        .sort((a: AtrasoReporteType, b: AtrasoReporteType) => {
          // Primero por nombre
          const nombreCompare = a.nombre_estudiante.localeCompare(
            b.nombre_estudiante
          );
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
      const fechaInicioParts = fechaInicio.split("-");
      const fechaFinParts = fechaFin.split("-");

      const fechaInicioFormatted = `${fechaInicioParts[2]}/${fechaInicioParts[1]}/${fechaInicioParts[0]}`;
      const fechaFinFormatted = `${fechaFinParts[2]}/${fechaFinParts[1]}/${fechaFinParts[0]}`;

      doc.text(`Curso: ${curso.curso_nombre}`, 14, 25);
      doc.text(
        `Período: ${fechaInicioFormatted} - ${fechaFinFormatted}`,
        14,
        32
      );
      doc.text(`Total de atrasos: ${atrasos.length}`, 14, 39);
      doc.text(`Atrasos por llegada: ${atrasosLlegada.length}`, 14, 46);
      doc.text(`Atrasos por jornada: ${atrasosJornada.length}`, 14, 53);

      // Función para crear datos de tabla
      const createTableData = (atrasos: AtrasoReporteType[]) => {
        return atrasos.map((atraso: AtrasoReporteType) => [
          atraso.nombre_estudiante,
          atraso.nombre_curso,
          atraso.fecha.split("T")[0].split("-").reverse().join("/"),
          atraso.hora,
          atraso.tipo === "llegada" ? "Llegada" : "Jornada",
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
        const lastY =
          (doc as JsPDFWithAutoTable & { lastAutoTable: { finalY: number } })
            .lastAutoTable?.finalY || 68;

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
      doc.save(
        `reporte-atrasos-curso-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error al generar el PDF de atrasos:", error);
      showDialog(
        "Error",
        "Error al generar el PDF: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoadingPDFAtrasos(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  if (!curso)
    return (
      <div className="flex justify-center items-center h-full px-36">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jefatura</h1>
            <p className="text-muted-foreground mt-1">{curso?.curso_nombre}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleOpenModalPromedios}
              className="flex items-center gap-2"
              variant="outline"
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
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
              Promedios Consolidados
            </Button>
            {curso && (
              <GenerarPDFAsistencia
                cursoId={curso.curso_id}
                cursoNombre={curso.curso_nombre}
              />
            )}
            <Button
              onClick={handleOpenModalAtrasos}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Clock className="h-4 w-4" />
              Reporte de Atrasos
            </Button>
            <Button onClick={exportarACLEs} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Exportar Listado ACLES
            </Button>
          </div>
        </div>

        {/* Eliminar el formulario anterior que ocupaba mucho espacio */}

        {loadingEstudiantes && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {errorEstudiantes && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorEstudiantes}</AlertDescription>
          </Alert>
        )}

        {!loadingEstudiantes && !errorEstudiantes && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px]">N°</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>RUN</TableHead>
                  <TableHead className="text-center">Atrasos</TableHead>
                  <TableHead className="text-center">Asistencia</TableHead>
                  <TableHead className="text-center">Notas</TableHead>
                  <TableHead className="text-center">
                    Inf. Personalidad
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudiantes.map(
                  (estudiante: EstudianteType, index: number) => (
                    <TableRow key={estudiante.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{estudiante.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {estudiante.email}
                        </div>
                      </TableCell>
                      <TableCell>{estudiante.rut}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(estudiante)}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          title="Ver atrasos"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModalAsistencia(estudiante)}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          title="Ver asistencia"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModalNotas(estudiante)}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          title="Ver notas"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleInformePersonalidad(estudiante)
                                  }
                                  disabled={loadingInforme === estudiante.id}
                                  className="hover:bg-primary/10 hover:text-primary"
                                  title="Ver informe de personalidad"
                                >
                                  {loadingInforme === estudiante.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                  ) : (
                                    <FileText className="size-5" />
                                  )}
                                </Button>
                                {informesGuardados[
                                  estudiante.estudiante_id || estudiante.id
                                ] && (
                                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            {informesGuardados[
                              estudiante.estudiante_id || estudiante.id
                            ] && (
                              <TooltipContent>
                                <p>
                                  Informe guardado el{" "}
                                  {
                                    informesGuardados[
                                      estudiante.estudiante_id || estudiante.id
                                    ]
                                  }
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ModalVerAtrasos
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estudiante={selectedEstudiante}
        atrasos={atrasos}
      />

      <ModalVerAsistencia
        isOpen={isModalAsistenciaOpen}
        onClose={handleCloseModalAsistencia}
        estudiante={selectedEstudiante}
        asistencia={asistencia}
        mesSeleccionado={mesSeleccionado}
        onMesChange={handleMesChange}
      />

      <Dialog open={isModalInformeOpen} onOpenChange={setIsModalInformeOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Informe de Personalidad
            </DialogTitle>
          </DialogHeader>

          {informePersonalidadTemp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Información General
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Estudiante:</span>{" "}
                      {informePersonalidadTemp.estudiante_nombre}
                    </p>
                    <p>
                      <span className="font-medium">Curso:</span>{" "}
                      {informePersonalidadTemp.curso_nombre}
                    </p>
                    <p>
                      <span className="font-medium">Año:</span>{" "}
                      {informePersonalidadTemp.anio}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Estado</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Estado:</span>{" "}
                      {informePersonalidadTemp.estado}
                    </p>
                    <p>
                      <span className="font-medium">Fecha Creación:</span>{" "}
                      {new Date(
                        informePersonalidadTemp.fecha_creacion
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Última Actualización:</span>{" "}
                      {new Date(
                        informePersonalidadTemp.fecha_actualizacion
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    I. FORMACIÓN ÉTICA
                  </h3>
                  <div className="space-y-2">
                    {FORMACION_ETICA_ITEMS.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded"
                      >
                        <span className="font-medium flex-1">{item}</span>
                        <div className="w-[180px]">
                          <Select
                            defaultValue={
                              informePersonalidadTemp[
                                `formacion_etica_${
                                  index + 1
                                }` as keyof InformePersonalidad
                              ] as string
                            }
                            onValueChange={(value) =>
                              handleValueChange(
                                `formacion_etica_${
                                  index + 1
                                }` as keyof InformePersonalidad,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVALUACION_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    II. CRECIMIENTO Y AUTOAFIRMACIÓN PERSONAL
                  </h3>
                  <div className="space-y-2">
                    {CRECIMIENTO_ITEMS.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded"
                      >
                        <span className="font-medium flex-1">{item}</span>
                        <div className="w-[180px]">
                          <Select
                            defaultValue={
                              informePersonalidadTemp[
                                `crecimiento_${
                                  index + 1
                                }` as keyof InformePersonalidad
                              ] as string
                            }
                            onValueChange={(value) =>
                              handleValueChange(
                                `crecimiento_${
                                  index + 1
                                }` as keyof InformePersonalidad,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVALUACION_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    III. LA PERSONA Y SU ENTORNO
                  </h3>
                  <div className="space-y-2">
                    {ENTORNO_ITEMS.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded"
                      >
                        <span className="font-medium flex-1">{item}</span>
                        <div className="w-[180px]">
                          <Select
                            defaultValue={
                              informePersonalidadTemp[
                                `entorno_${
                                  index + 1
                                }` as keyof InformePersonalidad
                              ] as string
                            }
                            onValueChange={(value) =>
                              handleValueChange(
                                `entorno_${
                                  index + 1
                                }` as keyof InformePersonalidad,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVALUACION_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    IV. ÁREA DE APRENDIZAJE
                  </h3>
                  <div className="space-y-2">
                    {APRENDIZAJE_ITEMS.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded"
                      >
                        <span className="font-medium flex-1">{item}</span>
                        <div className="w-[180px]">
                          <Select
                            defaultValue={
                              informePersonalidadTemp[
                                `aprendizaje_${
                                  index + 1
                                }` as keyof InformePersonalidad
                              ] as string
                            }
                            onValueChange={(value) =>
                              handleValueChange(
                                `aprendizaje_${
                                  index + 1
                                }` as keyof InformePersonalidad,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVALUACION_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    V. CONDUCTAS PREOCUPANTES
                  </h3>
                  <div className="space-y-2">
                    {CONDUCTAS_ITEMS.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded"
                      >
                        <span className="font-medium flex-1">{item}</span>
                        <div className="w-[180px]">
                          <Select
                            defaultValue={
                              informePersonalidadTemp[
                                `conductas_${
                                  index + 1
                                }` as keyof InformePersonalidad
                              ] as string
                            }
                            onValueChange={(value) =>
                              handleValueChange(
                                `conductas_${
                                  index + 1
                                }` as keyof InformePersonalidad,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVALUACION_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">OBSERVACIONES</h3>
                  <div className="p-4 bg-muted rounded">
                    <textarea
                      className="w-full min-h-[100px] p-2 border rounded-md bg-background"
                      value={informePersonalidadTemp.observaciones || ""}
                      onChange={(e) =>
                        handleValueChange("observaciones", e.target.value)
                      }
                      placeholder="Ingrese observaciones adicionales (máximo 250 caracteres)"
                      maxLength={250}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {informePersonalidadTemp.observaciones?.length || 0}/250
                      caracteres
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseModalInforme}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveInforme} disabled={isSaving}>
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : null}
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ModalVerNotas
        isOpen={isModalNotasOpen}
        onClose={handleCloseModalNotas}
        estudiante={selectedEstudiante}
      />

      <Dialog
        open={isModalPromediosOpen}
        onOpenChange={setIsModalPromediosOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Promedios por Asignatura</DialogTitle>
          </DialogHeader>
          {loadingPromedios ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
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
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isModalAtrasosOpen} onOpenChange={setIsModalAtrasosOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Reporte de Atrasos</DialogTitle>
            <DialogDescription>
              Selecciona el rango de fechas para generar el reporte de atrasos
              del curso {curso?.curso_nombre}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModalAtrasos}
              disabled={isLoadingPDFAtrasos}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerarPDFAtrasos}
              disabled={isLoadingPDFAtrasos || !fechaInicio || !fechaFin}
            >
              {isLoadingPDFAtrasos ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Generar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageJefatura;
