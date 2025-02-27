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
import { AsignaturaType, AsignaturaCursoResponseType } from "@/types/index.ts";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

import {
  eliminarAsignacion,
  asignarCurso,
  actualizarAsignacion,
  obtenerAsignacionesPorAsignatura,
} from "./asignaturaService";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/app/dashboard/toor/usuarios/types";
import { CursoApiResponseType } from "@/types";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  getAsignaturas,
  saveNewAsignatura,
  deleteAsignatura,
  saveEditAsignatura,
} from "@/services/asignaturasService";
import { Toaster } from "@/components/ui/toaster";
import { getCursos } from "@/services/cursosService";
import { getFuncionarios } from "@/services/funcionariosService";

const Asignaturas: React.FC = () => {
  /* refactirng */
  const [asignaturas, setAsignaturas] = useState<AsignaturaType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [loadingCursos, setLoadingCursos] = useState<boolean>(true);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);
  const [funcionarios, setFuncionarios] = useState<User[]>([]);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState<boolean>(true);
  const [errorFuncionarios, setErrorFuncionarios] = useState<string | null>(
    null
  );

  /* refactirng */

  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [isModalCursosOpen, setIsModalCursosOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newAsignatura, setNewAsignatura] = useState<{
    nombre: string;
    descripcion: string;
    indice: number;
    concepto: boolean;
    codigo_sige: number;
    nivel_educativo: number;
    es_comun: boolean;
  }>({
    nombre: "",
    descripcion: "",
    indice: 0,
    concepto: false,
    codigo_sige: 0,
    nivel_educativo: 0,
    es_comun: false,
  });
  const [currentAsignatura, setCurrentAsignatura] =
    useState<AsignaturaType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [asignaturaToDelete, setAsignaturaToDelete] =
    useState<AsignaturaType | null>(null);

  const [asignacionesActuales, setAsignacionesActuales] = useState<
    Map<number, number[]>
  >(new Map());
  const { toast } = useToast();

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  useEffect(() => {
    getAsignaturas()
      .then((response) => {
        if (response) {
          setAsignaturas(response.data);
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
    getCursos()
      .then((response) => {
        if (response) {
          setCursos(response.data);
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

  useEffect(() => {
    getFuncionarios()
      .then((response) => {
        if (response) {
          setFuncionarios(response.data);
        } else {
          setErrorFuncionarios("No se pudo cargar la información");
        }
      })
      .catch(() => {
        setErrorFuncionarios("No se pudo cargar la información");
      })
      .finally(() => {
        setLoadingFuncionarios(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    ); // Spinner de carga

  if (error)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    ); // Mensaje de error al cargar los datos de la API

  const handleSaveNewFromButton = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    await handleSaveNew();
  };

  const handleSaveNew = async () => {
    setSaving(true);
    setErrorMessage(null);

    // Validación de los campos
    if (!newAsignatura.nombre) {
      setErrorMessage("El nombre es obligatorio");
      setSaving(false);
      return;
    }

    try {
      // Guarda la nueva asignatura y obtiene la respuesta del backend
      const createdAsignatura = await saveNewAsignatura(newAsignatura);
      console.log("newAsignatura :", newAsignatura);
      console.log("Asignatura creada:", createdAsignatura);

      // Asegúrate de que la asignatura tenga la estructura correcta
      const newAsignaturaWithId = {
        asignatura_id: createdAsignatura.asignatura_id, // El ID devuelto por el backend
        nombre: createdAsignatura.nombre,
        descripcion: createdAsignatura.descripcion,
        indice: createdAsignatura.indice,
        concepto: createdAsignatura.concepto,
        codigo_sige: createdAsignatura.codigo_sige,
        nivel_educativo: createdAsignatura.nivel_educativo,
        es_comun: createdAsignatura.es_comun,
      };

      // Actualiza el estado de asignaturas (agrega la nueva asignatura con el ID)
      setAsignaturas([...asignaturas, newAsignaturaWithId]);

      // Muestra un mensaje de éxito
      toast({
        title: "Éxito",
        description: "Asignatura creada correctamente",
      });

      // Cierra el modal
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
      setNewAsignatura({
        ...newAsignatura,
        [name]: parsedValue,
      });
    } else {
      setCurrentAsignatura((curr) =>
        curr
          ? {
              ...curr,
              [name]: parsedValue,
            }
          : null
      );
    }
  };

  const handleCheckboxChange = (
    name: string,
    checked: boolean,
    form: "new" | "edit"
  ) => {
    if (form === "new") {
      setNewAsignatura({
        ...newAsignatura,
        [name]: checked,
      });
    } else {
      setCurrentAsignatura((curr) =>
        curr
          ? {
              ...curr,
              [name]: checked,
            }
          : null
      );
    }
  };

  const handleCloseNewModal = () => {
    setIsNewModalOpen(false);
    setNewAsignatura({
      nombre: "",
      descripcion: "",
      indice: 0,
      concepto: false,
      codigo_sige: 0,
      nivel_educativo: 0,
      es_comun: false,
    });
    setErrorMessage(null);
  };

  const handleEditClick = (asignatura: AsignaturaType) => {
    setCurrentAsignatura(asignatura);
    setIsModalEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsModalEditOpen(false);
    setCurrentAsignatura(null);
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
    if (!currentAsignatura) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      await saveEditAsignatura(
        currentAsignatura.asignatura_id,
        currentAsignatura
      );
      setAsignaturas((current) =>
        current.map((a) =>
          a.asignatura_id === currentAsignatura?.asignatura_id
            ? currentAsignatura
            : a
        )
      );
      toast({
        title: "Éxito",
        description: "Asignatura actualizada correctamente",
      });

      handleCloseEditModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (asignatura: AsignaturaType) => {
    setAsignaturaToDelete(asignatura);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!asignaturaToDelete) return;

    try {
      await deleteAsignatura(asignaturaToDelete.asignatura_id);
      setAsignaturas((current) =>
        current.filter(
          (a) => a.asignatura_id !== asignaturaToDelete?.asignatura_id
        )
      );
      toast({
        title: "Éxito",
        description: "Asignatura eliminada correctamente",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al eliminar la asignatura"
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setAsignaturaToDelete(null);
    }
  };

  const handleOpenCursosModal = (asignatura: AsignaturaType) => {
    setCurrentAsignatura(asignatura);
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

      response.data.forEach((asignacion: AsignaturaCursoResponseType) => {
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
    setCurrentAsignatura(null);
    //setAsignacionesPendientes([]);
    setAsignacionesActuales(new Map());
  };

  const handleCursoChange = async (cursoId: number, checked: boolean) => {
    if (!currentAsignatura) return;

    try {
      if (checked) {
        await asignarCurso(currentAsignatura.asignatura_id, cursoId, 1, token);
        // Actualizar estado local
        const newAsignaciones = new Map(asignacionesActuales);
        newAsignaciones.set(cursoId, [1]); // usuario_id 1 por defecto
        setAsignacionesActuales(newAsignaciones);
      } else {
        await eliminarAsignacion(
          currentAsignatura.asignatura_id,
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
    if (!currentAsignatura) return;

    try {
      const numericUsuarioId = Number(usuarioId);
      await actualizarAsignacion(
        currentAsignatura.asignatura_id,
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
        <h1 className="text-2xl font-bold">Asignaturas</h1>
        <div>
          <Button onClick={handleAddClick}>Agregar Asignatura</Button>
        </div>

        <Table>
          <TableCaption>Lista de asignaturas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Código SIGE</TableHead>
              <TableHead>Nivel Educativo</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Es Común</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {asignaturas?.map((asignatura) => (
              <TableRow key={asignatura.asignatura_id}>
                <TableCell>{asignatura.asignatura_id}</TableCell>
                <TableCell>
                  <strong>{asignatura.nombre}</strong>
                  <br />
                  <small>{asignatura.descripcion}</small>
                </TableCell>

                <TableCell>{asignatura.codigo_sige}</TableCell>
                <TableCell>
                  {asignatura.nivel_educativo === 1
                    ? "Básica"
                    : asignatura.nivel_educativo === 2
                    ? "Media"
                    : asignatura.nivel_educativo}
                </TableCell>
                <TableCell>{asignatura.concepto ? "Sí" : "No"}</TableCell>
                <TableCell>{asignatura.es_comun ? "Sí" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(asignatura)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(asignatura)}
                    >
                      Eliminar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCursosModal(asignatura)}
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

      {/* Modal para nueva asignatura */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Asignatura</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={newAsignatura.nombre}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                name="descripcion"
                value={newAsignatura.descripcion}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="indice">Índice</Label>
              <Input
                type="number"
                id="indice"
                name="indice"
                value={newAsignatura.indice}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codigo_sige">Código SIGE</Label>
              <Input
                type="number"
                id="codigo_sige"
                name="codigo_sige"
                value={newAsignatura.codigo_sige}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nivel_educativo">Nivel Educativo</Label>
              <Input
                type="number"
                id="nivel_educativo"
                name="nivel_educativo"
                value={newAsignatura.nivel_educativo}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="concepto"
                name="concepto"
                checked={newAsignatura.concepto}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("concepto", checked as boolean, "new")
                }
              />
              <Label htmlFor="concepto">Concepto</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="es_comun"
                name="es_comun"
                checked={newAsignatura.es_comun}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("es_comun", checked as boolean, "new")
                }
              />
              <Label htmlFor="es_comun">Es Común</Label>
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
            <DialogTitle>Editar Asignatura</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input
                id="edit-nombre"
                name="nombre"
                value={currentAsignatura?.nombre}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Input
                id="edit-descripcion"
                name="descripcion"
                value={currentAsignatura?.descripcion}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-indice">Índice</Label>
              <Input
                type="number"
                id="edit-indice"
                name="indice"
                value={currentAsignatura?.indice}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-codigo_sige">Código SIGE</Label>
              <Input
                type="number"
                id="edit-codigo_sige"
                name="codigo_sige"
                value={currentAsignatura?.codigo_sige}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-nivel_educativo">Nivel Educativo</Label>
              <Input
                type="number"
                id="edit-nivel_educativo"
                name="nivel_educativo"
                value={currentAsignatura?.nivel_educativo}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-concepto"
                name="concepto"
                checked={currentAsignatura?.concepto}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("concepto", checked as boolean, "edit")
                }
              />
              <Label htmlFor="edit-concepto">Concepto</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-es_comun"
                name="es_comun"
                checked={currentAsignatura?.es_comun}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("es_comun", checked as boolean, "edit")
                }
              />
              <Label htmlFor="edit-es_comun">Es Común</Label>
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
            <DialogTitle>
              Asignar Cursos - {currentAsignatura?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {loadingCursos && <Spinner />}
            {errorCursos && (
              <div className="text-red-500 text-sm">{errorCursos}</div>
            )}
            {cursos?.map((curso) => {
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
                    {loadingFuncionarios && <Spinner />}
                    {errorFuncionarios && (
                      <div className="text-red-500 text-sm">
                        {errorFuncionarios}
                      </div>
                    )}

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
                          {funcionarios?.map((usuario) => (
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
                          const usuario = funcionarios?.find(
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
              asignatura {asignaturaToDelete?.nombre}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </>
  );
};

export default Asignaturas;
