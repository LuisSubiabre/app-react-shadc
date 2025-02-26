import * as Imports from "@/app/dashboard/toor/estudiantes/importEstudiantes.ts";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { CursoApiResponseType, EstudianteType } from "@/types";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Edit, KeySquare, Trash2 } from "lucide-react";
import { useEffect } from "react";
import {
  changePasswordEstudiante,
  deleteEstudiante,
  getEstudiantes,
  saveEditEstudiante,
  saveEstudiante,
} from "@/services/estudiantesService";
import { getCursos } from "@/services/cursosService";
const PageSize = 1000;
const Estudiantes: React.FC = () => {
  const {
    useState,

    Breadcrumbs,

    Button,
    Table,
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
    Dialog,
    DialogHeader,
    DialogContent,
    DialogFooter,
    DialogTitle,
    Label,
    Input,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } = Imports;
  const [isNewModalOpen, setisNewModalOpen] = useState<boolean>(false);
  const [newEstudiante, setNewEstudiante] = useState<Partial<Estudiante>>({
    nombre: "",
    email: "",
    clave_email: "",
    clave: "",
    rut: "",
    numlista: 0,
    curso_id: 1,
    activo: true,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [isModalClave, setIsModalClave] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorMessageClave, setErrorMessageClave] = useState<string | null>(
    null
  );

  const [currentEstudiante, setCurrentEstudiante] = useState<Estudiante | null>(
    null
  );
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [estudianteDelete, setEstudianteDelete] = useState<Estudiante | null>(
    null
  );

  /* Refactory */
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [loadingCursos, setLoadingCursos] = useState<boolean>(true);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState("");

  /* Refactory */

  useEffect(() => {
    getEstudiantes()
      .then((response) => {
        if (response) {
          setEstudiantes(response.data);
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

  const handleNewClick = () => {
    setisNewModalOpen(true);
  };

  const handleCloseNewModal = () => {
    setisNewModalOpen(false);
    setNewEstudiante({
      nombre: "",
      email: "",
      clave_email: "",
      clave: "",
      rut: "",
      numlista: 0,
      curso_id: 1,
      activo: true,
    });
    setErrorMessage(null); // Limpiar mensaje de error
  };

  const handleNewInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewEstudiante({
      ...newEstudiante,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveNew = async () => {
    setSaving(true);
    setErrorMessage(null);
    if (
      !newEstudiante.nombre ||
      !newEstudiante.email ||
      !newEstudiante.clave_email ||
      !newEstudiante.rut ||
      !newEstudiante.clave ||
      !newEstudiante.rut ||
      !newEstudiante.rut
    ) {
      setErrorMessage("Faltan datos obligatorios!");
      setSaving(false);
      return;
    }
    try {
      const createEstudiante = await saveEstudiante(
        newEstudiante as EstudianteType
      );
      console.log("createEstudiante", createEstudiante);
      const newEstudianteWithId: EstudianteType = {
        id: createEstudiante.estudiante_id,
        nombre: newEstudiante.nombre!,
        email: newEstudiante.email!,
        clave_email: newEstudiante.clave_email!,
        rut: newEstudiante.rut!,
        curso_id: newEstudiante.curso_id!,
        numlista: newEstudiante.numlista!,
        activo: newEstudiante.activo!,
        curso_nombre: "", // Add appropriate value if needed
        fecha_actualizacion: "",
      };
      console.log("newEstudianteWithId", newEstudianteWithId);
      console.log("estudiantes", estudiantes);

      setEstudiantes([...estudiantes, newEstudianteWithId]);
      toast({
        title: "Estudiante creado",
        description: "El estudiante ha sido creado correctamente",
      });
      handleCloseNewModal(); // Solo se ejecuta si no hay error
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setSaving(false);
    }
  };

  /* Editar */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentEstudiante) {
      setCurrentEstudiante({
        ...currentEstudiante,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleEditClick = (estudiante: Estudiante) => {
    setCurrentEstudiante(estudiante);
    setIsModalEditOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsModalEditOpen(false);
    setisNewModalOpen(false);
    setCurrentEstudiante(null);
    setErrorMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!currentEstudiante) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      await saveEditEstudiante(currentEstudiante);

      // Encuentra el nombre del curso correspondiente
      const curso = cursos.find((c) => c.id === currentEstudiante.curso_id);
      const curso_nombre = curso ? curso.nombre : "";

      // Actualiza el estado local con el nuevo curso_nombre
      const updatedEstudiante = {
        ...currentEstudiante,
        curso_nombre,
      };

      setEstudiantes(
        estudiantes.map((c) =>
          c.id === currentEstudiante.id ? updatedEstudiante : c
        )
      );

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

  /* delete */
  const handleDeleteClick = (estudiante: Estudiante) => {
    setEstudianteDelete(estudiante);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!estudianteDelete) return;

    try {
      await deleteEstudiante(estudianteDelete.id);
      setEstudiantes(estudiantes.filter((c) => c.id !== estudianteDelete.id));
      toast({
        title: "Estudiante eliminado",
        description: "El estudiante ha sido eliminado correctamente",
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

  /* Logica Cambiar Contraseña */
  const handleChangePasswordClick = (estudiante: Estudiante) => {
    setCurrentEstudiante(estudiante);
    setErrorMessageClave(null);
    setIsModalClave(true);
  };

  const handleUpdatePassword = async () => {
    setSaving(true);
    setErrorMessageClave(null);

    if (!newEstudiante.clave) {
      setErrorMessageClave("La contraseña es obligatoria.");
      setSaving(false);
      return;
    }

    try {
      await changePasswordEstudiante(
        currentEstudiante!.id,
        newEstudiante.clave
      );
      toast({
        title: "Contraseña actualizada",
        description: "La contraseña ha sido actualizada correctamente",
      });
      setNewEstudiante({ ...newEstudiante, clave: "" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessageClave(err.message);
      } else {
        setErrorMessageClave("Error desconocido.");
      }
    } finally {
      setSaving(false);
      setIsModalClave(false);
    }
  };

  // Filtrar usuarios según el término de búsqueda
  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredUsers2 = estudiantes?.filter((estudiante: EstudianteType) => {
    const nameCondition = normalizeString(
      estudiante.nombre.toLowerCase()
    ).includes(normalizeString(searchTerm.toLowerCase()));
    const letterCondition =
      !selectedLetter || estudiante.nombre.startsWith(selectedLetter);
    return nameCondition && letterCondition;
  });

  // Calcular inicio y fin de la paginación
  const startIndex = currentPage * PageSize;
  const paginatedUsers = filteredUsers2.slice(
    startIndex,
    startIndex + PageSize
  );
  return (
    <>
      <Toaster />
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs /> {/* Usa el componente de breadcrumbs aquí */}
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <Button onClick={handleNewClick}>Nuevo Estudiante</Button>
          <div className="m-4">
            <Input
              type="text"
              placeholder="Buscar usuario por nombre"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          {/* Filtros por letra */}
          <div className="mb-4 flex flex-wrap justify-center">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <Button
                key={letter}
                className={`px-2 py-1 mx-1 border rounded ${
                  selectedLetter === letter
                    ? "bg-blue-500 text-white"
                    : "bg-gray-500"
                }`}
                onClick={() => {
                  setSelectedLetter(letter);
                  setCurrentPage(0);
                }}
              >
                {letter}
              </Button>
            ))}
            <button
              className="px-2 py-1 mx-1 border rounded bg-gray-300"
              onClick={() => {
                setSelectedLetter("");
                setCurrentPage(0);
              }}
            >
              Todos
            </button>
          </div>
        </div>
        <Table>
          <TableCaption>Lista de estudiantes</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10px]">ID</TableHead>
              <TableHead className="w-[100px]">Nombre</TableHead>
              <TableHead className="w-[100px]">RUT</TableHead>
              <TableHead className="w-[100px]">Curso</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((c) => (
                <TableRow key={c.id}>
                  {c.activo ? (
                    <TableCell className="text-green-500">{c.id}</TableCell>
                  ) : (
                    <TableCell className="text-red-500">{c.id}</TableCell>
                  )}

                  <TableCell>
                    {c.nombre} <br />
                    <small>{c.email}</small>
                  </TableCell>
                  <TableCell>{c.rut}</TableCell>
                  <TableCell>{c.curso_nombre}</TableCell>
                  <TableCell>
                    <Button className="mr-2" onClick={() => handleEditClick(c)}>
                      <Edit />
                    </Button>
                    <Button
                      className="mr-2"
                      onClick={() => handleDeleteClick(c)}
                    >
                      <Trash2 />
                    </Button>
                    <Button onClick={() => handleChangePasswordClick(c)}>
                      <KeySquare />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No hay estudiantes disponibles.
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
              <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    onChange={handleNewInputChange}
                    placeholder="Nombre del estudiante (apellidos nombres)"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    onChange={handleNewInputChange}
                    placeholder="Ingresa email"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Clave Email</Label>
                  <Input
                    id="clave_email"
                    name="clave_email"
                    type="text"
                    onChange={handleNewInputChange}
                    placeholder="Ingresa clave email"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">RUT</Label>
                  <Input
                    id="rut"
                    name="rut"
                    type="text"
                    //value={newCurso.indice}
                    onChange={handleNewInputChange}
                    placeholder="Ingrese el índice"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Curso</Label>
                  <Select
                    onValueChange={(value) => {
                      const selected = JSON.parse(value); // De
                      setNewEstudiante({
                        ...newEstudiante,
                        curso_id: selected.id,
                      });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccione Curso..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Funcionarios</SelectLabel>
                        {cursos?.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={JSON.stringify({
                              id: c.id,
                              nombre: c.nombre,
                            })}
                          >
                            {c.nombre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="descripcion">Número de lista</Label>
                  <Input
                    id="numlista"
                    name="numlista"
                    type="number"
                    //value={newCurso.indice}
                    onChange={handleNewInputChange}
                    placeholder="Ingrese el número de lista"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña sesión</Label>
                  <Input
                    id="clave"
                    name="clave"
                    type="password"
                    onChange={handleNewInputChange}
                    placeholder="Ingresa clave email"
                  />
                </div>
                {/* <div>
                  <Label htmlFor="activo">Activo </Label>
                  <Checkbox id="activo" name="activo" defaultChecked />
                </div> */}
              </div>
            </form>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseNewModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNew}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Editar */}
      {isModalEditOpen && currentEstudiante && (
        <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Estudiante</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="nombre"
                    value={currentEstudiante.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre del estudiante (apellidos nombres)"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={currentEstudiante.email}
                    onChange={handleInputChange}
                    placeholder="Ingresa email"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Clave Email</Label>
                  <Input
                    id="clave_email"
                    name="clave_email"
                    type="text"
                    value={currentEstudiante.clave_email}
                    onChange={handleInputChange}
                    placeholder="Ingresa email"
                  />
                </div>
                <div>
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    name="rut"
                    value={currentEstudiante.rut || ""}
                    onChange={handleInputChange}
                    placeholder="RUT del usuario"
                  />
                </div>
                <div>
                  {loadingCursos ? <Spinner /> : null}
                  {errorCursos ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{errorCursos}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Label htmlFor="descripcion">Curso</Label>
                      <Select
                        value={JSON.stringify({
                          id: currentEstudiante.curso_id,
                          nombre:
                            cursos?.find(
                              (c) => c.id === currentEstudiante.curso_id
                            )?.nombre || "",
                        })}
                        onValueChange={(value) => {
                          const selected = JSON.parse(value);
                          setCurrentEstudiante({
                            ...currentEstudiante,
                            curso_id: selected.id,
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecciona Curso" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Cursos</SelectLabel>
                            {cursos?.map((c) => (
                              <SelectItem
                                key={c.id}
                                value={JSON.stringify({
                                  id: c.id,
                                  nombre: c.nombre,
                                })}
                              >
                                {c.nombre}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
                <div>
                  <Label htmlFor="descripcion">Número de lista</Label>
                  <Input
                    id="numlista"
                    name="numlista"
                    type="number"
                    value={currentEstudiante.numlista}
                    onChange={handleInputChange}
                    placeholder="Ingrese el número de lista"
                  />
                </div>

                <div>
                  <Label htmlFor="activo">Activo </Label>
                  <input
                    id="activo"
                    name="activo"
                    type="checkbox"
                    checked={currentEstudiante.activo}
                    onChange={(e) =>
                      setCurrentEstudiante({
                        ...currentEstudiante,
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

      {/* Confirmación de eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El estudiante se eliminará
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

      {/* Cambiar clave */}
      {isModalClave && currentEstudiante && (
        <Dialog open={isModalClave} onOpenChange={setIsModalClave}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña de acceso</DialogTitle>
            </DialogHeader>

            <form>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">
                    usuario: {currentEstudiante.nombre}
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newEstudiante.clave || ""}
                    onChange={(e) =>
                      setNewEstudiante({
                        ...newEstudiante,
                        clave: e.target.value,
                      })
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
              <Button onClick={handleUpdatePassword} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Estudiantes;
