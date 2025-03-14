import { Curso } from "@/app/dashboard/academico/inicio/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MESES } from "@/types/asistencia";

interface FiltrosAsistenciaProps {
  funcionarioCursos: Curso[];
  cursoSeleccionado: number | null;
  mesSeleccionado: number;
  onCursoChange: (cursoId: number) => void;
  onMesChange: (mes: number) => void;
}

export const FiltrosAsistencia: React.FC<FiltrosAsistenciaProps> = ({
  funcionarioCursos,
  cursoSeleccionado,
  mesSeleccionado,
  onCursoChange,
  onMesChange,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-2">
        <Label>Seleccionar Curso</Label>
        <Select
          value={cursoSeleccionado?.toString()}
          onValueChange={(value) => onCursoChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un curso" />
          </SelectTrigger>
          <SelectContent>
            {funcionarioCursos.map((curso) => (
              <SelectItem key={curso.id} value={curso.id.toString()}>
                {curso.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Seleccionar Mes</Label>
        <Select
          value={mesSeleccionado.toString()}
          onValueChange={(value) => onMesChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un mes" />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((mes) => (
              <SelectItem key={mes.value} value={mes.value.toString()}>
                {mes.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
