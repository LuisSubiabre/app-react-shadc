import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  BarChart3,
  FileText,
  Calendar,
  PieChart,
  Download,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/app/dashboard/toor/usuarios/types";
import { Toaster } from "@/components/ui/toaster.tsx";
import { TallerType } from "@/types/index.ts";
import { CursoApiResponseType } from "@/types/index.ts";
import LoadingErrorHandler from "@/components/LoadingErrorHandler.tsx";
import {
  deleteTaller,
  getTalleres,
  saveEditTaller,
  saveNewTaller,
  obtenerAsignaciones,
  eliminarAsignacion,
  asignarCurso,
} from "@/services/talleresService.ts";
import { getFuncionarios } from "@/services/funcionariosService.ts";
import { getCursos } from "@/services/cursosService.ts";
import { FiltrosTalleres } from "@/components/talleres/FiltrosTalleres";
import { TablaTalleres } from "@/components/talleres/TablaTalleres";
import { ModalCursos } from "@/components/talleres/ModalCursos";
import { ModalAsistencia } from "@/components/talleres/ModalAsistencia";
import { ModalAsistenciaPorMes } from "@/components/talleres/ModalAsistenciaPorMes";
import { ModalAsistenciaDetalle } from "@/components/talleres/ModalAsistenciaDetalle";
import { ModalPorcentajeAsistencia } from "@/components/talleres/ModalPorcentajeAsistencia";
import ModalEstadisticasAsistencia from "@/components/talleres/ModalEstadisticasAsistencia";

