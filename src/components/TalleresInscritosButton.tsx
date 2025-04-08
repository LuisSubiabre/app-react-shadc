import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obtenerTalleresDeEstudiante } from "@/services/talleresService";
import { TallerInscritoType } from "@/types";
import { BookOpen } from "lucide-react";
import Spinner from "@/components/Spinner";

interface TalleresInscritosButtonProps {
  estudianteId: number;
  estudianteNombre?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const TalleresInscritosButton = ({
  estudianteId,
  estudianteNombre,
  variant = "outline",
  size = "sm",
  className,
}: TalleresInscritosButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [talleres, setTalleres] = useState<TallerInscritoType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar los talleres cuando se abre el modal
  useEffect(() => {
    if (isOpen && estudianteId) {
      fetchTalleres();
    }
  }, [isOpen, estudianteId]);

  const fetchTalleres = async () => {
    if (!estudianteId) {
      console.error("No se proporcionó un ID de estudiante válido");
      setError("ID de estudiante no válido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Solicitando talleres para el estudiante ID:", estudianteId);
      const response = await obtenerTalleresDeEstudiante(estudianteId);
      console.log("Respuesta completa de talleres:", response);

      if (response && response.talleres && Array.isArray(response.talleres)) {
        console.log("Talleres encontrados:", response.talleres.length);
        setTalleres(response.talleres);
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setError("No se pudieron cargar los talleres");
        setTalleres([]);
      }
    } catch (error) {
      console.error("Error al obtener talleres:", error);
      setError("Error al cargar los talleres. Por favor, intente nuevamente.");
      setTalleres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          title="Ver talleres inscritos"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Talleres</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Talleres inscritos{" "}
            {estudianteNombre ? `de ${estudianteNombre}` : ""}
          </DialogTitle>
          <DialogDescription>
            Lista de talleres en los que está inscrito el estudiante
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : talleres.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            El estudiante no está inscrito en ningún taller
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Taller</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Cupos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {talleres.map((taller) => (
                  <TableRow key={taller.taller_id}>
                    <TableCell className="font-medium">
                      {taller.taller_nombre}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {taller.taller_descripcion}
                    </TableCell>
                    <TableCell>{taller.taller_horario}</TableCell>
                    <TableCell>{taller.ubicacion}</TableCell>
                    <TableCell>
                      {taller.cantidad_inscritos}/{taller.cantidad_cupos}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TalleresInscritosButton;
