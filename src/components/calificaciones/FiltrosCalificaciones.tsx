import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Asignatura } from "@/types/calificaciones";

interface FiltrosCalificacionesProps {
  funcionarioCursos: { id: number; nombre: string }[];
  asignaturas: Asignatura[];
  cursoSeleccionado: number | null;
  asignaturaSeleccionada: string | null;
  selectedSemester: number;
  onCursoChange: (cursoId: number) => void;
  onAsignaturaChange: (asignaturaId: string) => void;
  onSemesterChange: (semester: number) => void;
}

export const FiltrosCalificaciones: React.FC<FiltrosCalificacionesProps> = ({
  funcionarioCursos,
  asignaturas,
  cursoSeleccionado,
  asignaturaSeleccionada,
  selectedSemester,
  onCursoChange,
  onAsignaturaChange,
  onSemesterChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="grid gap-2">
        <Label>Seleccionar Curso: </Label>
        <Select
          value={cursoSeleccionado?.toString() || ""}
          onValueChange={(value) => onCursoChange(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione un curso" />
          </SelectTrigger>
          <SelectContent>
            {funcionarioCursos.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Seleccionar Asignatura:</Label>
        <Select
          disabled={asignaturas.length === 0}
          value={asignaturaSeleccionada ?? ""}
          onValueChange={onAsignaturaChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione asignatura" />
          </SelectTrigger>
          <SelectContent>
            {asignaturas.map((a) => (
              <SelectItem
                key={a.asignatura_id}
                value={a.asignatura_id.toString()}
              >
                {a.asignatura_nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <RadioGroup
          value={String(selectedSemester)}
          onValueChange={(value) => onSemesterChange(Number(value))}
        >
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="semester-1" />
              <Label htmlFor="semester-1">1er Semestre</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="semester-2" />
              <Label htmlFor="semester-2">2do Semestre</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
