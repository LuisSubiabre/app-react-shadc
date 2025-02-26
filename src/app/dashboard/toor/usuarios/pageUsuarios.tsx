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

import { CursoApiResponseType, FuncionarioType, RolType } from "@/types/index";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  asignarCursoFuncionario,
  asignarRolFuncionario,
  changePassword,
  deleteFuncionario,
  eliminarCursoFuncionario,
  eliminarRolFuncionario,
  getFuncionarioCursos,
  getFuncionarios,
  getRolesFuncionario,
  saveEditFuncionario,
  saveNewFuncionario,
} from "@/services/funcionariosService";
import Spinner from "@/components/Spinner";
import {
  AlertCircle,
  FilePenLine,
  GraduationCap,
  KeySquare,
  Puzzle,
  Trash2,
} from "lucide-react";

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
import { getRoles } from "@/services/rolesService";

// Componente Usuarios
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

  const [roles, setRoles] = useState<RolType[]>([]);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [isModalRolestOpen, setIsModalRolesOpen] = useState<boolean>(false);
  /* refactoring */

  const { toast } = useToast();

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

  useEffect(() => {
    getRoles()
      .then((response) => {
        if (response) {
          setRoles(response.data);
        } else {
          setErrorRoles("No se pudo cargar la información de roles");
        }
      })
      .catch(() => {
        setErrorRoles("No se pudo cargar la información de roles");
      })
      .finally(() => {
        setLoadingRoles(false);
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
      //console.log(createFuncionario);

      const newFuncionarioWhidId = {
        id: createFuncionario.usuario_id,
        nombre: createFuncionario.nombre!,
        email: createFuncionario.email!,
        rut: createFuncionario.rut!,
      };

      //console.log(createFuncionario);
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
    setErrorRoles(null); // Limpiar mensaje de error
    setUserRoles([]); // Limpiar roles
    try {
      const response = await getRolesFuncionario(id); // Llama al servicio para obtener los roles del usuario

      if (response === null) {
        setErrorRoles("No se encontraron roles para este usuario");
        setUserRoles([]); // Dejar la lista vacía
        return;
      }

      if (response.error) {
        setErrorRoles("Error al obtener los roles del usuario");
      }

      const roles: { rol_id: number }[] | null = await response; // Puede ser un array o null
      if (!roles || roles.length === 0) {
        setErrorRoles("No se encontraron roles para este usuario");
        setUserRoles([]); // Dejar la lista vacía
        return;
      }

      const userRoles = roles.map((rol) => rol.rol_id); // Almacena los IDs de los roles
      setUserRoles(userRoles);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorRoles("Error: " + err.message);
      } else {
        setErrorRoles("Error: " + err);
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
      if (isChecked) {
        if (currentUser && currentUser.id !== undefined) {
          await eliminarRolFuncionario(id, currentUser.id);
        }
      } else {
        if (currentUser && currentUser.id !== undefined) {
          await asignarRolFuncionario(id, currentUser.id);
        }
      }

      toast({
        title: "Rol actualizado",
        description: isChecked ? "Rol eliminado" : "Rol asignado",
      });
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

  /* Logica Roles Refactor */
  const handleRolesClick = (user: User) => {
    setCurrentUser(user);
    setIsModalRolesOpen(true);
    fetchUserRoles(user.id);
    setMessageCursos(null);
  };
  const handleCloseRolesModal = () => {
    setErrorRoles(null);
    setErrorMessage(null);
    setMessageCursos(null);
    setIsModalRolesOpen(false);
    setErrorRoles(null);
  };

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

  /* Logica Cambiar Contraseña */
  const handleSavePassword = async () => {
    setSaving(true);
    setErrorMessageClave(null);

    if (!newUser.clave) {
      setErrorMessageClave("La contraseña es obligatoria.");
      setSaving(false);
      return;
    }

    try {
      if (currentUser?.id !== undefined) {
        await changePassword(currentUser.id, newUser.clave);
        toast({
          title: "Contraseña actualizada",
          description: "La contraseña ha sido actualizada correctamente",
        });
      }
      setNewUser({ ...newUser, clave: "" });
      setIsModalClave(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessageClave(err.message);
      } else {
        setErrorMessageClave("Error desconocido");
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
              <TableHead>Acciones</TableHead>
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
                <TableCell>
                  <div> {user.nombre} </div>

                  <div className="text-xs"> {user.email} </div>
                </TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <Button
                    className="mr-2"
                    onClick={() => handleEditClick(user)}
                  >
                    <FilePenLine />
                  </Button>
                  <Button
                    className="mr-2"
                    onClick={() => handleCursosClick(user)}
                  >
                    <GraduationCap />
                  </Button>
                  <Button
                    className="mr-2"
                    onClick={() => handleChangePasswordClick(user)}
                  >
                    <KeySquare />
                  </Button>

                  <Button
                    className="mr-2"
                    onClick={() => handleDeleteClick(user)}
                  >
                    <Trash2 />
                  </Button>

                  <Button
                    className="mr-2"
                    onClick={() => handleRolesClick(user)}
                  >
                    <Puzzle />
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
              <Button onClick={handleSavePassword} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Roles */}
      {isModalRolestOpen && currentUser && (
        <Dialog open={isModalRolestOpen} onOpenChange={setIsModalRolesOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Roles {currentUser.nombre}</DialogTitle>
            </DialogHeader>
            <form>
              <div className="space-y-4">
                <div>
                  {loadingRoles && <Spinner />}
                  <p className="text-red-500">{errorRoles}</p>

                  <p className="text-green-500">{messageCursos}</p>
                </div>
                <div>
                  {roles &&
                    roles.length > 0 &&
                    roles.map((rol) => (
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
              <Button variant="secondary" onClick={handleCloseRolesModal}>
                Cerrar
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
