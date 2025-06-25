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
import { obtenerPorcentajeAsistencia } from "@/services/sesionesService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface PorcentajeAsistencia {
  taller_id: number;
  nombre_taller: string;
  total_sesiones: string;
  total_asistencias_registradas: string;
  total_asistencias: string;
  porcentaje_asistencia: string;
}

interface PorcentajeAsistenciaResponse {
  mes: number;
  anio: number;
  total_talleres: number;
  porcentajes_asistencia: PorcentajeAsistencia[];
}

interface ModalPorcentajeAsistenciaProps {
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

export const ModalPorcentajeAsistencia: React.FC<
  ModalPorcentajeAsistenciaProps
> = ({ isOpen, onClose }) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");
  const [añoSeleccionado, setAñoSeleccionado] = useState<string>("2025");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerarInforme = async () => {
    if (!mesSeleccionado || !añoSeleccionado) return;

    setLoading(true);
    try {
      const data: PorcentajeAsistenciaResponse =
        await obtenerPorcentajeAsistencia(
          parseInt(mesSeleccionado),
          parseInt(añoSeleccionado)
        );

      if (
        !data ||
        !data.porcentajes_asistencia ||
        data.porcentajes_asistencia.length === 0
      ) {
        toast({
          title: "Sin datos",
          description:
            "No hay registros de porcentaje de asistencia para el período seleccionado",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Título
      doc.setFontSize(16);
      doc.text("Informe de Porcentaje de Asistencia", 14, 15);
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

      // Información general
      doc.setFontSize(11);
      doc.text(`Total de talleres: ${data.total_talleres}`, 14, 40);

      // Ordenar por porcentaje de asistencia (descendente)
      const porcentajesOrdenados = [...data.porcentajes_asistencia].sort(
        (a, b) =>
          parseFloat(b.porcentaje_asistencia) -
          parseFloat(a.porcentaje_asistencia)
      );

      // Tabla de porcentajes
      const tableData = porcentajesOrdenados.map((taller) => [
        taller.nombre_taller,
        taller.total_sesiones,
        taller.total_asistencias_registradas,
        taller.total_asistencias,
        `${taller.porcentaje_asistencia}%`,
      ]);

      autoTable(doc, {
        startY: 50,
        head: [
          ["Taller", "Sesiones", "Registradas", "Asistencias", "% Asistencia"],
        ],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
        },
        didDrawPage: function (data) {
          // Agregar número de página
          doc.setFontSize(10);
          doc.text(
            `Página 1`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      // Resumen estadístico
      const finalY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;

      if (finalY < 250) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Resumen Estadístico:", 14, finalY);

        const porcentajes = porcentajesOrdenados.map((t) =>
          parseFloat(t.porcentaje_asistencia)
        );
        const promedio =
          porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length;
        const maximo = Math.max(...porcentajes);
        const minimo = Math.min(...porcentajes);

        doc.setFont("helvetica", "normal");
        doc.text(
          `Promedio de asistencia: ${promedio.toFixed(2)}%`,
          14,
          finalY + 8
        );
        doc.text(`Mayor porcentaje: ${maximo.toFixed(2)}%`, 14, finalY + 12);
        doc.text(`Menor porcentaje: ${minimo.toFixed(2)}%`, 14, finalY + 16);
      }

      // Guardar el PDF
      doc.save(
        `informe-porcentaje-asistencia-${meses
          .find((m) => m.value === mesSeleccionado)
          ?.label.toLowerCase()}-${añoSeleccionado}.pdf`
      );

      toast({
        title: "Éxito",
        description:
          "Informe de porcentaje de asistencia generado correctamente",
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
          <DialogTitle>Informe de Porcentaje de Asistencia</DialogTitle>
        </DialogHeader>
        <div id="modal-description" className="sr-only">
          Modal para generar el informe de porcentaje de asistencia de todos los
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
