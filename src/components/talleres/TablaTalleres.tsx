import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TallerType } from "@/types/index.ts";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TablaTalleresProps {
  talleres: TallerType[];
  onEditClick: (taller: TallerType) => void;
  onDeleteClick: (taller: TallerType) => void;
  onOpenCursosModal: (taller: TallerType) => void;
}

export const TablaTalleres: React.FC<TablaTalleresProps> = ({
  talleres,
  onEditClick,
  onDeleteClick,
  onOpenCursosModal,
}) => {
  const getBgColorByNivel = (nivel: string): string => {
    switch (nivel) {
      case "pre-basica":
        return "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50";
      case "basica":
        return "bg-green-50 hover:bg-green-100 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50";
      case "media":
        return "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50";
      default:
        return "";
    }
  };

  return (
    <Table>
      <TableCaption>Lista de talleres</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Información del Taller</TableHead>
          <TableHead>Detalles</TableHead>
          <TableHead>Cupos</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {talleres?.map((taller) => (
          <TableRow
            key={taller.taller_id}
            className={cn(
              "transition-colors duration-200",
              getBgColorByNivel(taller.taller_nivel)
            )}
          >
            <TableCell>
              <strong>{taller.taller_nombre}</strong>
              <br />
              <small>{taller.profesor_nombre}</small>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Nivel:</span>{" "}
                  {taller.taller_nivel}
                </div>
                <div>
                  <span className="font-medium">Horario:</span>{" "}
                  {taller.taller_horario}
                </div>
                <div>
                  <span className="font-medium">Ubicación:</span>{" "}
                  {taller.taller_ubicacion}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Disponibles:</span>{" "}
                  {taller.taller_cantidad_cupos}
                </div>
                <div>
                  <span className="font-medium">Inscritos:</span>{" "}
                  {taller.taller_cantidad_inscritos}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(taller)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteClick(taller)}
                >
                  Eliminar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenCursosModal(taller)}
                >
                  Cursos
                </Button>
                <Link
                  to={`/dashboard/acles/talleres/inscritos/${taller.taller_id}`}
                >
                  <Button variant="outline" size="sm">
                    Inscritos
                  </Button>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
