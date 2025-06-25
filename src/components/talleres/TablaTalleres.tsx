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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  MapPin,
  Users,
  UserPlus,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  UserCheck,
  FileText,
} from "lucide-react";
import { getEstudiantesInscritos } from "@/services/talleresService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

interface TablaTalleresProps {
  talleres: TallerType[];
  onEditClick: (taller: TallerType) => void;
  onDeleteClick: (taller: TallerType) => void;
  onOpenCursosModal: (taller: TallerType) => void;
  onOpenAsistenciaModal: (taller: TallerType) => void;
}

export const TablaTalleres: React.FC<TablaTalleresProps> = ({
  talleres,
  onEditClick,
  onDeleteClick,
  onOpenCursosModal,
  onOpenAsistenciaModal,
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

  const exportarPDF = async (taller: TallerType) => {
    try {
      // Obtener los estudiantes inscritos para este taller
      const response = await getEstudiantesInscritos(taller.taller_id);
      const estudiantesInscritos = response.estudiantes || [];

      if (!estudiantesInscritos || estudiantesInscritos.length === 0) {
        alert("No hay estudiantes inscritos en este taller para exportar.");
        return;
      }

      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Título
      doc.setFontSize(16);
      doc.text("Lista de Estudiantes Inscritos", 14, 15);
      doc.setFontSize(12);
      doc.text(`Taller: ${taller.taller_nombre}`, 14, 25);
      doc.text(`Horario: ${taller.taller_horario}`, 14, 32);
      doc.text(
        `Lugar: ${taller.taller_ubicacion || "No especificado"}`,
        14,
        39
      );
      doc.text(`Total Inscritos: ${estudiantesInscritos.length}`, 14, 46);

      // Tabla
      const tableData = estudiantesInscritos.map(
        (estudiante: { estudiante_nombre: string; curso_nombre: string }) => [
          estudiante.estudiante_nombre,
          estudiante.curso_nombre,
        ]
      );

      autoTable(doc, {
        startY: 51,
        head: [["Estudiante", "Curso"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 80 },
        },
      });

      // Guardar el PDF
      doc.save(
        `estudiantes-inscritos-${taller.taller_nombre
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf`
      );
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert(
        "Ocurrió un error al exportar el PDF. Por favor, intente nuevamente."
      );
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
              <div className="flex items-center gap-2">
                {/* Botones principales - siempre visibles */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditClick(taller)}
                        className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar taller</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={`/dashboard/acles/talleres/inscritos/${taller.taller_id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver inscritos</p>
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
                        className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver cursos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Menú desplegable para acciones secundarias */}
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Más acciones</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onOpenAsistenciaModal(taller)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Asistencia
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => exportarPDF(taller)}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onDeleteClick(taller)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar taller
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
