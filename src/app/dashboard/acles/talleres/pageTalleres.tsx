import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/app/dashboard/toor/usuarios/types";
import { Toaster } from "@/components/ui/toaster.tsx";
import { Link } from "react-router-dom";
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
import Spinner from "@/components/Spinner.tsx";
import { getCursos } from "@/services/cursosService.ts";

const AcleTalleres: React.FC = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [isModalCursosOpen, setIsModalCursosOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newTaller, setNewTaller] = useState<Partial<TallerType>>({
    taller_nombre: "",
    taller_descripcion: "",
    taller_horario: "",
    taller_nivel: "pre-basica",
    taller_cantidad_cupos: 10,
    taller_profesor_id: 1,
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

  /* refactor */
  const [talleres, setTalleres] = useState<TallerType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [funcionarios, setFuncionarios] = useState<User[]>([]);
  const [loadingFuncionario, setLoadingFuncionario] = useState<boolean>(true);
  const [errorFuncionario, setErrorFuncionario] = useState<string | null>(null);
  const [dataCursos, setDataCursos] = useState<CursoApiResponseType[]>([]);
  const [loadingCursos, setLoadingCursos] = useState<boolean>(true);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);

  useEffect(() => {
    getTalleres()
      .then((response) => {
        if (response) {
          setTalleres(response.data);
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

  /* refactor */

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
      const createTaller = await saveNewTaller(newTaller as TallerType);
      const newTallerWithId = {
        ...newTaller,
        taller_id: createTaller.taller_id,
      };
      setTalleres((curr) => [
        ...curr,
        {
          ...newTallerWithId,
          taller_nombre: newTallerWithId.taller_nombre || "",
          taller_descripcion: newTallerWithId.taller_descripcion || "",
          taller_horario: newTallerWithId.taller_horario || "",
          taller_nivel: newTallerWithId.taller_nivel || "pre-basica",
          taller_cantidad_cupos: newTallerWithId.taller_cantidad_cupos || 10,
          taller_profesor_id: newTallerWithId.taller_profesor_id || 1,
        },
      ]);
      toast({
        title: "Éxito",
        description: "Taller creado correctamente",
      });

      handleCloseNewModal();
    } catch (error) {
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
      console.log("newTaller", newTaller);
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
      const asignacionesMap = new Map(); // Mapa de asignaciones por curso_id
      response.data.forEach((asignacion: { curso_id: number }) => {
        // Usamos curso_id como clave para el mapa
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
    //setAsignacionesPendientes([]);
    setAsignacionesActuales(new Map());
  };

  const handleCursoChange = async (cursoId: number, checked: boolean) => {
    if (!currentTaller) return;

    try {
      if (checked) {
        await asignarCurso(currentTaller.taller_id, cursoId);
        const newAsignaciones = new Map(asignacionesActuales);
        newAsignaciones.set(cursoId, [1]); // usuario_id 1 por defecto
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
          <div>
            <Button onClick={handleAddClick}>Agregar Taller</Button>
          </div>

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
                        onClick={() => handleEditClick(taller)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(taller)}
                      >
                        Eliminar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCursosModal(taller)}
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
        </div>
        {/* Modal para nuevo taller */}
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Taller</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="taller_nombre"
                  name="taller_nombre"
                  value={newTaller.taller_nombre}
                  onChange={(e) => handleInputChange(e, "new")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="taller_descripcion"
                  name="taller_descripcion"
                  value={newTaller.taller_descripcion}
                  onChange={(e) => handleInputChange(e, "new")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="indice">Horario</Label>
                <Input
                  type="text"
                  id="taller_horario"
                  name="taller_horario"
                  value={newTaller.taller_horario}
                  onChange={(e) => handleInputChange(e, "new")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nivel">Nivel</Label>
                <Select
                  name="nivel"
                  defaultValue="pre-basica"
                  value={newTaller.taller_nivel?.toString()}
                  onValueChange={(value) =>
                    handleInputChange(
                      {
                        target: {
                          name: "taller_nivel",
                          value,
                          type: "select-one",
                        },
                      } as React.ChangeEvent<HTMLInputElement>,
                      "new"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-basica">Pre-Básica</SelectItem>
                    <SelectItem value="basica">Básica</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                {loadingFuncionario && <Spinner />}
                {errorFuncionario && (
                  <div className="text-red-500 text-sm">{errorFuncionario}</div>
                )}
                <Label htmlFor="descripcion">Monitor:</Label>
                <Select
                  onValueChange={(value) => {
                    const selected = JSON.parse(value); // De
                    setNewTaller({
                      ...newTaller,
                      taller_profesor_id: selected.id,
                    });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccione Monitor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Funcionarios</SelectLabel>
                      {funcionarios?.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={JSON.stringify({
                            id: user.id,
                            nombre: user.nombre,
                          })}
                        >
                          {user.nombre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cupos">Cantidad de cupos</Label>
                <Input
                  type="number"
                  id="taller_cantidad_cupos"
                  name="taller_cantidad_cupos"
                  value={newTaller.taller_cantidad_cupos}
                  onChange={(e) => handleInputChange(e, "new")}
                />
              </div>
            </div>
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
        {/* Modal para editar asignatura */}
        <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Taller</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="taller_nombre">Nombre</Label>
                <Input
                  id="taller_nombre"
                  name="taller_nombre"
                  value={currentTaller?.taller_nombre}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taller_descripcion">Descripción</Label>
                <Input
                  id="taller_descripcion"
                  name="taller_descripcion"
                  value={currentTaller?.taller_descripcion}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taller_horario">Horario</Label>
                <Input
                  id="taller_horario"
                  name="taller_horario"
                  value={currentTaller?.taller_horario}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taller_nivel">Nivel</Label>
                <Select
                  name="taller_nivel"
                  defaultValue="pre-basica"
                  value={currentTaller?.taller_nivel?.toString()}
                  onValueChange={(value) =>
                    handleInputChange(
                      {
                        target: {
                          name: "taller_nivel",
                          value,
                          type: "select-one",
                        },
                      } as React.ChangeEvent<HTMLInputElement>,
                      "edit"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-basica">Pre-Básica</SelectItem>
                    <SelectItem value="basica">Básica</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descripcion">Monitor</Label>
                {errorFuncionario && (
                  <div className="text-red-500 text-sm">{errorFuncionario}</div>
                )}
                <Select
                  value={JSON.stringify({
                    id: currentTaller?.taller_profesor_id,
                    nombre:
                      funcionarios?.find(
                        (user) => user.id === currentTaller?.taller_profesor_id
                      )?.nombre || "",
                  })}
                  onValueChange={(value) => {
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
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona Jefatura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Funcionarios</SelectLabel>
                      {funcionarios?.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={JSON.stringify({
                            id: user.id,
                            nombre: user.nombre,
                          })}
                        >
                          {user.nombre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taller_cantidad_cupos">Cantidad de cupos</Label>
                <Input
                  type="number"
                  id="taller_cantidad_cupos"
                  name="taller_cantidad_cupos"
                  value={currentTaller?.taller_cantidad_cupos}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
              </div>
            </div>
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
        <Dialog open={isModalCursosOpen} onOpenChange={setIsModalCursosOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Asignar Cursos</DialogTitle>
            </DialogHeader>
            <div className="font-semibold leading-none tracking-tight">
              Taller: {currentTaller?.taller_nombre}
            </div>
            <div className="grid gap-2">
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 max-h-64 overflow-y-auto">
                {loadingCursos && <Spinner />}
                {errorCursos && (
                  <div className="text-red-500 text-sm">{errorCursos}</div>
                )}
                {dataCursos?.map((curso) => {
                  const cursosAsignados = asignacionesActuales.get(curso.id);

                  const isSelected = cursosAsignados ? true : false;
                  console.log("curso", curso.id, " ", isSelected);
                  console.log("cursosAsignados", cursosAsignados);

                  return (
                    <div
                      key={curso.id}
                      className="space-y-3 border-b pb-3 last:border-0"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`curso-${curso.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleCursoChange(curso.id, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`curso-${curso.id}`}
                            className="font-medium"
                          >
                            {curso.nombre}
                          </Label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
              )}
              <Button variant="outline" onClick={handleCloseCursosModal}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
