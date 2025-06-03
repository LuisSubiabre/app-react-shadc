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
import { obtenerAllSesionesPorMes } from "@/services/sesionesService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface Sesion {
  sesion_id: number;
  fecha: string;
  estado: string;
  nombre_taller: string;
  nombre_monitor: string;
}

interface ModalAsistenciaPorMesProps {
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

export const ModalAsistenciaPorMes: React.FC<ModalAsistenciaPorMesProps> = ({
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
      const data = await obtenerAllSesionesPorMes(
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
      doc.text("Informe de Asistencia Mensual", 14, 15);
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

      // Agrupar registros por taller
      const registrosPorTaller = data.reduce(
        (acc: { [key: string]: Sesion[] }, registro: Sesion) => {
          const key = registro.nombre_taller;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(registro);
          return acc;
        },
        {}
      );

      let startY = 40;
      let pageNumber = 1;

      // Generar tabla para cada taller
      Object.entries(registrosPorTaller).forEach(
        ([nombreTaller, sesiones], index) => {
          // Si no es la primera página y el espacio es limitado, agregar nueva página
          if (index > 0 && startY > 250) {
            doc.addPage();
            startY = 20;
            pageNumber++;
          }

          // Título del taller
          doc.setFontSize(12);
          doc.text(`Taller: ${nombreTaller}`, 14, startY);
          startY += 7;

          // Tabla para el taller actual
          const tableData = (sesiones as Sesion[]).map((sesion: Sesion) => [
            formatearFecha(sesion.fecha),
            sesion.estado.charAt(0).toUpperCase() + sesion.estado.slice(1),
            sesion.nombre_monitor,
          ]);

          autoTable(doc, {
            startY: startY,
            head: [["Fecha", "Estado", "Monitor"]],
            body: tableData,
            theme: "grid",
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 10 },
            columnStyles: {
              0: { cellWidth: 40 },
              1: { cellWidth: 40 },
              2: { cellWidth: 100 },
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
        }
      );

      // Guardar el PDF
      doc.save(
        `informe-asistencia-${meses
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
          <DialogTitle>Informe de Asistencia por Mes</DialogTitle>
        </DialogHeader>
        <div id="modal-description" className="sr-only">
          Modal para generar el informe de asistencia mensual de todos los
          talleres
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
