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
import { TallerType } from "@/types";
import { obtenerInformeAsistencia } from "@/services/sesionesService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface RegistroAsistencia {
  sesion_id: number;
  fecha: string;
  estado: string;
  estudiante_id: number;
  nombre: string;
  rut: string;
  asistio: boolean;
  nombre_taller: string;
  nombre_monitor: string;
}

interface ModalAsistenciaProps {
  isOpen: boolean;
  onClose: () => void;
  taller: TallerType | null;
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

export const ModalAsistencia: React.FC<ModalAsistenciaProps> = ({
  isOpen,
  onClose,
  taller,
}) => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatearFecha = (fechaISO: string) => {
    try {
      // Extraer solo la parte de la fecha (YYYY-MM-DD)
      const fechaPart = fechaISO.split("T")[0];
      const [year, month, day] = fechaPart.split("-").map(Number);

      // Crear una nueva fecha con los componentes
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
    if (!taller || !mesSeleccionado) return;

    setLoading(true);
    try {
      const data = (await obtenerInformeAsistencia(
        taller.taller_id,
        parseInt(mesSeleccionado)
      )) as RegistroAsistencia[];

      if (!data || data.length === 0) {
        toast({
          title: "Sin datos",
          description:
            "No hay registros de asistencia para el mes seleccionado",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Título
      doc.setFontSize(16);
      doc.text("Informe de Asistencia Mensual", 14, 15);
      doc.setFontSize(12);
      doc.text(`Taller: ${taller.taller_nombre}`, 14, 25);
      doc.text(
        `Mes: ${
          meses.find((m) => m.value === mesSeleccionado)?.label ||
          mesSeleccionado
        }`,
        14,
        32
      );
      doc.text(`Monitor: ${data[0].nombre_monitor}`, 14, 39);

      // Línea horizontal
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 45, 196, 45);

      // Agrupar registros por sesión
      const registrosPorSesion = data.reduce(
        (acc: { [key: string]: RegistroAsistencia[] }, registro) => {
          const key = `${registro.sesion_id}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(registro);
          return acc;
        },
        {}
      );

      // Ordenar sesiones por ID
      const sesionesOrdenadas = Object.keys(registrosPorSesion).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );

      let startY = 50;
      let pageNumber = 1;

      // Generar tabla para cada sesión
      sesionesOrdenadas.forEach((sesionId, index) => {
        const registros = registrosPorSesion[sesionId];
        if (!registros || registros.length === 0) return;

        // Si no es la primera página y el espacio es limitado, agregar nueva página
        if (index > 0 && startY > 250) {
          doc.addPage();
          startY = 20;
          pageNumber++;
        }

        // Título de la sesión
        doc.setFontSize(12);
        doc.text(
          `Sesión ${index + 1} - ${formatearFecha(registros[0].fecha)}`,
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
        startY += 7;

        // Tabla para la sesión actual
        const tableData = registros.map((registro) => [
          registro.nombre,
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
            0: { cellWidth: 70 },
            1: { cellWidth: 35 },
            2: { cellWidth: 25 },
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

      // Guardar el PDF
      doc.save(
        `informe-asistencia-${taller.taller_nombre
          .toLowerCase()
          .replace(/\s+/g, "-")}-${meses
          .find((m) => m.value === mesSeleccionado)
          ?.label.toLowerCase()}.pdf`
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
          <DialogTitle>Informe de Asistencia</DialogTitle>
        </DialogHeader>
        <div id="modal-description" className="sr-only">
          Modal para generar el informe de asistencia mensual del taller
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerarInforme}
            disabled={!mesSeleccionado || loading}
          >
            {loading ? "Generando..." : "Generar Informe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
