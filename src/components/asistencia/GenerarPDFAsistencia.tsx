import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { getAsistenciaCurso } from "@/services/asistenciaService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

interface AsistenciaData {
  estudiante_id: number;
  nombre: string;
  curso: string;
  anio: number;
  mes: number;
  total_dias: number;
  dias_asistidos: number;
  porcentaje_asistencia: string;
}

interface GenerarPDFAsistenciaProps {
  cursoId: number;
  cursoNombre?: string;
}

const MESES_NOMBRES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Meses del año escolar (marzo a diciembre)
const MESES_ESCOLARES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const GenerarPDFAsistencia: React.FC<GenerarPDFAsistenciaProps> = ({
  cursoId,
  cursoNombre = "Curso",
}) => {
  const [isGenerando, setIsGenerando] = useState(false);

  const generarPDF = async () => {
    setIsGenerando(true);
    try {
      const data = await getAsistenciaCurso(cursoId);

      if (!data || data.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay datos de asistencia para este curso",
          variant: "destructive",
        });
        return;
      }

      // Ordenar por nombre de estudiante
      const datosOrdenados = (data as AsistenciaData[]).sort(
        (a: AsistenciaData, b: AsistenciaData) =>
          a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );

      // Obtener meses únicos de los datos y ordenarlos según el año escolar
      const mesesDisponibles = [
        ...new Set(
          (data as AsistenciaData[]).map((item: AsistenciaData) => item.mes)
        ),
      ]
        .filter((mes) => MESES_ESCOLARES.includes(mes))
        .sort((a: number, b: number) => a - b);

      // Si no hay meses disponibles, mostrar todos los meses del año escolar
      const mesesAMostrar =
        mesesDisponibles.length > 0 ? mesesDisponibles : MESES_ESCOLARES;

      // Agrupar datos por estudiante
      const estudiantesMap = new Map<
        number,
        { nombre: string; datos: Map<number, AsistenciaData> }
      >();

      datosOrdenados.forEach((item: AsistenciaData) => {
        if (!estudiantesMap.has(item.estudiante_id)) {
          estudiantesMap.set(item.estudiante_id, {
            nombre: item.nombre,
            datos: new Map(),
          });
        }
        estudiantesMap.get(item.estudiante_id)!.datos.set(item.mes, item);
      });

      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Configuración de página
      doc.setProperties({
        title: `Asistencia - ${cursoNombre}`,
        subject: "Reporte de Asistencia por Curso",
        author: "Sistema Liceo Experimental",
        keywords: "asistencia, curso, estudiantes",
        creator: "Sistema Liceo Experimental",
      });

      // Título principal
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE DE ASISTENCIA", 14, 20);

      // Información del curso
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`Curso: ${cursoNombre}`, 14, 30);

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

      // Línea separadora
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(14, 50, 196, 50);

      // Preparar encabezados de la tabla
      const headers = ["Estudiante"];
      mesesAMostrar.forEach((mes: number) => {
        headers.push(MESES_NOMBRES[mes - 1]);
      });

      // Preparar datos de la tabla
      const tableData: string[][] = [];

      estudiantesMap.forEach((estudiante) => {
        const row: string[] = [estudiante.nombre];

        mesesAMostrar.forEach((mes: number) => {
          const datosMes = estudiante.datos.get(mes);
          if (datosMes) {
            row.push(
              `${datosMes.dias_asistidos}/${datosMes.total_dias} (${datosMes.porcentaje_asistencia}%)`
            );
          } else {
            row.push("-");
          }
        });

        tableData.push(row);
      });

      // Calcular anchos de columna dinámicamente
      const anchoEstudiante = 60;
      const anchoRestante = 196 - 14 - anchoEstudiante; // Ancho total menos márgenes y columna estudiante
      const anchoPorMes = anchoRestante / mesesAMostrar.length;

      // Configurar estilos de columna
      const columnStyles: {
        [key: string]: {
          cellWidth: number;
          fontStyle?: "normal" | "bold" | "italic";
          halign?: "left" | "center" | "right";
        };
      } = {
        0: { cellWidth: anchoEstudiante, fontStyle: "bold" }, // Nombre del estudiante
      };

      // Configurar anchos para las columnas de meses
      for (let i = 1; i <= mesesAMostrar.length; i++) {
        columnStyles[i.toString()] = {
          cellWidth: anchoPorMes,
          halign: "center",
        };
      }

      // Configurar y generar la tabla
      autoTable(doc, {
        startY: 55,
        head: [headers],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        styles: {
          fontSize: 7, // Reducir tamaño de fuente para acomodar más columnas
          cellPadding: 2,
        },
        columnStyles: columnStyles,
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        margin: { top: 55, left: 14, right: 14, bottom: 20 },
        didDrawPage: function (data) {
          // Pie de página
          const pageCount = doc.getNumberOfPages();
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
            `Página ${data.pageNumber} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
          );
        },
      });

      // Guardar el PDF
      doc.save(
        `asistencia_${cursoNombre.replace(
          /\s+/g,
          "_"
        )}_${fechaFormateada.replace(/\//g, "-")}.pdf`
      );

      toast({
        title: "PDF generado",
        description: "El reporte de asistencia se ha generado correctamente",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF de asistencia",
        variant: "destructive",
      });
    } finally {
      setIsGenerando(false);
    }
  };

  return (
    <Button
      onClick={generarPDF}
      disabled={isGenerando}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isGenerando ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      Reporte de Asistencia
    </Button>
  );
};
