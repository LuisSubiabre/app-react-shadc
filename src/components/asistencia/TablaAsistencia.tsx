import { Estudiante } from "@/app/dashboard/toor/estudiantes/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AsistenciaState } from "@/types/asistencia";

interface TablaAsistenciaProps {
  estudiantes: Estudiante[];
  asistenciaState: AsistenciaState;
  onAsistenciaChange: (
    estudianteId: number,
    diasAsistidos: number,
    totalDias: number
  ) => void;
}

export const TablaAsistencia: React.FC<TablaAsistenciaProps> = ({
  estudiantes,
  asistenciaState,
  onAsistenciaChange,
}) => {
  return (
    <Table>
      <TableCaption>Registro de Asistencia</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Estudiante</TableHead>
          <TableHead>Días Asistidos</TableHead>
          <TableHead>Total Días</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {estudiantes.map((estudiante) => {
          const asistencia = asistenciaState[estudiante.id] || {
            dias_asistidos: 0,
            total_dias: 0,
          };

          return (
            <TableRow key={estudiante.id}>
              <TableCell>{estudiante.nombre}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={asistencia.dias_asistidos || ""}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    if (
                      newValue >= 0 &&
                      newValue <= (asistencia.total_dias || 31)
                    ) {
                      onAsistenciaChange(
                        estudiante.id,
                        newValue,
                        asistencia.total_dias
                      );
                    }
                  }}
                  min={0}
                  max={asistencia.total_dias || 31}
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={asistencia.total_dias || ""}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    if (newValue >= 0 && newValue <= 31) {
                      onAsistenciaChange(
                        estudiante.id,
                        Math.min(asistencia.dias_asistidos, newValue),
                        newValue
                      );
                    }
                  }}
                  min={0}
                  max={31}
                  className="w-20"
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
