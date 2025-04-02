import React, { useEffect, useState } from "react";
import { getTalleresByMonitor } from "@/services/talleresService";
import { obtenerSesiones, eliminarSesion } from "@/services/sesionesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Taller {
  taller_id: number;
  taller_nombre: string;
  taller_descripcion: string;
  taller_horario: string;
  taller_nivel: string;
  taller_cantidad_cupos: number;
  taller_cantidad_inscritos: number;
  taller_ubicacion: string;
  profesor_nombre: string;
}

interface Sesion {
  sesion_id: number;
  taller_id: number;
  profesor_id: number;
  fecha: string;
  hora: string;
  estado: string;
  fecha_creacion: string;
  taller_nombre: string;
  profesor_nombre: string;
}

interface TalleresResponse {
  message: string;
  talleres: Taller[];
}

const MisTalleres: React.FC = () => {
  const { toast } = useToast();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTaller, setExpandedTaller] = useState<number | null>(null);
  const [fecha, setFecha] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [estado, setEstado] = useState<"realizado" | "no_realizado" | "suspendido">("realizado");
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [sesionToDelete, setSesionToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchTalleres = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId = payload.id;
          const response: TalleresResponse = await getTalleresByMonitor(userId);
          setTalleres(response.talleres);
        }
      } catch (error) {
        console.error("Error al obtener talleres:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTalleres();
  }, []);

  useEffect(() => {
    const fetchSesiones = async () => {
      if (!expandedTaller) return;
      
      setLoadingSesiones(true);
      try {
        const response = await obtenerSesiones(expandedTaller);
        setSesiones(response);
      } catch (error) {
        console.error("Error al obtener sesiones:", error);
      } finally {
        setLoadingSesiones(false);
      }
    };

    fetchSesiones();
  }, [expandedTaller]);

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return format(fecha, "dd/MM/yyyy");
  };

  const handleEliminarSesion = async (sesionId: number) => {
    try {
      await eliminarSesion(sesionId);
      // Recargar las sesiones después de eliminar
      const response = await obtenerSesiones(expandedTaller!);
      setSesiones(response);
      setSesionToDelete(null); // Cerrar el diálogo
      
      toast({
        title: "Sesión eliminada",
        description: "La sesión ha sido eliminada exitosamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al eliminar sesión:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la sesión. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Cargando talleres...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Mis Talleres</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talleres.map((taller) => (
            <Card
              key={taller.taller_id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle>{taller.taller_nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{taller.taller_descripcion}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Horario: {taller.taller_horario}
                  </p>
                  <p className="text-sm text-gray-500">
                    Nivel: {taller.taller_nivel}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ubicación: {taller.taller_ubicacion}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cupos: {taller.taller_cantidad_inscritos}/
                    {taller.taller_cantidad_cupos}
                  </p>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setExpandedTaller(expandedTaller === taller.taller_id ? null : taller.taller_id)}
                  >
                    Sesiones
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {expandedTaller && (
          <div className="mt-8">
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      Taller: {talleres.find(t => t.taller_id === expandedTaller)?.taller_nombre}
                    </h3>
                    <Button variant="outline" onClick={() => setExpandedTaller(null)}>
                      Cerrar
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="fecha" className="text-sm font-medium">
                        Fecha de la sesión
                      </label>
                      <Input
                        id="fecha"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Estado de la sesión
                      </label>
                      <Select value={estado} onValueChange={(value: "realizado" | "no_realizado" | "suspendido") => setEstado(value)}>
                        <SelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realizado">Realizado</SelectItem>
                          <SelectItem value="no_realizado">No Realizado</SelectItem>
                          <SelectItem value="suspendido">Suspendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full sm:w-auto">
                      Agregar Sesión
                    </Button>
                  </div>

                  <div className="mt-8">
                    <h4 className="font-semibold mb-4">Historial de Sesiones</h4>
                    {loadingSesiones ? (
                      <div className="text-center py-4">Cargando sesiones...</div>
                    ) : sesiones.length > 0 ? (
                      <div className="space-y-4">
                        {sesiones.map((sesion) => (
                          <div
                            key={sesion.sesion_id}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium">
                                {formatearFecha(sesion.fecha)} - {sesion.hora}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Estado: {sesion.estado.charAt(0).toUpperCase() + sesion.estado.slice(1)}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(sesion.fecha_creacion), "dd/MM/yyyy HH:mm")}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-8">
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={() => setSesionToDelete(sesion.sesion_id)}
                              >
                                Eliminar
                              </Button>
                              <Button variant="outline" size="sm" className="h-8">
                                Ver
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No hay sesiones registradas
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={!!sesionToDelete} onOpenChange={() => setSesionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar esta sesión? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSesionToDelete(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => sesionToDelete && handleEliminarSesion(sesionToDelete)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
};

export default MisTalleres;
