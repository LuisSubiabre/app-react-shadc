import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EstudianteType } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AsistenciaEstudiante {
  estudiante_id: number;
  estudiante_nombre: string;
  rut: string;
  email: string;
  curso_nombre: string;
  curso_descripcion: string;
  mes: number;
  anio: number;
  total_dias: number;
  dias_asistidos: number;
  porcentaje_asistencia: string;
  fecha_registro: string;
}

interface ModalVerAsistenciaProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: EstudianteType | null;
  asistencia: AsistenciaEstudiante | null;
  mesSeleccionado: number;
  onMesChange: (mes: number) => void;
}

export function ModalVerAsistencia({
  isOpen,
  onClose,
  estudiante,
  asistencia,
  mesSeleccionado,
  onMesChange,
}: ModalVerAsistenciaProps) {
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    fecha.setHours(fecha.getHours() + 3);
    return format(fecha, "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  const getNombreMes = (mes: number) => {
    const fecha = new Date(2024, mes - 1, 1);
    return format(fecha, "MMMM", { locale: es });
  };

  const meses = Array.from({ length: 10 }, (_, i) => i + 3); // Meses del 3 al 12

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asistencia - {estudiante?.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">Seleccionar mes:</p>
            <Select
              value={mesSeleccionado.toString()}
              onValueChange={(value) => onMesChange(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes} value={mes.toString()}>
                    {getNombreMes(mes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {asistencia ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Curso
                  </p>
                  <p>{asistencia.curso_nombre}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Período
                  </p>
                  <p>
                    {getNombreMes(asistencia.mes)} {asistencia.anio}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Días Asistidos
                  </p>
                  <p>
                    {asistencia.dias_asistidos} de {asistencia.total_dias} días
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Porcentaje de Asistencia
                  </p>
                  <p>{asistencia.porcentaje_asistencia}%</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Fecha de Registro
                </p>
                <p>{formatearFecha(asistencia.fecha_registro)}</p>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay información de asistencia disponible para este mes
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
