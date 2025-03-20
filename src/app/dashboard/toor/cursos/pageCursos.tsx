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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/Spinner";
import {
  deleteCurso,
  getCursos,
  savaEditCurso,
  saveNewCurso,
} from "@/services/cursosService";
import { CursoApiResponseType, FuncionarioType, EstudianteType } from "@/types";
import { getFuncionarios } from "@/services/funcionariosService";
import {
  estudiantesCurso,
  saveEditEstudiante,
} from "@/services/estudiantesService";
import { useToast } from "@/hooks/use-toast";

const Cursos: React.FC = () => {
  const [isNewModalOpen, setisNewModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newCurso, setNewCurso] = useState<Partial<CursoApiResponseType>>({
    nombre: "",
    descripcion: "",
    indice: 0,
    codigo_ensenanza: 0,
    profesor_jefe_id: 1,
  });
  const [currentCurso, setCurrentCurso] = useState<CursoApiResponseType | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [cursoDelete, setCursoDelete] = useState<CursoApiResponseType | null>(
    null
  );

  /* refactoring */
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [funcionarios, setFuncionarios] = useState<FuncionarioType[]>([]);
  const [errorFuncionario, setErrorFuncionario] = useState<string | null>(null);
  const [loadingFuncionario, setLoadingFuncionario] = useState<boolean>(true);
  const { toast } = useToast();

  const [isEstudiantesModalOpen, setIsEstudiantesModalOpen] =
    useState<boolean>(false);
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState<boolean>(false);
  const [errorEstudiantes, setErrorEstudiantes] = useState<string | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] =
    useState<CursoApiResponseType | null>(null);

  useEffect(() => {
    getCursos()
      .then((response) => {
        if (response) {
          setCursos(response.data);
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
  }, [cursos]);

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

  const handleSaveNew = async () => {
    setSaving(true);
    setErrorMessage(null);
    console.log(newCurso);

    if (!newCurso.nombre) {
      setErrorMessage("El nombre es obligatorio");
      setSaving(false);
      return;
    }

    try {
      const createCurso = await saveNewCurso(newCurso);
      console.log(createCurso);

      // Asegúrate de que la respuesta del servidor incluya la jefatura
      const newCursoWithId: CursoApiResponseType = {
        id: createCurso.curso_id,
        nombre: createCurso.nombre,
        descripcion: createCurso.descripcion,
        jefatura: createCurso.jefatura, // Asegúrate de que esto esté en la respuesta
        email_jefatura: createCurso.email_jefatura, // Asegúrate de que esto esté en la respuesta
        indice: createCurso.indice,
        codigo_ensenanza: createCurso.codigo_ensenanza,
        profesor_jefe_id: createCurso.profesor_jefe_id,
      };

      // Actualiza el estado de los cursos
      setCursos([...cursos, newCursoWithId]);

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
    setisNewModalOpen(true);
  };

  const handleNewInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewCurso({
      ...newCurso,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseNewModal = () => {
    setisNewModalOpen(false);
    setNewCurso({
      nombre: "",
      descripcion: "",
      indice: 0,
      codigo_ensenanza: 0,
      profesor_jefe_id: 1,
    });
    setErrorMessage(null); // Limpiar mensaje de error
  };

  /* Logica Editar */

  const handleSaveEdit = async () => {
    if (!currentCurso) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      await savaEditCurso({
        ...currentCurso,
        nombre: currentCurso.nombre,
        descripcion: currentCurso.descripcion,
        indice: currentCurso.indice,
        codigo_ensenanza: currentCurso.codigo_ensenanza,
        profesor_jefe_id: currentCurso.profesor_jefe_id, // Verifica que este campo esté bien asignado
        id: currentCurso.id,
      });

      setCursos(
        cursos.map((curso) =>
          curso.id === currentCurso.id ? { ...curso, ...currentCurso } : curso
        )
      );

      setIsModalEditOpen(false); // Cerrar el modal después de guardar
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unknown error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (curso: CursoApiResponseType) => {
    setCurrentCurso(curso);
    setIsModalEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setCurrentCurso(null);
    setErrorMessage(null);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentCurso) {
      setCurrentCurso({
        ...currentCurso,
        [e.target.name]: e.target.value,
      });
    }
  };
  {
    /* Logica Editar */
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    );

  const handleDeleteClick = (curso: CursoApiResponseType) => {
    setCursoDelete(curso);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cursoDelete) return;

    try {
      await deleteCurso(cursoDelete.id);
      setCursos(cursos.filter((curso) => curso.id !== cursoDelete.id));
      toast({
        title: "Curso eliminado",
        description: `El cursoq ${cursoDelete.nombre} ha sido eliminado`,
      });
      setIsDeleteDialogOpen(false); // Cerrar el diálogo de confirmación
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error desconocido");
      }
    }
  };

  const handleVerEstudiantes = async (curso: CursoApiResponseType) => {
    setCursoSeleccionado(curso);
    setIsEstudiantesModalOpen(true);
    setLoadingEstudiantes(true);
    setErrorEstudiantes(null);
    setEstudiantes([]); // Reiniciamos el estado de estudiantes

    try {
      const response = await estudiantesCurso(curso.id);
      console.log(response);
      if (response) {
        setEstudiantes(response);
      } else {
        setErrorEstudiantes(
          "No se pudo cargar la información de los estudiantes"
        );
        setEstudiantes([]);
      }
    } catch (err) {
      setErrorEstudiantes("Error al cargar los estudiantes. " + err);
      setEstudiantes([]);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const exportarPDF = () => {
    if (!cursoSeleccionado || !estudiantes.length) return;

    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString();

    // Título
    doc.setFontSize(16);
    doc.text(`Lista de Estudiantes - ${cursoSeleccionado.nombre}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 14, 22);

    // Tabla
    const tableData = estudiantes.map((estudiante) => [
      estudiante.numlista?.toString() || "",
      estudiante.nombre || "",
      estudiante.rut || "",
      estudiante.email || "",
      estudiante.clave_email || "",
      estudiante.activo ? "Activo" : "Inactivo",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["N", "Nombre",  "RUT", "Email", "Clave", "Estado"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 8 }, // ID
        1: { cellWidth: 40 }, // Nombre
        2: { cellWidth: 20 }, // RUT
        3: { cellWidth: 75 }, // Email
        4: { cellWidth: 20 }, // Clave
        5: { cellWidth: 15 }, // Estado
      },
    });

    // Guardar el PDF
    doc.save(`estudiantes_${cursoSeleccionado.nombre}_${fecha}.pdf`);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(estudiantes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar el estado local
    setEstudiantes(items);

    // Actualizar el numlista de todos los estudiantes
    try {
      const updatedEstudiantes = items.map((estudiante, index) => {
        if (!estudiante.estudiante_id) {
          throw new Error("ID de estudiante no válido");
        }
        return {
          ...estudiante,
          id: estudiante.estudiante_id,
          numlista: index + 1,
        };
      });

      // Actualizar cada estudiante en el servidor
      await Promise.all(
        updatedEstudiantes.map((estudiante) => saveEditEstudiante(estudiante))
      );

      toast({
        title: "Orden actualizado",
        description:
          "El orden de los estudiantes ha sido actualizado correctamente",
      });
    } catch (error) {
      // Revertir el orden si hay un error
      setEstudiantes(estudiantes);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el orden de los estudiantes",
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
              Gestión de Cursos
            </h1>
            <p className="text-muted-foreground">
              Administra los cursos del sistema
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
            Nuevo Curso
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
                <TableHead className="w-[200px] font-semibold">
                  Jefatura
                </TableHead>
                <TableHead className="w-[150px] font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cursos && cursos.length > 0 ? (
                cursos.map((curso) => (
                  <TableRow
                    key={curso.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{curso.id}</TableCell>
                    <TableCell className="font-medium">
                      {curso.nombre}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {curso.jefatura}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVerEstudiantes(curso)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Users className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(curso)}
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
                          onClick={() => handleDeleteClick(curso)}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
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
                        No hay cursos disponibles
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Nuevo curso */}
      {isNewModalOpen && (
        <Dialog open={isNewModalOpen} onOpenChange={setisNewModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Agregar Nuevo Curso
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  onChange={handleNewInputChange}
                  placeholder="Ingresa el nombre del curso"
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
                  type="text"
                  onChange={handleNewInputChange}
                  placeholder="Ingresa una descripción"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jefatura" className="text-sm font-medium">
                  Jefatura
                </Label>
                {loadingFuncionario && <Spinner />}
                {funcionarios.length === 0 ? (
                  <p className="text-red-500">{errorFuncionario}</p>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      const selected = JSON.parse(value);
                      setNewCurso({
                        ...newCurso,
                        profesor_jefe_id: selected.id,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
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
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="indice" className="text-sm font-medium">
                  Índice
                </Label>
                <Input
                  id="indice"
                  name="indice"
                  type="number"
                  value={newCurso.indice}
                  onChange={handleNewInputChange}
                  placeholder="Ingrese el índice"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="codigo_ensenanza"
                  className="text-sm font-medium"
                >
                  Código Enseñanza
                </Label>
                <Input
                  id="codigo_ensenanza"
                  name="codigo_ensenanza"
                  type="number"
                  value={newCurso.codigo_ensenanza}
                  onChange={handleNewInputChange}
                  placeholder="Ingrese el código de enseñanza"
                  className="w-full"
                />
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
                onClick={handleSaveNew}
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
      )}

      {/* Editar curso */}
      {isModalEditOpen && currentCurso && (
        <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Editar Curso
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={currentCurso.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingresa el nombre del curso"
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
                  type="text"
                  value={currentCurso.descripcion}
                  onChange={handleInputChange}
                  placeholder="Ingresa una descripción"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jefatura" className="text-sm font-medium">
                  Jefatura
                </Label>
                <Select
                  value={JSON.stringify({
                    id: currentCurso.profesor_jefe_id,
                    nombre:
                      funcionarios?.find(
                        (user) => user.id === currentCurso.profesor_jefe_id
                      )?.nombre || "",
                  })}
                  onValueChange={(value) => {
                    const selected = JSON.parse(value);
                    setCurrentCurso({
                      ...currentCurso,
                      profesor_jefe_id: selected.id,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
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
              <div className="space-y-2">
                <Label htmlFor="indice" className="text-sm font-medium">
                  Índice
                </Label>
                <Input
                  id="indice"
                  name="indice"
                  type="number"
                  value={currentCurso.indice}
                  onChange={handleInputChange}
                  placeholder="Ingrese el índice"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="codigo_ensenanza"
                  className="text-sm font-medium"
                >
                  Código Enseñanza
                </Label>
                <Input
                  id="codigo_ensenanza"
                  name="codigo_ensenanza"
                  type="number"
                  value={currentCurso.codigo_ensenanza}
                  onChange={handleInputChange}
                  placeholder="Ingrese el código de enseñanza"
                  className="w-full"
                />
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
                onClick={handleSaveEdit}
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
      )}

      {/* Eliminar curso */}
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
              Esta acción no se puede deshacer. El curso{" "}
              <span className="font-medium text-foreground">
                {cursoDelete?.nombre}
              </span>{" "}
              se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-transparent hover:bg-muted">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Estudiantes */}
      <Dialog
        open={isEstudiantesModalOpen}
        onOpenChange={setIsEstudiantesModalOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Estudiantes del Curso {cursoSeleccionado?.nombre}
            </DialogTitle>
            {estudiantes.length > 0 && (
              <Button
                onClick={exportarPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </Button>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {loadingEstudiantes ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
              </div>
            ) : errorEstudiantes ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorEstudiantes}</AlertDescription>
              </Alert>
            ) : !estudiantes || estudiantes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay estudiantes en este curso
              </div>
            ) : (
              <div className="mt-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="estudiantes">
                    {(provided) => (
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow key="header">
                            <TableHead>N.</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Clave</TableHead>
                            <TableHead>RUT</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {estudiantes.map((estudiante, index) => (
                            <Draggable
                              key={estudiante.estudiante_id}
                              draggableId={
                                estudiante.estudiante_id?.toString() ||
                                index.toString()
                              }
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <TableRow
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${
                                    snapshot.isDragging ? "bg-muted" : ""
                                  }`}
                                >
                                  <TableCell>{estudiante.numlista}</TableCell>
                                  <TableCell>{estudiante.nombre}</TableCell>
                                  <TableCell>{estudiante.email}</TableCell>
                                  <TableCell>
                                    {estudiante.clave_email || "No disponible"}
                                  </TableCell>
                                  <TableCell>{estudiante.rut}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        estudiante.activo
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {estudiante.activo
                                        ? "Activo"
                                        : "Inactivo"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </TableBody>
                      </Table>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
};

export default Cursos;