import React from "react";
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
import { Pencil, Trash2, BookOpen, Calendar } from "lucide-react";

interface TablaTalleresProps {
  talleres: TallerType[];
  onEditClick: (taller: TallerType) => void;
  onDeleteClick: (taller: TallerType) => void;
  onOpenCursosModal: (taller: TallerType) => void;
  onOpenSesionesModal: (taller: TallerType) => void;
}

export const TablaTalleres: React.FC<TablaTalleresProps> = ({
  talleres,
  onEditClick,
  onDeleteClick,
  onOpenCursosModal,
  onOpenSesionesModal,
}) => {
  const getBgColorByNivel = (nivel: string): string => {
    switch (nivel) {
      case 'pre-basica':
        return 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50';
      case 'basica':
        return 'bg-green-50 hover:bg-green-100 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50';
      case 'media':
        return 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50';
      default:
        return '';
    }
  };

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
          <TableRow 
            key={taller.taller_id}
            className={cn(
              'transition-colors duration-200',
              getBgColorByNivel(taller.taller_nivel)
            )}
          >
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
                  size="icon"
                  onClick={() => onEditClick(taller)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenCursosModal(taller)}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenSesionesModal(taller)}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDeleteClick(taller)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
