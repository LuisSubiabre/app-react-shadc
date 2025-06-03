import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { obtenerAllSesionesPorMesDetalle } from "@/services/sesionesService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface SesionDetalle {
  sesion_id: number;
  fecha: string;
  estado: string;
  estudiante_id: number;
  nombre_estudiante: string;
  rut: string;
  asistio: boolean;
  nombre_taller: string;
  nombre_monitor: string;
}

interface ModalAsistenciaDetalleProps {
  isOpen: boolean;
  onClose: () => void;
}

const meses = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const años = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
];

export const ModalAsistenciaDetalle: React.FC<ModalAsistenciaDetalleProps> = ({
  isOpen,
  onClose,
}) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");
  const [añoSeleccionado, setAñoSeleccionado] = useState<string>("2025");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatearFecha = (fechaISO: string) => {
    try {
      const fechaPart = fechaISO.split("T")[0];
      const [year, month, day] = fechaPart.split("-").map(Number);
      const fecha = new Date(year, month - 1, day);

      if (isNaN(fecha.getTime())) {
        console.error("Fecha inválida:", fechaISO);
        return "Fecha inválida";
      }

      return format(fecha, "dd-MM-yyyy");
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };

  const handleGenerarInforme = async () => {
    if (!mesSeleccionado || !añoSeleccionado) return;

    setLoading(true);
    try {
      const data = await obtenerAllSesionesPorMesDetalle(
        parseInt(mesSeleccionado),
        parseInt(añoSeleccionado)
      );

      if (!data || data.length === 0) {
        toast({
          title: "Sin datos",
          description:
            "No hay registros de asistencia para el período seleccionado",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Título
      doc.setFontSize(16);
      doc.text("Informe de Asistencia Mensual Detallado", 14, 15);
      doc.setFontSize(12);
      doc.text(
        `Período: ${
          meses.find((m) => m.value === mesSeleccionado)?.label
        } ${añoSeleccionado}`,
        14,
        25
      );

      // Línea horizontal
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 32, 196, 32);

      // Agrupar registros por taller y sesión
      const registrosPorTaller = data.reduce(
        (
          acc: { [key: string]: { [key: string]: SesionDetalle[] } },
          registro: SesionDetalle
        ) => {
          const keyTaller = registro.nombre_taller;
          const keySesion = `${registro.sesion_id}`;

          if (!acc[keyTaller]) {
            acc[keyTaller] = {};
          }
          if (!acc[keyTaller][keySesion]) {
            acc[keyTaller][keySesion] = [];
          }
          acc[keyTaller][keySesion].push(registro);
          return acc;
        },
        {}
      );

      let startY = 40;
      let pageNumber = 1;

      // Generar tabla para cada taller
      Object.entries(registrosPorTaller).forEach(
        ([nombreTaller, sesiones], indexTaller) => {
          // Si no es la primera página y el espacio es limitado, agregar nueva página
          if (indexTaller > 0 && startY > 250) {
            doc.addPage();
            startY = 20;
            pageNumber++;
          }

          // Título del taller
          doc.setFontSize(12);
          doc.text(`Taller: ${nombreTaller}`, 14, startY);
          startY += 7;

          // Para cada sesión del taller
          Object.entries(
            sesiones as { [key: string]: SesionDetalle[] }
          ).forEach(([, registros], indexSesion) => {
            // Si no es la primera sesión y el espacio es limitado, agregar nueva página
            if (indexSesion > 0 && startY > 250) {
              doc.addPage();
              startY = 20;
              pageNumber++;
            }

            // Título de la sesión
            doc.setFontSize(11);
            doc.text(
              `Sesión ${indexSesion + 1} - ${formatearFecha(
                registros[0].fecha
              )}`,
              14,
              startY
            );
            startY += 7;

            // Estado de la sesión
            doc.setFontSize(10);
            const estado =
              registros[0].estado.charAt(0).toUpperCase() +
              registros[0].estado.slice(1);
            doc.text(`Estado: ${estado}`, 14, startY);
            doc.text(`Monitor: ${registros[0].nombre_monitor}`, 100, startY);
            startY += 7;

            // Tabla para la sesión actual
            const tableData = registros.map((registro: SesionDetalle) => [
              registro.nombre_estudiante,
              registro.rut,
              registro.asistio ? "Presente" : "Ausente",
            ]);

            autoTable(doc, {
              startY: startY,
              head: [["Estudiante", "RUT", "Asistencia"]],
              body: tableData,
              theme: "grid",
              headStyles: { fillColor: [41, 128, 185] },
              styles: { fontSize: 10 },
              columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 40 },
                2: { cellWidth: 30 },
              },
              didDrawPage: function (data) {
                // Agregar número de página
                doc.setFontSize(10);
                doc.text(
                  `Página ${pageNumber}`,
                  data.settings.margin.left,
                  doc.internal.pageSize.height - 10
                );
              },
            });

            // Actualizar startY para la próxima tabla
            startY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;
          });
        }
      );

      // Guardar el PDF
      doc.save(
        `informe-asistencia-detalle-${meses
          .find((m) => m.value === mesSeleccionado)
          ?.label.toLowerCase()}-${añoSeleccionado}.pdf`
      );

      toast({
        title: "Éxito",
        description: "Informe generado correctamente",
      });
    } catch (error) {
      console.error("Error al generar el informe:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el informe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="modal-description">
        <DialogHeader>
          <DialogTitle>Informe de Asistencia Detallado</DialogTitle>
        </DialogHeader>
        <div id="modal-description" className="sr-only">
          Modal para generar el informe de asistencia mensual detallado de todos
          los talleres
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="mes" className="text-sm font-medium">
              Seleccione el mes
            </label>
            <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un mes" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="año" className="text-sm font-medium">
              Seleccione el año
            </label>
            <Select value={añoSeleccionado} onValueChange={setAñoSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un año" />
              </SelectTrigger>
              <SelectContent>
                {años.map((año) => (
                  <SelectItem key={año.value} value={año.value}>
                    {año.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerarInforme}
            disabled={!mesSeleccionado || !añoSeleccionado || loading}
          >
            {loading ? "Generando..." : "Generar Informe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
