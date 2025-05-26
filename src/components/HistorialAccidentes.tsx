import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { getAccidenteByEstudiante } from "@/services/inspectoriaService";

interface HistorialAccidentesProps {
  estudianteId: number | undefined;
}

interface Accidente {
  accidente_id: number;
  fecha_registro: string;
  fecha_accidente: string;
}

export function HistorialAccidentes({ estudianteId }: HistorialAccidentesProps) {
  const [accidentes, setAccidentes] = useState<Accidente[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarAccidentes = async () => {
    if (!estudianteId) {
      setError("ID de estudiante no válido");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getAccidenteByEstudiante(estudianteId);
      setAccidentes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar accidentes:", error);
      setError("Error al cargar el historial de accidentes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      cargarAccidentes();
    } else {
      // Limpiar los datos cuando se cierra el modal
      setAccidentes([]);
      setError(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      // Crear la fecha y ajustar a la zona horaria local
      const fechaObj = new Date(fecha);
      
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }

      // Obtener los componentes de la fecha en la zona horaria local
      const dia = fechaObj.getUTCDate().toString().padStart(2, '0');
      const mes = (fechaObj.getUTCMonth() + 1).toString().padStart(2, '0');
      const año = fechaObj.getUTCFullYear();
      
      return `${dia}/${mes}/${año}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full"
          disabled={!estudianteId}
        >
          Historial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historial de Accidentes</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : accidentes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay registros de accidentes
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Fecha Accidente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accidentes.map((accidente) => (
                  <TableRow key={accidente.accidente_id}>
                    <TableCell>{accidente.accidente_id}</TableCell>
                    <TableCell>{formatearFecha(accidente.fecha_registro)}</TableCell>
                    <TableCell>{formatearFecha(accidente.fecha_accidente)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 