const AcleTalleres: React.FC = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [isModalCursosOpen, setIsModalCursosOpen] = useState<boolean>(false);
  const [isModalAsistenciaOpen, setIsModalAsistenciaOpen] =
    useState<boolean>(false);
  const [isModalAsistenciaPorMesOpen, setIsModalAsistenciaPorMesOpen] =
    useState<boolean>(false);
  const [isModalAsistenciaDetalleOpen, setIsModalAsistenciaDetalleOpen] =
    useState<boolean>(false);
  const [isModalPorcentajeAsistenciaOpen, setIsModalPorcentajeAsistenciaOpen] =
    useState<boolean>(false);
  const [
    isModalEstadisticasAsistenciaOpen,
    setIsModalEstadisticasAsistenciaOpen,
  ] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newTaller, setNewTaller] = useState<Partial<TallerType>>({
    taller_nombre: "",
    taller_descripcion: "",
    taller_horario: "",
    taller_nivel: "pre-basica",
    taller_cantidad_cupos: 10,
    taller_profesor_id: 1,
    taller_ubicacion: "sin ubicación",
  });

  const [currentTaller, setCurrentTaller] = useState<TallerType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [tallerToDelete, setTallerToDelete] = useState<TallerType | null>(null);

  const [asignacionesActuales, setAsignacionesActuales] = useState<
    Map<number, number[]>
  >(new Map());
  const { toast } = useToast();

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }

  const [talleres, setTalleres] = useState<TallerType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [funcionarios, setFuncionarios] = useState<User[]>([]);
  const [loadingFuncionario, setLoadingFuncionario] = useState<boolean>(true);
  const [errorFuncionario, setErrorFuncionario] = useState<string | null>(null);
  const [dataCursos, setDataCursos] = useState<CursoApiResponseType[]>([]);
  const [loadingCursos, setLoadingCursos] = useState<boolean>(true);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);

  const ordenarTalleresPorNivel = (talleres: TallerType[]) => {
    const ordenNiveles = {
      "pre-basica": 1,
      basica: 2,
      media: 3,
    };

    return [...talleres].sort((a, b) => {
      // Primero ordenamos por nivel
      const ordenPorNivel =
        ordenNiveles[a.taller_nivel as keyof typeof ordenNiveles] -
        ordenNiveles[b.taller_nivel as keyof typeof ordenNiveles];

      // Si son del mismo nivel, ordenamos por nombre
      if (ordenPorNivel === 0) {
        return a.taller_nombre.localeCompare(b.taller_nombre, "es", {
          sensitivity: "base",
        });
      }

      return ordenPorNivel;
    });
  };

  useEffect(() => {
    getTalleres()
      .then((response) => {
        if (response) {
          setTalleres(ordenarTalleresPorNivel(response.data));
        } else {
          setError("No se pudo cargar la información");
        }
      })
      .catch(() => {
        setError("No se pudo cargar la información");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    getFuncionarios()
      .then((response) => {
        if (response) {
          setFuncionarios(response.data);
        } else {
          setErrorFuncionario("No se pudo cargar la información");
        }
      })
      .catch(() => {
        setErrorFuncionario("No se pudo cargar la información");
      })
      .finally(() => {
        setLoadingFuncionario(false);
      });
  }, []);

  useEffect(() => {
    getCursos()
      .then((response) => {
        if (response) {
          setDataCursos(response.data);
        } else {
          setErrorCursos("No se pudo cargar la información");
        }
      })
      .catch(() => {
        setErrorCursos("No se pudo cargar la información");
      })
      .finally(() => {
        setLoadingCursos(false);
      });
  }, []);

  const handleSaveNewFromButton = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    await handleSaveNew(e as unknown as React.FormEvent<HTMLFormElement>);
  };

  const handleSaveNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    if (!newTaller.taller_nombre || !newTaller.taller_cantidad_cupos) {
      setErrorMessage("Falta completar campos obligatorios");
      setSaving(false);
      return;
    }

    try {
      console.log("Enviando nuevo taller:", newTaller);
      const response = await saveNewTaller(newTaller as TallerType);
      console.log("Respuesta del servidor:", response);

      if (response) {
        const talleresResponse = await getTalleres();
        if (talleresResponse) {
          setTalleres(ordenarTalleresPorNivel(talleresResponse.data));
        }

        toast({
          title: "Éxito",
          description: "Taller creado correctamente",
        });
        handleCloseNewModal();
      } else {
        throw new Error("No se recibió respuesta válida del servidor");
      }
    } catch (error) {
      console.error("Error al crear taller:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddClick = () => {
    setIsNewModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    form: "new" | "edit"
  ) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;

    if (form === "new") {
      setNewTaller({
        ...newTaller,
        [name]: parsedValue,
      });
    } else {
      setCurrentTaller((curr) =>
        curr
          ? {
              ...curr,
              [name]: parsedValue,
            }
          : null
      );
    }
  };

  const handleCloseNewModal = () => {
    setIsNewModalOpen(false);
    setNewTaller({
      taller_nombre: "",
      taller_descripcion: "",
      taller_horario: "",
      taller_nivel: "pre-basica",
      taller_cantidad_cupos: 10,
      taller_profesor_id: 1,
    });
    setErrorMessage(null);
  };

  const handleEditClick = (taller: TallerType) => {
    setCurrentTaller(taller);
    setIsModalEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsModalEditOpen(false);
    setCurrentTaller(null);
    setErrorMessage(null);
  };

  const handleSaveEditFromButton = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    await handleSaveEdit(e as unknown as React.FormEvent<HTMLFormElement>);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentTaller) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      await saveEditTaller(currentTaller);

      setTalleres((curr) =>
        ordenarTalleresPorNivel(
          curr.map((taller) =>
            taller.taller_id === currentTaller.taller_id
              ? {
                  ...currentTaller,
                  taller_nombre: currentTaller.taller_nombre || "",
                  taller_descripcion: currentTaller.taller_descripcion || "",
                  taller_horario: currentTaller.taller_horario || "",
                  taller_nivel: currentTaller.taller_nivel || "pre-basica",
                  taller_cantidad_cupos:
                    currentTaller.taller_cantidad_cupos || 10,
                  taller_profesor_id: currentTaller.taller_profesor_id || 1,
                }
              : taller
          )
        )
      );
      handleCloseEditModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (taller: TallerType) => {
    setTallerToDelete(taller);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tallerToDelete) return;

    try {
      await deleteTaller(tallerToDelete.taller_id);
      setTalleres((curr) =>
        curr.filter((taller) => taller.taller_id !== tallerToDelete.taller_id)
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al eliminar la asignatura"
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setTallerToDelete(null);
    }
  };

  const handleOpenCursosModal = (taller: TallerType) => {
    setCurrentTaller(taller);
    setIsModalCursosOpen(true);
    cargarAsignaciones(taller.taller_id);
  };

  const cargarAsignaciones = async (taller_id: number) => {
    try {
      const response = await obtenerAsignaciones(taller_id);
      const asignacionesMap = new Map();
      response.data.forEach((asignacion: { curso_id: number }) => {
        asignacionesMap.set(asignacion.curso_id, asignacion);
      });
      setAsignacionesActuales(asignacionesMap);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al cargar las asignaciones",
        variant: "destructive",
      });
    }
  };

  const handleCloseCursosModal = () => {
    setIsModalCursosOpen(false);
    setCurrentTaller(null);
    setAsignacionesActuales(new Map());
  };

  const handleCursoChange = async (cursoId: number, checked: boolean) => {
    if (!currentTaller) return;

    try {
      if (checked) {
        await asignarCurso(currentTaller.taller_id, cursoId);
        const newAsignaciones = new Map(asignacionesActuales);
        newAsignaciones.set(cursoId, [1]);
        setAsignacionesActuales(newAsignaciones);
      } else {
        await eliminarAsignacion(currentTaller.taller_id, cursoId);
        const newAsignaciones = new Map(asignacionesActuales);
        newAsignaciones.delete(cursoId);
        setAsignacionesActuales(newAsignaciones);
      }

      toast({
        title: "Éxito",
        description: checked
          ? "Curso asignado correctamente"
          : "Curso desasignado correctamente",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al eliminar la asignatura"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al gestionar el curso",
        variant: "destructive",
      });
    }
  };

  const handleOpenAsistenciaModal = (taller: TallerType) => {
    setCurrentTaller(taller);
    setIsModalAsistenciaOpen(true);
  };

  const handleCloseAsistenciaModal = () => {
    setIsModalAsistenciaOpen(false);
    setCurrentTaller(null);
  };

  return (
    <>
      <LoadingErrorHandler loading={loading} error={error}>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumbs />
          </div>
        </header>
        <Toaster />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h1 className="text-2xl font-bold">Talleres ACLE</h1>

          {/* Barra de herramientas mejorada */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Acciones principales */}
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAddClick}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Agregar Taller
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Crear un nuevo taller</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Menú de reportes */}
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Reportes
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={() => setIsModalAsistenciaPorMesOpen(true)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Calendar className="h-4 w-4" />
                          Asistencia por Mes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setIsModalAsistenciaDetalleOpen(true)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="h-4 w-4" />
                          Asistencia con Detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setIsModalPorcentajeAsistenciaOpen(true)
                          }
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <PieChart className="h-4 w-4" />% de Asistencia
                          Mensual
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setIsModalEstadisticasAsistenciaOpen(true)
                          }
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          Estadística Asistencia
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Acceder a reportes de asistencia</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <TablaTalleres
            talleres={talleres}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onOpenCursosModal={handleOpenCursosModal}
            onOpenAsistenciaModal={handleOpenAsistenciaModal}
          />
        </div>

        {/* Modal para nuevo taller */}
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Taller</DialogTitle>
            </DialogHeader>
            <FiltrosTalleres
              funcionarios={funcionarios}
              loadingFuncionario={loadingFuncionario}
              errorFuncionario={errorFuncionario}
              onFuncionarioChange={(value) => {
                const selected = JSON.parse(value);
                setNewTaller({
                  ...newTaller,
                  taller_profesor_id: selected.id,
                });
              }}
              newTaller={newTaller}
              handleInputChange={handleInputChange}
              isEditMode={false}
            />
            {errorMessage && (
              <div className="text-red-500 text-sm">{errorMessage}</div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseNewModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNewFromButton} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para editar taller */}
        <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Taller</DialogTitle>
            </DialogHeader>
            <FiltrosTalleres
              funcionarios={funcionarios}
              loadingFuncionario={loadingFuncionario}
              errorFuncionario={errorFuncionario}
              onFuncionarioChange={(value) => {
                const selected = JSON.parse(value);
                setCurrentTaller((curr) =>
                  curr
                    ? {
                        ...curr,
                        taller_profesor_id: selected.id,
                      }
                    : null
                );
              }}
              newTaller={currentTaller || newTaller}
              handleInputChange={handleInputChange}
              isEditMode={true}
            />
            {errorMessage && (
              <div className="text-red-500 text-sm">{errorMessage}</div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEditFromButton} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para asignar cursos */}
        <ModalCursos
          isOpen={isModalCursosOpen}
          onClose={handleCloseCursosModal}
          currentTaller={currentTaller}
          dataCursos={dataCursos}
          loadingCursos={loadingCursos}
          errorCursos={errorCursos}
          asignacionesActuales={asignacionesActuales}
          onCursoChange={handleCursoChange}
          errorMessage={errorMessage}
        />

        {/* Modal para informe de asistencia */}
        <ModalAsistencia
          isOpen={isModalAsistenciaOpen}
          onClose={handleCloseAsistenciaModal}
          taller={currentTaller}
        />

        {/* Modal para informe de asistencia por mes */}
        <ModalAsistenciaPorMes
          isOpen={isModalAsistenciaPorMesOpen}
          onClose={() => setIsModalAsistenciaPorMesOpen(false)}
        />

        {/* Modal para informe de asistencia con detalle */}
        <ModalAsistenciaDetalle
          isOpen={isModalAsistenciaDetalleOpen}
          onClose={() => setIsModalAsistenciaDetalleOpen(false)}
        />

        {/* Modal para informe de porcentaje de asistencia */}
        <ModalPorcentajeAsistencia
          isOpen={isModalPorcentajeAsistenciaOpen}
          onClose={() => setIsModalPorcentajeAsistenciaOpen(false)}
        />

        {/* Modal para informe de estadísticas de asistencia */}
        <ModalEstadisticasAsistencia
          isOpen={isModalEstadisticasAsistenciaOpen}
          onClose={() => setIsModalEstadisticasAsistenciaOpen(false)}
        />

        {/* Diálogo de confirmación para eliminar */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente
                la el taller y sus Inscritos:{" "}
                <strong> {tallerToDelete?.taller_nombre}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="text-gray-50 bg-red-500"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </LoadingErrorHandler>
    </>
  );
};

export default AcleTalleres;
