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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/config/config.ts";

import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import { useFetch } from "@/hooks/useFetch"; // Importamos correctamente desde hooks
import { Rol } from "@/app/dashboard/toor/roles/types"; // Importa la interfaz desde el archivo types.ts
import { Toaster } from "@/components/ui/toaster";
import { Curso } from "@/app/dashboard/toor/cursos/types.ts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [isModalClave, setIsModalClave] = useState<boolean>(false);
  const [isModalCursosOpen, setIsModalCursosOpen] = useState<boolean>(false);
  const [userCursos, setUserCursos] = useState<number[]>([]); // Estado para cursos del usuario actual
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorMessageClave, setErrorMessageClave] = useState<string | null>(
    null
  );
  const [newUser, setNewUser] = useState<Partial<User>>({
    nombre: "",
    email: "",
    rut: "",
    clave: "",
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<number[]>([]); // Estado para roles del usuario actual

  //paginacion

  const { toast } = useToast();

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;
  const { data } = useFetch<Rol[]>("roles", token); // Trae los datos de la API
  const { data: dataCursos } = useFetch<Curso[]>("cursos", token); // Trae los datos de la API (usuarios)

  useEffect(() => {
    fetchUsers();
  }, [userRoles]);

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = users.filter((user) =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchUsers = async (limit = 180, page = 1) => {
    setLoading(true);
    try {
      // Construimos dinámicamente la URL con los parámetros
      const url = new URL(`${API_BASE_URL}/usuarios`);
      url.searchParams.append("limit", limit.toString());
      url.searchParams.append("page", page.toString());

      // Realizamos la solicitud
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const data = await response.json();

      // Accedemos a la propiedad `data` para los usuarios
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
    setErrorMessage(null); // Limpiar error previo
    setCurrentUser(user);
    fetchUserRoles(user.id); // Carga los roles asignados
    setIsModalEditOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsModalEditOpen(false);
    setCurrentUser(null);
    setErrorMessage(null); // Limpiar mensaje de error
  };

  // Si tienes un modal para cambiar contraseña

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
    if (currentUser.nombre === "" || currentUser.email === "") {
      setErrorMessage("Todos los campos son obligatorios.");
      setSaving(false);
      return;
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
      const response = await fetch(`${API_BASE_URL}/usuariosroles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  /* Logica Cambiar Contraseña */
  const handleChangePasswordClick = (user: User) => {
    setCurrentUser(user);
    setErrorMessageClave(null);
    setIsModalClave(true);
  };

  /* Logica Cursos */
  const handleCursosClick = (user: User) => {
    setCurrentUser(user);
    setIsModalCursosOpen(true);
    fetchUsuarioCursos(user.id);
  };

  const handleCloseCursosModal = () => {
    setIsModalCursosOpen(false);
    //setNewUser({ nombre: "", email: "", rut: "", clave: "" });
    setErrorMessage(null); // Limpiar mensaje de error
  };

  const asignarCurso = async (idCurso: number, isChecked: boolean) => {
    const verbo = isChecked ? "POST" : "DELETE";
    try {
      const response = await fetch(`${API_BASE_URL}/usuarioscursos`, {
        method: verbo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          curso_id: idCurso,
          usuario_id: currentUser?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Error al asignar el curso");
        throw new Error(errorData.error || "Error al asignar el curso");
      }
      toast({
        title: isChecked ? "Curso asignado" : "Curso eliminado",
        description: isChecked
          ? "El curso ha sido asignado correctamente"
          : "El curso ha sido eliminado correctamente",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unknown error occurred");
      }
    }
  };

  const fetchUsuarioCursos = async (id: number): Promise<void> => {
    try {
      const response = await fetch(
        `http://localhost:3100/usuarioscursos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los cursos del usuario");
      }

      const cursos: { curso_id: number }[] | null = await response.json(); // Puede ser un array o null
      if (!cursos || cursos.length === 0) {
        console.warn("No se encontraron cursos para este usuario");
        setUserCursos([]); // Dejar la lista vacía
        return;
      }

      const userCursos = cursos.map((curso) => curso.curso_id); // Almacena los IDs de los cursos
      setUserCursos(userCursos);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error:", err.message);
      } else {
        console.error("Error desconocido:", err);
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
          <Button onClick={handleAddUserClick}>Nuevo Usuario</Button>
          <div className="m-4">
            <Input
              type="text"
              placeholder="Buscar usuario por nombre"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
            {filteredUsers.map((user) => (
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
                  <Button
                    className="mr-2"
                    onClick={() => handleCursosClick(user)}
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
                        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                      />
                    </svg>
                  </Button>
                  <Button onClick={() => handleChangePasswordClick(user)}>
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
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
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

      {/* Editar clave */}
      {isModalClave && currentUser && (
        <Dialog open={isModalClave} onOpenChange={setIsModalClave}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">
                    usuario: {currentUser.nombre}
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newUser.clave || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, clave: e.target.value })
                    }
                    placeholder="Nueva Contraseña"
                  />
                </div>
              </div>
            </form>

            {errorMessageClave && (
              <p className="text-red-500">{errorMessageClave}</p>
            )}

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setIsModalClave(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  setSaving(true);
                  setErrorMessageClave(null);

                  if (!newUser.clave) {
                    setErrorMessageClave("La contraseña es obligatoria.");
                    setSaving(false);
                    return;
                  }

                  try {
                    const response = await fetch(
                      `${API_BASE_URL}/usuarios/password/${currentUser.id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ clave: newUser.clave }),
                      }
                    );

                    if (!response.ok) {
                      const errorData = await response.json();
                      setErrorMessageClave(
                        errorData.error || "Error al cambiar la contraseña"
                      );
                      return;
                    }
                    setIsModalClave(false);
                    setNewUser({ ...newUser, clave: "" });
                    toast({
                      title: "Contraseña actualizada",
                      description:
                        "La contraseña ha sido actualizada correctamente",
                    });
                  } catch (err: unknown) {
                    if (err instanceof Error) {
                      setErrorMessageClave(err.message);
                    } else {
                      setErrorMessageClave("Error desconocido");
                    }
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cursos */}
      {/* Nuevo usuario */}
      {isModalCursosOpen && (
        <Dialog open={isModalCursosOpen} onOpenChange={setIsModalCursosOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Cursos</DialogTitle>
            </DialogHeader>
            <Alert>
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription>
                La información de los cursos se actualiza automáticamente al dar
                click.
              </AlertDescription>
            </Alert>

            <form>
              <div className="space-y-4">
                {currentUser?.nombre}
                <Separator />

                <div>
                  {dataCursos?.map((curso) => (
                    <div key={curso.id}>
                      <Checkbox
                        id={`curso-${curso.id}`}
                        value={JSON.stringify({
                          id: curso.id,
                          nombre: curso.nombre,
                        })}
                        checked={userCursos.includes(curso.id)}
                        onClick={() => {
                          if (userCursos.includes(curso.id)) {
                            setUserCursos((prevCursos) =>
                              prevCursos.filter((id) => id !== curso.id)
                            );
                            asignarCurso(curso.id, false);
                          } else {
                            setUserCursos((prevCursos) => [
                              ...prevCursos,
                              curso.id,
                            ]);
                            asignarCurso(curso.id, true);
                          }
                        }}
                      />
                      <label
                        htmlFor={`curso-${curso.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {curso.nombre}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseCursosModal}>
                Cerrar
              </Button>
              {/* <Button onClick={handleSaveNewUser} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Usuarios;
