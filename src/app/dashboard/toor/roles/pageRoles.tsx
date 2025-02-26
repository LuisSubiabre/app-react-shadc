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
import { RolType } from "@/types/index.ts"; // Importa la interfaz desde el archivo types.ts
//import { Rol } from "./types/"; // Importa la interfaz desde el archivo types.ts
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
import { Toaster } from "@/components/ui/toaster";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  deleteRol,
  getRoles,
  savaEditRol,
  saveNewRol,
} from "@/services/rolesService";
import { useToast } from "@/hooks/use-toast";

const Roles: React.FC = () => {
  const [isNewRolModalOpen, setisNewModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newRol, setNewRol] = useState<Partial<RolType>>({
    nombre: "",
    descripcion: "",
  });
  const [currentRol, setcurrentRol] = useState<RolType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [rolToDelete, setRolToDelete] = useState<RolType | null>(null);
  const { toast } = useToast();

  const [roles, setRoles] = useState<RolType[]>([]); // Lista de roles
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  //const token = getTokenFromContext.authToken;

  //const { data, loading, error, refetch } = useFetch<Rol[]>("roles", token); // Trae los datos de la API

  useEffect(() => {
    getRoles()
      .then((response) => {
        if (response) {
          setRoles(response.data);
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

    if (!newRol.nombre) {
      setErrorMessage("El nombre es obligatorio");
      setSaving(false);
      return;
    }

    try {
      const createdRol = await saveNewRol(newRol); // Guarda el nuevo rol y obtén la respuesta del backend

      // Asegúrate de que el objeto del rol tenga la estructura correcta
      const newRolWithId = {
        id: createdRol.rol_id, // Usa el ID devuelto por el backend
        nombre: createdRol.nombre,
        descripcion: createdRol.descripcion,
      };

      setRoles([...roles, newRolWithId]); // Agrega el nuevo rol con el ID generado por el backend
      handleCloseNewModal(); // Cierra el modal solo si no hay error
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

  const handleNewInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRol({
      ...newRol,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseNewModal = () => {
    setisNewModalOpen(false);
    setNewRol({ nombre: "", descripcion: "" });
    setErrorMessage(null); // Limpiar mensaje de error
  };

  /* Logica Editar */

  const handleSaveEdit = async () => {
    if (!currentRol) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      await savaEditRol({ ...currentRol, id: currentRol.id }); // Usamos el servicio
      setRoles(
        roles.map((rol) =>
          rol.id === currentRol.id ? { ...rol, ...currentRol } : rol
        )
      ); // Actualizar la lista de roles
      toast({
        title: "Rol actualizado",
        description: `El rol ${currentRol.nombre} ha sido actualizado`,
      });
      handleCloseEditModal(); // Cerrar el modal solo si no hubo error
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

  const handleEditClick = (rol: RolType) => {
    setcurrentRol(rol);
    setIsModalEditOpen(true);
  };
  const handleCloseEditModal = () => {
    setcurrentRol(null);
    setErrorMessage(null);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentRol) {
      setcurrentRol({
        ...currentRol,
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

  const handleDeleteClick = (rol: RolType) => {
    setRolToDelete(rol); // Guardar el rol a eliminar
    setIsDeleteDialogOpen(true); // Abrir el diálogo de confirmación
  };

  const handleDeleteConfirm = async () => {
    if (!rolToDelete) return;

    try {
      await deleteRol(rolToDelete.id); // Usamos el servicio para eliminar el rol
      setRoles(roles.filter((rol) => rol.id !== rolToDelete.id)); // Eliminar el rol de la lista
      toast({
        title: "Rol eliminado",
        description: `El rol ${rolToDelete.nombre} ha sido eliminado`,
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
          <Button onClick={handleAddClick}>Nuevo Rol</Button>
        </div>
        <Table>
          <TableCaption>Lista de roles</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[100px]">Nombre</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles && roles.length > 0 ? (
              roles.map((rol) => (
                <TableRow key={rol.id}>
                  <TableCell className="font-medium">{rol.id}</TableCell>
                  <TableCell>{rol.nombre}</TableCell>
                  <TableCell>
                    <Button
                      className="mr-2"
                      onClick={() => handleEditClick(rol)}
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
                    <Button onClick={() => handleDeleteClick(rol)}>
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
                  No hay roles disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Nuevo rol */}
      {isNewRolModalOpen && (
        <Dialog open={isNewRolModalOpen} onOpenChange={setisNewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Rol</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="nombre"
                    onChange={handleNewInputChange}
                    placeholder="Nombre del rol"
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

      {/* Editar usuario */}
      {isModalEditOpen && currentRol && (
        <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Rol</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="nombre"
                    value={currentRol.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre del usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Descripción</Label>
                  <Input
                    id="descripcion"
                    name="descripcion"
                    type="text"
                    value={currentRol.descripcion}
                    onChange={handleInputChange}
                    placeholder="Correo electrónico"
                  />
                </div>
              </div>
            </form>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseEditModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Editar usuario */}

      {/* Eliminar usuario */}
      {/* Confirmación de eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El rol se eliminará
              permanentemente.
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
      {/* Confirmación de eliminación */}
      <Toaster />
    </>
  );
};

export default Roles;
