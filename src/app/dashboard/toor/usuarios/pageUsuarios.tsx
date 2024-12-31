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
import { User } from "./types"; // Importa la interfaz desde el archivo types.ts
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/config/config.ts";

import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import { useFetch } from "@/hooks/useFetch"; // Importamos correctamente desde hooks
import { Rol } from "@/app/dashboard/toor/roles/types"; // Importa la interfaz desde el archivo types.ts
import { Toaster } from "@/components/ui/toaster";

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    nombre: "",
    email: "",
    rut: "",
    clave: "",
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<number[]>([]); // Estado para roles del usuario actual
  const { toast } = useToast();

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;
  const { data } = useFetch<Rol[]>("roles", token); // Trae los datos de la API

  useEffect(() => {
    fetchUsers();
  }, [userRoles]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`);
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const data = await response.json();

      // Ahora accedemos a la propiedad `data` que contiene los usuarios
      setUsers(data.data || []); // Asegúrate de acceder a `data`
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner">Cargando...</div>;

  const handleSaveNewUser = async () => {
    setSaving(true);
    setErrorMessage(null);

    // Validación básica
    if (!newUser.nombre || !newUser.email || !newUser.clave) {
      setErrorMessage("Todos los campos son obligatorios.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Error al guardar el usuario");
        return; // Salir sin cerrar el modal
      }

      await fetchUsers();
      handleCloseNewUserModal(); // Solo se ejecuta si no hay error
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error desconocido");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddUserClick = () => {
    setIsNewUserModalOpen(true);
  };

  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseNewUserModal = () => {
    setIsNewUserModalOpen(false);
    setNewUser({ nombre: "", email: "", rut: "", clave: "" });
    setErrorMessage(null); // Limpiar mensaje de error
  };

  /* Logica Editar usuario */
  const handleEditClick = (user: User) => {
    setCurrentUser(user);
    fetchUserRoles(user.id); // Carga los roles asignados
    setIsModalEditOpen(true);
  };
  const handleCloseEditModal = () => {
    setCurrentUser(null);
    setErrorMessage(null);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!currentUser) return;
    if (!currentUser.nombre || !currentUser.email || !currentUser.rut) {
      setErrorMessage("Todos los campos son obligatorios.");
      setSaving(false);
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/usuarios/${currentUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentUser),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Error al guardar el usuario");
        throw new Error(errorData.error || "Error al guardar el usuario");
      }
      if (!errorMessage) {
        handleCloseEditModal(); // Solo se cierra si no hay error
      }
      await fetchUsers();
      handleCloseEditModal(); // Solo se cierra si no hay error
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unknown error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  /* Logica Roles */
  // Función para cargar los roles del usuario
  const fetchUserRoles = async (id: number): Promise<void> => {
    setUserRoles([]); // Limpiar roles
    try {
      const response = await fetch(
        `http://localhost:3100/usuariosroles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los roles del usuario");
      }

      const roles: { rol_id: number }[] | null = await response.json(); // Puede ser un array o null
      if (!roles || roles.length === 0) {
        console.warn("No se encontraron roles para este usuario");
        setUserRoles([]); // Dejar la lista vacía
        return;
      }

      const userRoles = roles.map((rol) => rol.rol_id); // Almacena los IDs de los roles
      setUserRoles(userRoles);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error:", err.message);
      } else {
        console.error("Error desconocido:", err);
      }
    }
  };

  const handleAsignarRol = async (id: number, isChecked: boolean) => {
    if (!isChecked) {
      setUserRoles((prevRoles) => [...prevRoles, id]);
    } else {
      setUserRoles((prevRoles) => prevRoles.filter((roleId) => roleId !== id));
    }
    try {
      let url: string;
      let method: string;

      if (isChecked) {
        url = `${API_BASE_URL}/usuariosroles/${currentUser?.id}/${id}`;
        method = "DELETE";
      } else {
        url = `${API_BASE_URL}/usuariosroles/`;
        method = "POST";
      }
      toast({
        title: "Rol actualizado",
        description: "Friday, February 10, 2023 at 5:57 PM",
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rol_id: id, usuario_id: currentUser?.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Error al guardar el usuario");
        throw new Error(errorData.error || "Error al guardar el usuario");
      }
      toast({
        title: "Rol actualizado",
        description: isChecked ? "Rol eliminado" : "Rol asignado",
      });
      // await fetchUsers();
      //handleCloseEditModal(); // Solo se cierra si no hay error
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unknown error occurred");
      }
    }
  };

  /* Logica Roles */
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <Button onClick={handleAddUserClick}>Nuevo Usuario</Button>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Scheduled: Catch up ",
              description: "Friday, February 10, 2023 at 5:57 PM",
              action: (
                <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
              ),
            });
          }}
        >
          Add to calendar
        </Button>
        <Toaster />

        <Table>
          <TableCaption>Lista de usuarios</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                {user.activo ? (
                  <TableCell className="text-green-500">{user.id}</TableCell>
                ) : (
                  <TableCell className="text-red-500">{user.id}</TableCell>
                )}
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">
                  <Button
                    className="mr-2"
                    onClick={() => handleEditClick(user)}
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
                  <Button>
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
                        d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z"
                      />
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Nuevo usuario */}
      {isNewUserModalOpen && (
        <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="nombre"
                    value={newUser.nombre}
                    onChange={handleNewUserInputChange}
                    placeholder="Nombre del usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleNewUserInputChange}
                    placeholder="Correo electrónico"
                  />
                </div>
                <div>
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    name="rut"
                    value={newUser.rut || ""}
                    onChange={handleNewUserInputChange}
                    placeholder="RUT del usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="clave"
                    type="password"
                    value={newUser.clave || ""}
                    onChange={handleNewUserInputChange}
                    placeholder="Contraseña"
                  />
                </div>
              </div>
            </form>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseNewUserModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNewUser} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Editar usuario */}
      {isModalEditOpen && currentUser && (
        <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="nombre"
                    value={currentUser.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre del usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={currentUser.email}
                    onChange={handleInputChange}
                    placeholder="Correo electrónico"
                  />
                </div>
                <div>
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    name="rut"
                    value={currentUser.rut || ""}
                    onChange={handleInputChange}
                    placeholder="RUT del usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="activo">Activo </Label>
                  <input
                    id="activo"
                    name="activo"
                    type="checkbox"
                    checked={currentUser.activo}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        activo: e.target.checked,
                      })
                    }
                  />
                </div>
                <div>
                  {data &&
                    data.length > 0 &&
                    data.map((rol) => (
                      <div key={rol.id}>
                        <Checkbox
                          id={`terms2-${rol.id}`}
                          checked={userRoles.includes(rol.id) ? true : false}
                          onClick={() =>
                            handleAsignarRol(
                              rol.id,
                              userRoles.includes(rol.id) ? true : false
                            )
                          }
                        />

                        <label
                          htmlFor={`terms2-${rol.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {rol.nombre}
                        </label>
                      </div>
                    ))}
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
    </>
  );
};

export default Usuarios;
