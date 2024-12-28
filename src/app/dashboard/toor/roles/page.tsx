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
import { Rol } from "./types"; // Importa la interfaz desde el archivo types.ts
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/config/config.ts";
import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks

//const authContext = useAuth(); // Obtenemos el contexto de autenticación

const Roles: React.FC = () => {
  const [users, setUsers] = useState<Rol[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isNewRolModalOpen, setisNewRolModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newRol, setNewRol] = useState<Partial<Rol>>({
    nombre: "",
    descripcion: "",
  });
  const [currentUser, setCurrentUser] = useState<Rol | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener información");
      }
      const data = await response.json();

      setUsers(data.data || []);
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

  const handleSaveNewRol = async () => {
    setSaving(true);
    setErrorMessage(null);

    // Validación básica
    if (!newRol.nombre || !newRol.descripcion) {
      setErrorMessage("Todos los campos son obligatorios.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRol),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        setErrorMessage(errorData.error || "Error al guardar el rol");
        return; // Salir sin cerrar el modal
      }

      await fetchUsers();
      handleCloseNewRolModal(); // Solo se ejecuta si no hay error
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
    setisNewRolModalOpen(true);
  };

  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRol({
      ...newRol,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseNewRolModal = () => {
    setisNewRolModalOpen(false);
    setNewRol({ nombre: "", descripcion: "" });
    setErrorMessage(null); // Limpiar mensaje de error
  };

  /* Logica Editar usuario */
  const handleEditClick = (user: User) => {
    setCurrentUser(user);
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
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <Button onClick={handleAddUserClick}>Nuevo Rol</Button>
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.descripcion}</TableCell>

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
                  <Button>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Nuevo rol */}
      {isNewRolModalOpen && (
        <Dialog open={isNewRolModalOpen} onOpenChange={setisNewRolModalOpen}>
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
                    onChange={handleNewUserInputChange}
                    placeholder="Nombre del rol"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    name="descripcion"
                    type="text"
                    onChange={handleNewUserInputChange}
                    placeholder="Ingresa descripción"
                  />
                </div>
              </div>
            </form>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseNewRolModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNewRol} disabled={saving}>
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

export default Roles;
