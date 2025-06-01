import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EstudianteType, Atraso } from "@/types";
import { format } from "date-fns";
import { createAtraso, deleteAtraso } from "@/services/atrasosService";
import { Trash2, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModalAtrasosProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: EstudianteType | null;
  atrasos: Atraso[];
  onAtrasosChange: () => void;
  onExportPDF: () => void;
}

export function ModalAtrasos({
  isOpen,
  onClose,
  estudiante,
  atrasos,
  onAtrasosChange,
  onExportPDF,
}: ModalAtrasosProps) {
  const [fecha, setFecha] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [hora, setHora] = useState(format(new Date(), "HH:mm"));
  const [observaciones, setObservaciones] = useState("");
  const [tipo, setTipo] = useState<"llegada" | "jornada">("llegada");

  const formatearFecha = (fechaStr: string) => {
    // Crear una fecha desde el string, asumiendo que es UTC
    const fecha = new Date(fechaStr);
    // Ajustar 3 horas para Magallanes
    fecha.setHours(fecha.getHours() + 3);
    return format(fecha, "dd/MM/yyyy");
  };

  const handleSubmit = async () => {
    if (!estudiante) return;

    try {
      const [hours, minutes] = hora.split(":").map(Number);

      // Separamos la fecha en sus componentes
      const [year, month, day] = fecha.split("-").map(Number);

      // Creamos la fecha local directamente con los componentes

      // Convertimos a UTC manteniendo los componentes de fecha y hora exactos
      const fechaUTC = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, 0)
      );

      await createAtraso({
        estudiante_id: estudiante.id,
        fecha: fechaUTC.toISOString(),
        hora: hora,
        hora_registro: format(new Date(), "HH:mm:ss"),
        tipo: tipo,
        justificado: false,
        observaciones: observaciones,
        fecha_registro: new Date().toISOString(),
      });

      onAtrasosChange();
      setObservaciones("");
    } catch (error) {
      console.error("Error al crear atraso:", error);
    }
  };

  const handleDelete = async (atrasoId: number) => {
    try {
      await deleteAtraso(atrasoId);
      onAtrasosChange();
    } catch (error) {
      console.error("Error al eliminar atraso:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gestión de Atrasos - {estudiante?.nombre}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="mb-4 text-lg font-medium">
                Registrar Nuevo Atraso
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="fecha">Fecha</label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="hora">Hora</label>
                  <Input
                    id="hora"
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="tipo">Tipo de Atraso</label>
                  <Select
                    value={tipo}
                    onValueChange={(value: "llegada" | "jornada") =>
                      setTipo(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llegada">Atraso Llegada</SelectItem>
                      <SelectItem value="jornada">Atraso Jornada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="observaciones">Observaciones</label>
                  <Input
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ingrese observaciones..."
                  />
                </div>
                <Button onClick={handleSubmit}>Registrar Atraso</Button>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="mb-4 text-lg font-medium">Historial de Atrasos</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {atrasos.map((atraso) => (
                  <div
                    key={atraso.atraso_id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {formatearFecha(atraso.fecha)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hora: {atraso.hora} - Tipo:{" "}
                        {atraso.tipo === "llegada" ? "Llegada" : "Jornada"}
                      </p>
                      {atraso.observaciones && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {atraso.observaciones}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(atraso.atraso_id)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {atrasos.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay atrasos registrados
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onExportPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
