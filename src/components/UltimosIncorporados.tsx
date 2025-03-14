import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getUltimosInscritos } from "@/services/infoService";
import { EstudianteType } from "@/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 5;

const UltimosIncorporados = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getUltimosInscritos()
      .then((response) => {
        console.log("Respuesta de getUltimosInscritos:", response);
        if (Array.isArray(response)) {
          setEstudiantes(response);
        } else if (response && Array.isArray(response.data)) {
          setEstudiantes(response.data);
        } else {
          console.error("Formato de respuesta inválido:", response);
          setError("No se pudo cargar la información de estudiantes");
          setEstudiantes([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar estudiantes:", err);
        setError("No se pudo cargar la información de estudiantes");
        setEstudiantes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: Date | string | undefined) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return "Fecha inválida";
      return format(date, "dd 'de' MMMM, yyyy", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const displayedEstudiantes = showAll
    ? estudiantes
    : estudiantes.slice(0, ITEMS_PER_PAGE);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl">
            Últimos estudiantes incorporados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando estudiantes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl">
            Últimos estudiantes incorporados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl">
          Últimos estudiantes incorporados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {estudiantes.length === 0 ? (
          <div className="flex justify-center items-center min-h-[200px] text-muted-foreground">
            No hay estudiantes registrados
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    <TableHead className="font-medium w-[40%]">
                      Estudiante
                    </TableHead>
                    <TableHead className="font-medium w-[35%]">
                      Registro
                    </TableHead>
                    <TableHead className="font-medium w-[25%]">Curso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedEstudiantes.map((estudiante) => (
                    <TableRow key={estudiante.estudiante_id || estudiante.id}>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {estudiante.estudiante_nombre || estudiante.nombre}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            {estudiante.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground break-all">
                            {formatDate(estudiante.fecha_creacion)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="secondary" className="ml-auto">
                          {estudiante.curso_nombre || "Sin asignar"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {estudiantes.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full max-w-xs"
                >
                  {showAll ? (
                    <div className="flex items-center gap-2">
                      <ChevronUp className="h-4 w-4" />
                      Mostrar menos
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4" />
                      Ver más estudiantes
                    </div>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UltimosIncorporados;
