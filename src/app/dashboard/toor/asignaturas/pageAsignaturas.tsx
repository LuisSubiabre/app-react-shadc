import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  Table,
  TableBody,
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
      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestión de Asignaturas
            </h1>
            <p className="text-muted-foreground">
              Administra las asignaturas del sistema
            </p>
          </div>
          <Button
            onClick={handleAddClick}
            className="bg-primary hover:bg-primary/90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Nueva Asignatura
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[100px] font-semibold">ID</TableHead>
                <TableHead className="w-[200px] font-semibold">
                  Nombre
                </TableHead>
                <TableHead className="w-[150px] font-semibold">
                  Código SIGE
                </TableHead>
                <TableHead className="w-[150px] font-semibold">
                  Nivel Educativo
                </TableHead>
                <TableHead className="w-[100px] font-semibold">
                  Concepto
                </TableHead>
                <TableHead className="w-[100px] font-semibold">
                  Es Común
                </TableHead>
                <TableHead className="w-[150px] font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asignaturas && asignaturas.length > 0 ? (
                asignaturas.map((asignatura) => (
                  <TableRow
                    key={asignatura.asignatura_id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {asignatura.asignatura_id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{asignatura.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {asignatura.descripcion}
                        </div>
                      </div>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(asignatura)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(asignatura)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.021-2.09 2.201v.916"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenCursosModal(asignatura)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                            />
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-muted-foreground"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <p className="text-muted-foreground">
                        No hay asignaturas disponibles
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal para nueva asignatura */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Agregar Nueva Asignatura
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={newAsignatura.nombre}
                onChange={(e) => handleInputChange(e, "new")}
                placeholder="Ingresa el nombre de la asignatura"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-medium">
                Descripción
              </Label>
              <Input
                id="descripcion"
                name="descripcion"
                value={newAsignatura.descripcion}
                onChange={(e) => handleInputChange(e, "new")}
                placeholder="Ingresa una descripción"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="indice" className="text-sm font-medium">
                Índice
              </Label>
              <Input
                type="number"
                id="indice"
                name="indice"
                value={newAsignatura.indice}
                onChange={(e) => handleInputChange(e, "new")}
                placeholder="Ingresa el índice"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_sige" className="text-sm font-medium">
                Código SIGE
              </Label>
              <Input
                type="number"
                id="codigo_sige"
                name="codigo_sige"
                value={newAsignatura.codigo_sige}
                onChange={(e) => handleInputChange(e, "new")}
                placeholder="Ingresa el código SIGE"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivel_educativo" className="text-sm font-medium">
                Nivel Educativo
              </Label>
              <Input
                type="number"
                id="nivel_educativo"
                name="nivel_educativo"
                value={newAsignatura.nivel_educativo}
                onChange={(e) => handleInputChange(e, "new")}
                placeholder="Ingresa el nivel educativo"
                className="w-full"
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
              <Label htmlFor="concepto" className="text-sm font-medium">
                Concepto
              </Label>
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
              <Label htmlFor="es_comun" className="text-sm font-medium">
                Es Común
              </Label>
            </div>
          </form>

          {errorMessage && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseNewModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveNewFromButton}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
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
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar asignatura */}
      <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Editar Asignatura
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre" className="text-sm font-medium">
                Nombre
              </Label>
              <Input
                id="edit-nombre"
                name="nombre"
                value={currentAsignatura?.nombre}
                onChange={(e) => handleInputChange(e, "edit")}
                placeholder="Ingresa el nombre de la asignatura"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion" className="text-sm font-medium">
                Descripción
              </Label>
              <Input
                id="edit-descripcion"
                name="descripcion"
                value={currentAsignatura?.descripcion}
                onChange={(e) => handleInputChange(e, "edit")}
                placeholder="Ingresa una descripción"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-indice" className="text-sm font-medium">
                Índice
              </Label>
              <Input
                type="number"
                id="edit-indice"
                name="indice"
                value={currentAsignatura?.indice}
                onChange={(e) => handleInputChange(e, "edit")}
                placeholder="Ingresa el índice"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-codigo_sige" className="text-sm font-medium">
                Código SIGE
              </Label>
              <Input
                type="number"
                id="edit-codigo_sige"
                name="codigo_sige"
                value={currentAsignatura?.codigo_sige}
                onChange={(e) => handleInputChange(e, "edit")}
                placeholder="Ingresa el código SIGE"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-nivel_educativo"
                className="text-sm font-medium"
              >
                Nivel Educativo
              </Label>
              <Input
                type="number"
                id="edit-nivel_educativo"
                name="nivel_educativo"
                value={currentAsignatura?.nivel_educativo}
                onChange={(e) => handleInputChange(e, "edit")}
                placeholder="Ingresa el nivel educativo"
                className="w-full"
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
              <Label htmlFor="edit-concepto" className="text-sm font-medium">
                Concepto
              </Label>
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
              <Label htmlFor="edit-es_comun" className="text-sm font-medium">
                Es Común
              </Label>
            </div>
          </form>

          {errorMessage && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditFromButton}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
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
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para asignar cursos */}
      <Dialog open={isModalCursosOpen} onOpenChange={setIsModalCursosOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Asignar Cursos - {currentAsignatura?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loadingCursos && <Spinner />}
            {errorCursos && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {errorCursos}
              </div>
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
                      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
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
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-destructive"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <AlertDialogTitle className="text-xl font-semibold">
                ¿Estás seguro?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. La asignatura{" "}
              <span className="font-medium text-foreground">
                {asignaturaToDelete?.nombre}
              </span>{" "}
              se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-transparent hover:bg-muted">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
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
