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
import { API_BASE_URL } from "@/config/config";

import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import { useFetch } from "@/hooks/useFetch"; // Importamos correctamente desde hooks
import { CursoApiResponseType, FuncionarioType, RolType } from "@/types/index";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  asignarCursoFuncionario,
  deleteFuncionario,
  eliminarCursoFuncionario,
  getFuncionarioCursos,
  getFuncionarios,
  saveEditFuncionario,
  saveNewFuncionario,
} from "@/services/funcionariosService";
import Spinner from "@/components/Spinner";
import { AlertCircle } from "lucide-react";

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
import { getCursos } from "@/services/cursosService";
const Usuarios: React.FC = () => {
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
  const [currentUser, setCurrentUser] = useState<FuncionarioType | null>(null);
  const [userRoles, setUserRoles] = useState<number[]>([]); // Estado para roles del usuario actual

  /* refactoring */
  const [funcionarios, setFuncionarios] = useState<FuncionarioType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [funcionarioToDelete, setFuncionarioToDelete] =
    useState<FuncionarioType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);
  const [loadingCursos, setLoadingCursos] = useState<boolean>(true);
  const [messageCursos, setMessageCursos] = useState<string | null>(null);
  /* refactoring */

  const { toast } = useToast();

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  const { data } = useFetch<RolType[]>("roles", token); // Trae los datos de la API
  //const { data: dataCursos } = useFetch<CursoType[]>("cursos", token); // Trae los datos de la API (usuarios)

  useEffect(() => {
    getFuncionarios()
      .then((response) => {
        if (response) {
          setFuncionarios(response.data);
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

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = funcionarios.filter((user) =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );

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
      const createFuncionario = await saveNewFuncionario({
        nombre: newUser.nombre!,
        email: newUser.email!,
        rut: newUser.rut!,
        clave: newUser.clave!,
      });
      console.log(createFuncionario);

      const newFuncionarioWhidId = {
        id: createFuncionario.usuario_id,
        nombre: createFuncionario.nombre!,
        email: createFuncionario.email!,
        rut: createFuncionario.rut!,
      };

      console.log(createFuncionario);
      setFuncionarios([
        ...funcionarios,
        {
          ...newFuncionarioWhidId,
          activo: true, // or any default value
          fecha_actualizacion: new Date().toISOString(), // or any default value
        },
      ]);
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      });
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
    setErrorCursos(null); // Limpiar mensaje de error
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
      await saveEditFuncionario(currentUser.id, {
        nombre: currentUser.nombre,
        email: currentUser.email,
        rut: currentUser.rut || "",
        activo: currentUser.activo,
      });

      setFuncionarios((prevFuncionarios) =>
        prevFuncionarios.map((funcionario) =>
          funcionario.id === currentUser.id ? currentUser : funcionario
        )
      );

      toast({
        title: "Funcionario actualizado",
        description: `El funcionario ${currentUser.nombre} ha sido actualizado`,
      });

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

  const handleDeleteClick = (funcionario: FuncionarioType) => {
    setFuncionarioToDelete(funcionario); // Guardar el rol a eliminar
    setIsDeleteDialogOpen(true); // Abrir el diálogo de confirmación
  };

  const handleDeleteConfirm = async () => {
    if (!funcionarioToDelete) return;

    try {
      await deleteFuncionario(funcionarioToDelete.id); // Usamos el servicio para eliminar el rol
      setFuncionarios((prevFuncionarios) =>
        prevFuncionarios.filter(
          (funcionario) => funcionario.id !== funcionarioToDelete?.id
        )
      );
      toast({
        title: "Funcionario eliminado",
        description: `El funcionario ${funcionarioToDelete.nombre} ha sido eliminado`,
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
    setMessageCursos(null);
  };

  const handleCloseCursosModal = () => {
    setErrorCursos(null); // Limpiar mensaje de error
    setErrorMessage(null); // Limpiar mensaje de error
    setMessageCursos(null); // Limpiar mensaje de éxitoq
    setIsModalCursosOpen(false);
  };

  const asignarCurso = async (idCurso: number, isChecked: boolean) => {
    setMessageCursos(null);
    try {
      if (currentUser?.id !== undefined) {
        if (isChecked) {
          const response = await asignarCursoFuncionario(
            idCurso,
            currentUser.id
          );
          if (response) {
            setMessageCursos("Curso asignado correctamente");
          } else {
            setErrorCursos("Error al asignar el curso");
          }
        } else {
          const response = await eliminarCursoFuncionario(
            idCurso,
            currentUser.id
          );
          if (response) {
            setMessageCursos("Curso eliminado correctamente");
          } else {
            setErrorCursos("Error al eliminar el curso");
          }
        }
      } else {
        console.error("currentUser.id is undefined");
      }
    } catch (err) {
      console.log("error" + err);
    }
  };

  const fetchUsuarioCursos = async (id: number): Promise<void> => {
    try {
      const response = await getFuncionarioCursos(id);
      console.log(response);

      // Si la respuesta ya es un array, no necesitas hacer .json()
      const cursos: { curso_id: number }[] | null = response; // Directamente asigna la respuesta
      console.log(cursos);

      if (!cursos || cursos.length === 0) {
        console.warn("No se encontraron cursos para este usuario");
        setUserCursos([]); // Dejar la lista vacía
        return;
      }

      const userCursos = cursos.map((curso) => curso.curso_id); // Almacena los IDs de los cursos
      console.log(userCursos);
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
                  <Button onClick={() => handleDeleteClick(user)}>
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
                  {loadingCursos && <Spinner />}
                  {errorCursos && <p className="text-red-500">{errorCursos}</p>}
                  <p className="text-green-500">{messageCursos}</p>

                  {cursos?.map((curso) => (
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
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El funcionario{" "}
              <b>{funcionarioToDelete?.nombre}</b> se eliminará permanentemente.
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
    </>
  );
};

export default Usuarios;
