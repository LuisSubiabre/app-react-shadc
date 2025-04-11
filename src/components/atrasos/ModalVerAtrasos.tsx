import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EstudianteType, Atraso } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ModalVerAtrasosProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: EstudianteType | null;
  atrasos: Atraso[];
}

export function ModalVerAtrasos({
  isOpen,
  onClose,
  estudiante,
  atrasos,
}: ModalVerAtrasosProps) {
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    fecha.setHours(fecha.getHours() + 3);
    return format(fecha, "dd/MM/yyyy");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Atrasos - {estudiante?.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              Para obtener un reporte completo de atrasos del curso, por favor
              contacte al inspector a cargo del nivel.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {atrasos.length > 0 ? (
              atrasos.map((atraso) => (
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
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay atrasos registrados
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
