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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, UserPlus } from "lucide-react";

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

  const getNivelBadge = (
    nivel: string
  ): { label: string; className: string } => {
    switch (nivel) {
      case "pre-basica":
        return {
          label: "Pre-básica",
          className:
            "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800",
        };
      case "basica":
        return {
          label: "Básica",
          className:
            "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800",
        };
      case "media":
        return {
          label: "Media",
          className:
            "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:hover:bg-purple-800",
        };
      default:
        return {
          label: nivel,
          className:
            "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
        };
    }
  };

  return (
    <Table>
      <TableCaption>Lista de talleres disponibles</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Información del Taller</TableHead>
          <TableHead className="w-[300px]">Detalles</TableHead>
          <TableHead className="w-[200px]">Cupos</TableHead>
          <TableHead className="w-[300px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {talleres?.map((taller) => (
          <TableRow
            key={taller.taller_id}
            className={cn(
              "transition-colors duration-200 hover:bg-muted/50",
              getBgColorByNivel(taller.taller_nivel)
            )}
          >
            <TableCell>
              <div className="space-y-1">
                <strong className="text-lg">{taller.taller_nombre}</strong>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{taller.profesor_nombre}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      getNivelBadge(taller.taller_nivel).className
                    )}
                  >
                    {getNivelBadge(taller.taller_nivel).label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{taller.taller_horario}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{taller.taller_ubicacion}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {taller.taller_cantidad_cupos} disponibles
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cupos totales del taller</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{taller.taller_cantidad_inscritos} inscritos</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditClick(taller)}
                      >
                        Editar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Modificar información del taller</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteClick(taller)}
                      >
                        Eliminar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Eliminar taller</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenCursosModal(taller)}
                      >
                        Cursos
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver cursos asociados</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={`/dashboard/acles/talleres/inscritos/${taller.taller_id}`}
                      >
                        <Button variant="outline" size="sm">
                          Inscritos
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver lista de inscritos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
