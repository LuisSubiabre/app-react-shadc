import React, { useState } from "react";
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
import { Taller } from "./typeTaller";
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
import { useFetch } from "@/hooks/useFetch";
import {
  saveNew,
  saveEdit,
  deleteTaller,
  eliminarAsignacion,
  asignarCurso,
  actualizarAsignacion,
  obtenerAsignacionesPorAsignatura,
} from "./tallerService.ts";
import { useToast } from "@/hooks/use-toast";
import { Curso } from "@/app/dashboard/toor/cursos/types";
import { User } from "@/app/dashboard/toor/usuarios/types";
//import { AsignacionPendiente } from "./types";

const AcleTalleres: React.FC = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [isModalCursosOpen, setIsModalCursosOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newTaller, setNewTaller] = useState<Partial<Taller>>({
    taller_nombre: "",
    taller_descripcion: "",
    taller_horario: "xx",
    taller_nivel: "pre-basica",
    taller_cantidad_cupos: 10,
    taller_profesor_id: 1,
  });

  const [currentTaller, setCurrentTaller] = useState<Taller | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [tallerToDelete, setTallerToDelete] = useState<Taller | null>(null);

  const [asignacionesActuales, setAsignacionesActuales] = useState<
    Map<number, number[]>
  >(new Map());
  const { toast } = useToast();

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  /* fetchs */
  const { data, loading, error, refetch } = useFetch<Taller[]>(
    "talleres",
    token
  );
  const { data: dataCursos } = useFetch<Curso[]>("cursos", token);
  const { data: dataUsuarios } = useFetch<User[]>("usuarios", token);

  if (loading) return <div className="spinner">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

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

    console.log(newTaller);

    if (!newTaller.taller_nombre || !newTaller.taller_cantidad_cupos) {
      setErrorMessage("Falta completar campos obligatorios");
      setSaving(false);
      return;
    }

    try {
      //const newTallerData: Partial<Taller> = { ...newTaller };

      await saveNew(newTaller, token);
      refetch();
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

  const handleEditClick = (taller: Taller) => {
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
      await saveEdit(token, currentTaller);

      refetch();
      handleCloseEditModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (taller: Taller) => {
    setTallerToDelete(taller);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tallerToDelete) return;

    try {
      await deleteTaller(token, tallerToDelete);
      refetch();
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

  const handleOpenCursosModal = (asignatura: Asignatura) => {
    setCurrentTaller(asignatura);
    setIsModalCursosOpen(true);
    cargarAsignaciones(asignatura.asignatura_id);
  };

  const cargarAsignaciones = async (asignaturaId: number) => {
    try {
      const response = await obtenerAsignacionesPorAsignatura(
        asignaturaId,
        token
      );
      const asignacionesMap = new Map();

      response.data.forEach((asignacion: AsignaturaCursoResponse) => {
        asignacionesMap.set(asignacion.curso_id, [asignacion.profesor_id]);
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
        await asignarCurso(currentTaller.asignatura_id, cursoId, 1, token);
        // Actualizar estado local
        const newAsignaciones = new Map(asignacionesActuales);
        newAsignaciones.set(cursoId, [1]); // usuario_id 1 por defecto
        setAsignacionesActuales(newAsignaciones);
      } else {
        await eliminarAsignacion(
          currentTaller.asignatura_id,
          cursoId,
          1,
          token
        );
        // Actualizar estado local
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

  const handleUsuariosChange = async (cursoId: number, usuarioId: string) => {
    if (!currentTaller) return;

    try {
      const numericUsuarioId = Number(usuarioId);
      await actualizarAsignacion(
        currentTaller.asignatura_id,
        cursoId,
        numericUsuarioId,
        token
      );

      // Actualizar estado local
      const newAsignaciones = new Map(asignacionesActuales);
      newAsignaciones.set(cursoId, [numericUsuarioId]);
      setAsignacionesActuales(newAsignaciones);

      toast({
        title: "Éxito",
        description: "Usuario asignado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al asignar usuario",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
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
            {data?.map((taller) => (
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
                  <SelectValue placeholder="Selecciona Jefatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Funcionarios</SelectLabel>
                    {dataUsuarios?.map((user) => (
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
              <Label htmlFor="descripcion">Jefatura</Label>
              <Select
                value={JSON.stringify({
                  id: currentTaller?.taller_profesor_id,
                  nombre:
                    dataUsuarios?.find(
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
                    {dataUsuarios?.map((user) => (
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

              {/* <select
                              id="profesor_jefe_id"
                              name="profesor_jefe_id"
                              value={currentCurso.profesor_jefe_id}
                              onChange={handleSelectChange}
                              className="form-select"
                            >
                              <option value="" disabled>
                                Seleccionar profesor jefe
                              </option>
                              {dataUsuarios?.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.nombre}
                                </option>
                              ))}
                            </select> */}
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
            <DialogTitle>Asignar Cursos - {currentTaller?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {dataCursos?.map((curso) => {
              const usuariosAsignados =
                asignacionesActuales.get(curso.id) || [];
              const isSelected = usuariosAsignados.length > 0;
              const currentUserId = usuariosAsignados[0]?.toString();

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

                    {isSelected && (
                      <Select
                        value={currentUserId}
                        onValueChange={(value) =>
                          handleUsuariosChange(curso.id, value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataUsuarios?.map((usuario) => (
                            <SelectItem
                              key={usuario.id}
                              value={usuario.id.toString()}
                            >
                              {usuario.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {isSelected && (
                    <div className="ml-6">
                      <div className="flex flex-wrap gap-2">
                        {usuariosAsignados.map((userId) => {
                          const usuario = dataUsuarios?.find(
                            (u) => u.id === userId
                          );
                          return (
                            usuario && (
                              <div
                                key={usuario.id}
                                className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded text-sm"
                              >
                                <span>{usuario.nombre}</span>
                              </div>
                            )
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
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
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              el taller y sus Inscritos:{" "}
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
    </>
  );
};

export default AcleTalleres;
