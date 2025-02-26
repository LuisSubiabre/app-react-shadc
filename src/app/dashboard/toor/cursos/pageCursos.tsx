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
import { AlertCircle } from "lucide-react";

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
import { CursoApiResponseType, FuncionarioType } from "@/types";
import { getFuncionarios } from "@/services/funcionariosService";
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

  /* refactoring */

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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <Button onClick={handleAddClick}>Nuevo Curso</Button>
        </div>
        <Table>
          <TableCaption>Lista de cursos</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[100px]">Nombre</TableHead>
              <TableHead className="w-[100px]">Jefatura</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cursos && cursos.length > 0 ? (
              cursos.map((curso) => (
                <TableRow key={curso.id}>
                  <TableCell className="font-medium">{curso.id}</TableCell>
                  <TableCell>{curso.nombre}</TableCell>
                  <TableCell>{curso.jefatura}</TableCell>
                  <TableCell>
                    <Button
                      className="mr-2"
                      onClick={() => handleEditClick(curso)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </Button>
                    <Button onClick={() => handleDeleteClick(curso)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.021-2.09 2.201v.916"
                        />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No hay cursos disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Nuevo */}
      {isNewModalOpen && (
        <Dialog open={isNewModalOpen} onOpenChange={setisNewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Curso</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    onChange={handleNewInputChange}
                    placeholder="Nombre del curso"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    name="descripcion"
                    type="text"
                    onChange={handleNewInputChange}
                    placeholder="Ingresa descripción"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Jefatura</Label>
                  {loadingFuncionario && <Spinner />}
                  {funcionarios.length === 0 ? (
                    <p className="text-red-500">{errorFuncionario}</p>
                  ) : (
                    <Select
                      onValueChange={(value) => {
                        const selected = JSON.parse(value); // De
                        setNewCurso({
                          ...newCurso,
                          profesor_jefe_id: selected.id,
                        });
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
                  )}
                </div>
                <div>
                  <Label htmlFor="descripcion">Indice</Label>
                  <Input
                    id="indice"
                    name="indice"
                    type="number"
                    value={newCurso.indice}
                    onChange={handleNewInputChange}
                    placeholder="Ingrese el índice"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Cod. Enseñanza</Label>
                  <Input
                    id="codigo_ensenanza"
                    name="codigo_ensenanza"
                    type="number"
                    value={newCurso.codigo_ensenanza}
                    onChange={handleNewInputChange}
                    placeholder="Ingrese el código de enseñanza"
                  />
                </div>
              </div>
            </form>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseNewModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNew} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Editar */}
      <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          {currentCurso && (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={currentCurso.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  value={currentCurso.descripcion}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Jefatura</Label>

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
              <div className="mb-4">
                <Label htmlFor="indice">Índice</Label>
                <Input
                  id="indice"
                  name="indice"
                  type="number"
                  value={currentCurso.indice}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="codigo_ensenanza">Código Enseñanza</Label>
                <Input
                  id="codigo_ensenanza"
                  name="codigo_ensenanza"
                  type="number"
                  value={currentCurso.codigo_ensenanza}
                  onChange={handleInputChange}
                />
              </div>

              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseEditModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El curso{" "}
              <b>{cursoDelete?.nombre}</b> se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </>
  );
};

export default Cursos;
