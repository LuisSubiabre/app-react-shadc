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
  return (
    <Table>
      <TableCaption>Lista de talleres</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Horario</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Cupos</TableHead>
          <TableHead>Inscritos</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {talleres?.map((taller) => (
          <TableRow key={taller.taller_id}>
            <TableCell>
              <strong>{taller.taller_nombre}</strong>
              <br />
              <small>{taller.profesor_nombre}</small>
            </TableCell>
            <TableCell>{taller.taller_horario}</TableCell>
            <TableCell>{taller.taller_nivel}</TableCell>
            <TableCell>{taller.taller_cantidad_cupos}</TableCell>
            <TableCell>{taller.taller_cantidad_inscritos}</TableCell>
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
