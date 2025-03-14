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

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground">
              Administra los usuarios del sistema
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Buscar usuario por nombre"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
            <Button
              onClick={handleAddUserClick}
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
              Nuevo Usuario
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[100px] font-semibold">ID</TableHead>
                <TableHead className="w-[200px] font-semibold">
                  Nombre
                </TableHead>
                <TableHead className="w-[200px] font-semibold">Email</TableHead>
                <TableHead className="w-[150px] font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <span
                        className={`inline-flex items-center gap-2 ${
                          user.activo ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {user.activo ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18 18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        {user.id}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{user.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(user)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <FilePenLine className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCursosClick(user)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <GraduationCap className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleChangePasswordClick(user)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <KeySquare className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRolesClick(user)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Puzzle className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-5" />
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
                        No hay usuarios disponibles
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Nuevo usuario */}
      {isNewUserModalOpen && (
        <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Agregar Nuevo Usuario
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="nombre"
                  value={newUser.nombre}
                  onChange={handleNewUserInputChange}
                  placeholder="Ingresa el nombre del usuario"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserInputChange}
                  placeholder="Ingresa el correo electrónico"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut" className="text-sm font-medium">
                  RUT
                </Label>
                <Input
                  id="rut"
                  name="rut"
                  value={newUser.rut || ""}
                  onChange={handleNewUserInputChange}
                  placeholder="Ingresa el RUT"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  name="clave"
                  type="password"
                  value={newUser.clave || ""}
                  onChange={handleNewUserInputChange}
                  placeholder="Ingresa la contraseña"
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
              <Button variant="outline" onClick={handleCloseNewUserModal}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNewUser}
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

      {/* Editar usuario */}
      {isModalEditOpen && currentUser && (
        <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Editar Usuario
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="nombre"
                  value={currentUser.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingresa el nombre del usuario"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={currentUser.email}
                  onChange={handleInputChange}
                  placeholder="Ingresa el correo electrónico"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut" className="text-sm font-medium">
                  RUT
                </Label>
                <Input
                  id="rut"
                  name="rut"
                  value={currentUser.rut || ""}
                  onChange={handleInputChange}
                  placeholder="Ingresa el RUT"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
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
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="activo" className="text-sm font-medium">
                  Usuario Activo
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

      {/* Editar clave */}
      {isModalClave && currentUser && (
        <Dialog open={isModalClave} onOpenChange={setIsModalClave}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Cambiar Contraseña
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Usuario: {currentUser.nombre}
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={newUser.clave || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, clave: e.target.value })
                  }
                  placeholder="Ingresa la nueva contraseña"
                  className="w-full"
                />
              </div>
            </form>

            {errorMessageClave && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {errorMessageClave}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsModalClave(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSavePassword}
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

      {/* Modal Roles */}
      {isModalRolestOpen && currentUser && (
        <Dialog open={isModalRolestOpen} onOpenChange={setIsModalRolesOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Roles - {currentUser.nombre}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {loadingRoles && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
              {errorRoles && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {errorRoles}
                </div>
              )}
              {messageCursos && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
                  {messageCursos}
                </div>
              )}

              <div className="space-y-2">
                {roles &&
                  roles.length > 0 &&
                  roles.map((rol) => (
                    <div key={rol.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`terms2-${rol.id}`}
                        checked={userRoles.includes(rol.id)}
                        onClick={() =>
                          handleAsignarRol(rol.id, userRoles.includes(rol.id))
                        }
                      />
                      <Label
                        htmlFor={`terms2-${rol.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {rol.nombre}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCloseRolesModal}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Cursos */}
      {isModalCursosOpen && (
        <Dialog open={isModalCursosOpen} onOpenChange={setIsModalCursosOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Asignar Cursos
              </DialogTitle>
            </DialogHeader>

            <Alert className="mb-4">
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription>
                La información de los cursos se actualiza automáticamente al dar
                click.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 py-4">
              <div className="font-medium">{currentUser?.nombre}</div>
              <Separator />

              {loadingCursos && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
              {errorCursos && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {errorCursos}
                </div>
              )}
              {messageCursos && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
                  {messageCursos}
                </div>
              )}

              <div className="space-y-2">
                {cursos?.map((curso) => (
                  <div key={curso.id} className="flex items-center space-x-2">
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
                    <Label
                      htmlFor={`curso-${curso.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {curso.nombre}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCloseCursosModal}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Eliminar usuario */}
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
              Esta acción no se puede deshacer. El usuario{" "}
              <span className="font-medium text-foreground">
                {funcionarioToDelete?.nombre}
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
      <Toaster />
    </>
  );
};

export default Usuarios;
