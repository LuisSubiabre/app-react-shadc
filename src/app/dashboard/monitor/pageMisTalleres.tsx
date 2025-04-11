import React, { useEffect, useState } from "react";
import {
  getTalleresByMonitor,
  getEstudiantesInscritos,
} from "@/services/talleresService";
import {
  obtenerSesiones,
  eliminarSesion,
  crearSesion,
  obtenerEstudiantesSesion,
  modificarAsistencia,
} from "@/services/sesionesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface Estudiante {
  asistencia_id: number;
  sesion_id: number;
  estudiante_nombre: string;
  curso_nombre: string;
  asistio: boolean;
  fecha_registro: string;
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
  const [estado, setEstado] = useState<
    "realizado" | "no_realizado" | "suspendido"
  >("realizado");
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [sesionToDelete, setSesionToDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [sesionAsistencia, setSesionAsistencia] = useState<number | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [sesionActual, setSesionActual] = useState<Sesion | null>(null);
  const [tallerInscritos, setTallerInscritos] = useState<number | null>(null);
  const [estudiantesInscritos, setEstudiantesInscritos] = useState<
    {
      estudiante_id: number;
      estudiante_nombre: string;
      curso_nombre: string;
      estudiante_email: string;
    }[]
  >([]);
  const [loadingInscritos, setLoadingInscritos] = useState(false);
  const [correosCopiados, setCorreosCopiados] = useState(false);

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

  useEffect(() => {
    const fetchEstudiantes = async () => {
      if (!sesionAsistencia) return;

      setLoadingEstudiantes(true);
      try {
        const response = await obtenerEstudiantesSesion(sesionAsistencia);
        setEstudiantes(response);
        // Encontrar la sesión actual
        const sesion = sesiones.find((s) => s.sesion_id === sesionAsistencia);
        setSesionActual(sesion || null);
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los estudiantes inscritos",
          variant: "destructive",
        });
      } finally {
        setLoadingEstudiantes(false);
      }
    };

    fetchEstudiantes();
  }, [sesionAsistencia, sesiones]);

  useEffect(() => {
    const fetchEstudiantesInscritos = async () => {
      if (!tallerInscritos) return;

      setLoadingInscritos(true);
      try {
        const response = await getEstudiantesInscritos(tallerInscritos);
        setEstudiantesInscritos(response.estudiantes || []);
      } catch (error) {
        console.error("Error al obtener estudiantes inscritos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los estudiantes inscritos",
          variant: "destructive",
        });
      } finally {
        setLoadingInscritos(false);
      }
    };

    fetchEstudiantesInscritos();
  }, [tallerInscritos]);

  const formatearFecha = (fechaStr: string) => {
    try {
      // Convertir la fecha UTC a fecha local
      const fecha = new Date(fechaStr);
      // Ajustar la fecha sumando el offset de la zona horaria
      const offset = fecha.getTimezoneOffset();
      fecha.setMinutes(fecha.getMinutes() + offset);
      return format(fecha, "dd/MM/yyyy");
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
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
        description:
          "No se pudo eliminar la sesión. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleAgregarSesion = async () => {
    if (!expandedTaller) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const profesor_id = payload.id;

      // Obtener la hora actual
      const hora = format(new Date(), "HH:mm:ss");

      // Ajustar la fecha para mantener el día correcto
      const fechaAjustada = format(parseISO(fecha + "T00:00:00"), "yyyy-MM-dd");

      await crearSesion(
        expandedTaller,
        profesor_id,
        fechaAjustada,
        hora,
        estado
      );

      // Recargar las sesiones
      const response = await obtenerSesiones(expandedTaller);
      setSesiones(response);

      toast({
        title: "Sesión creada",
        description: "La sesión ha sido creada exitosamente",
        variant: "default",
      });

      // Resetear el formulario
      setFecha(format(new Date(), "yyyy-MM-dd"));
      setEstado("realizado");
    } catch (error) {
      console.error("Error al crear sesión:", error);
      toast({
        title: "Error",
        description:
          "No se pudo crear la sesión. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarAsistencia = async (
    asistencia_id: number,
    asistio: boolean
  ) => {
    try {
      const response = await modificarAsistencia(asistencia_id, asistio);
      if (response) {
        setEstudiantes(
          estudiantes.map((e) =>
            e.asistencia_id === asistencia_id ? { ...e, asistio } : e
          )
        );
        toast({
          title: "Asistencia actualizada",
          description:
            "El estado de asistencia ha sido actualizado correctamente",
          variant: "default",
        });
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
    } catch (error) {
      console.error("Error al modificar asistencia:", error);
      toast({
        title: "Error",
        description:
          "No se pudo actualizar la asistencia. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const copiarCorreos = () => {
    if (estudiantesInscritos.length === 0) return;

    const correos = estudiantesInscritos
      .map((estudiante) => estudiante.estudiante_email)
      .join(", ");

    navigator.clipboard
      .writeText(correos)
      .then(() => {
        setCorreosCopiados(true);
        setTimeout(() => setCorreosCopiados(false), 2000);
        toast({
          title: "Correos copiados",
          description:
            "Los correos electrónicos han sido copiados al portapapeles",
          variant: "default",
        });
      })
      .catch((error) => {
        console.error("Error al copiar al portapapeles:", error);
        toast({
          title: "Error",
          description: "No se pudieron copiar los correos al portapapeles",
          variant: "destructive",
        });
      });
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
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      setExpandedTaller(
                        expandedTaller === taller.taller_id
                          ? null
                          : taller.taller_id
                      )
                    }
                  >
                    Sesiones
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setTallerInscritos(taller.taller_id)}
                  >
                    Ver Inscritos
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
                      Taller:{" "}
                      {
                        talleres.find((t) => t.taller_id === expandedTaller)
                          ?.taller_nombre
                      }
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => setExpandedTaller(null)}
                    >
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
                      <Select
                        value={estado}
                        onValueChange={(
                          value: "realizado" | "no_realizado" | "suspendido"
                        ) => setEstado(value)}
                      >
                        <SelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realizado">Realizado</SelectItem>
                          <SelectItem value="no realizado">
                            No Realizado
                          </SelectItem>
                          <SelectItem value="suspendido">Suspendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={handleAgregarSesion}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Guardando...
                        </>
                      ) : (
                        "Agregar Sesión"
                      )}
                    </Button>
                  </div>

                  <div className="mt-8">
                    <h4 className="font-semibold mb-4">
                      Historial de Sesiones
                    </h4>
                    {loadingSesiones ? (
                      <div className="text-center py-4">
                        Cargando sesiones...
                      </div>
                    ) : sesiones.length > 0 ? (
                      <div className="space-y-4">
                        {sesiones.map((sesion) => (
                          <div
                            key={sesion.sesion_id}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium">
                                {formatearFecha(sesion.fecha)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Estado:{" "}
                                {sesion.estado.charAt(0).toUpperCase() +
                                  sesion.estado.slice(1)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={() =>
                                  setSesionToDelete(sesion.sesion_id)
                                }
                              >
                                Eliminar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() =>
                                  setSesionAsistencia(sesion.sesion_id)
                                }
                              >
                                Asistencia
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

      <Dialog
        open={!!sesionToDelete}
        onOpenChange={() => setSesionToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar esta sesión? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSesionToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                sesionToDelete && handleEliminarSesion(sesionToDelete)
              }
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!sesionAsistencia}
        onOpenChange={() => setSesionAsistencia(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Registro de Asistencia -{" "}
              {sesionActual ? formatearFecha(sesionActual.fecha) : ""}
            </DialogTitle>
            <DialogDescription>
              Lista de estudiantes inscritos en el taller:{" "}
              {
                talleres.find((t) => t.taller_id === expandedTaller)
                  ?.taller_nombre
              }
            </DialogDescription>
          </DialogHeader>

          {loadingEstudiantes ? (
            <div className="text-center py-4">Cargando estudiantes...</div>
          ) : estudiantes.length > 0 ? (
            <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {estudiantes.map((estudiante) => (
                  <div
                    key={estudiante.asistencia_id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      estudiante.asistio
                        ? "bg-green-50/50 border-green-200"
                        : "bg-red-50/50 border-red-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">
                        {estudiante.estudiante_nombre}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{estudiante.curso_nombre}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={estudiante.asistio}
                        onCheckedChange={(checked) => {
                          handleCambiarAsistencia(
                            estudiante.asistencia_id,
                            checked
                          );
                        }}
                        className={`${
                          estudiante.asistio ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          estudiante.asistio ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {estudiante.asistio ? "Presente" : "Ausente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No hay estudiantes inscritos
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!tallerInscritos}
        onOpenChange={() => setTallerInscritos(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Estudiantes Inscritos -{" "}
              {
                talleres.find((t) => t.taller_id === tallerInscritos)
                  ?.taller_nombre
              }
            </DialogTitle>
            <DialogDescription>
              Lista de estudiantes inscritos en el taller
            </DialogDescription>
          </DialogHeader>

          {loadingInscritos ? (
            <div className="text-center py-4">Cargando estudiantes...</div>
          ) : estudiantesInscritos.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copiarCorreos}
                  className="flex items-center gap-2"
                >
                  {correosCopiados ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copiado
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copiar Correos
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2">
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estudiantesInscritos.map((estudiante) => (
                        <TableRow key={estudiante.estudiante_id}>
                          <TableCell>
                            <div className="font-medium">
                              {estudiante.estudiante_nombre}
                            </div>
                          </TableCell>
                          <TableCell>{estudiante.curso_nombre}</TableCell>
                          <TableCell>{estudiante.estudiante_email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No hay estudiantes inscritos
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
};

export default MisTalleres;
