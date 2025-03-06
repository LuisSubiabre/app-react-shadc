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
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestión de Estudiantes
            </h1>
            <p className="text-muted-foreground">
              Administra los estudiantes del sistema
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Buscar estudiante por nombre"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
            <Button
              onClick={handleNewClick}
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
              Nuevo Estudiante
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <Button
              key={letter}
              variant={selectedLetter === letter ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedLetter(letter);
                setCurrentPage(0);
              }}
            >
              {letter}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedLetter("");
              setCurrentPage(0);
            }}
          >
            Todos
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[10px] font-semibold">ID</TableHead>
                <TableHead className="w-[200px] font-semibold">
                  Nombre
                </TableHead>
                <TableHead className="w-[100px] font-semibold">RUT</TableHead>
                <TableHead className="w-[100px] font-semibold">Curso</TableHead>
                <TableHead className="w-[150px] font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <span
                        className={`inline-flex items-center gap-2 ${
                          c.activo ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {c.activo ? (
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
                        {c.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{c.nombre}</span>
                        <span className="text-sm text-muted-foreground">
                          {c.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{c.rut}</TableCell>
                    <TableCell>{c.curso_nombre}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(c)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(c)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleChangePasswordClick(c)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <KeySquare className="size-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
                        No hay estudiantes disponibles
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Nuevo Estudiante */}
      {isNewModalOpen && (
        <Dialog open={isNewModalOpen} onOpenChange={setisNewModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Agregar Nuevo Estudiante
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
                  placeholder="Nombre del estudiante (apellidos nombres)"
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
                  onChange={handleNewInputChange}
                  placeholder="Ingresa email"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clave_email" className="text-sm font-medium">
                  Clave Email
                </Label>
                <Input
                  id="clave_email"
                  name="clave_email"
                  type="text"
                  onChange={handleNewInputChange}
                  placeholder="Ingresa clave email"
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
                  type="text"
                  onChange={handleNewInputChange}
                  placeholder="Ingrese el RUT"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso" className="text-sm font-medium">
                  Curso
                </Label>
                {loadingCursos ? (
                  <div className="flex items-center justify-center h-10 w-full border rounded-md">
                    <svg
                      className="animate-spin h-4 w-4 text-primary"
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
                  </div>
                ) : errorCursos ? (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {errorCursos}
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      const selected = JSON.parse(value);
                      setNewEstudiante({
                        ...newEstudiante,
                        curso_id: selected.id,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione Curso..." />
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
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numlista" className="text-sm font-medium">
                  Número de lista
                </Label>
                <Input
                  id="numlista"
                  name="numlista"
                  type="number"
                  onChange={handleNewInputChange}
                  placeholder="Ingrese el número de lista"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña sesión
                </Label>
                <Input
                  id="clave"
                  name="clave"
                  type="password"
                  onChange={handleNewInputChange}
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

      {/* Editar Estudiante */}
      {isModalEditOpen && currentEstudiante && (
        <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Editar Estudiante
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
                  value={currentEstudiante.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del estudiante (apellidos nombres)"
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
                  value={currentEstudiante.email}
                  onChange={handleInputChange}
                  placeholder="Ingresa email"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clave_email" className="text-sm font-medium">
                  Clave Email
                </Label>
                <Input
                  id="clave_email"
                  name="clave_email"
                  type="text"
                  value={currentEstudiante.clave_email}
                  onChange={handleInputChange}
                  placeholder="Ingresa clave email"
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
                  value={currentEstudiante.rut || ""}
                  onChange={handleInputChange}
                  placeholder="RUT del estudiante"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso" className="text-sm font-medium">
                  Curso
                </Label>
                {loadingCursos ? (
                  <div className="flex items-center justify-center h-10 w-full border rounded-md">
                    <svg
                      className="animate-spin h-4 w-4 text-primary"
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
                  </div>
                ) : errorCursos ? (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {errorCursos}
                  </div>
                ) : (
                  <Select
                    value={JSON.stringify({
                      id: currentEstudiante.curso_id,
                      nombre:
                        cursos?.find((c) => c.id === currentEstudiante.curso_id)
                          ?.nombre || "",
                    })}
                    onValueChange={(value) => {
                      const selected = JSON.parse(value);
                      setCurrentEstudiante({
                        ...currentEstudiante,
                        curso_id: selected.id,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
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
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numlista" className="text-sm font-medium">
                  Número de lista
                </Label>
                <Input
                  id="numlista"
                  name="numlista"
                  type="number"
                  value={currentEstudiante.numlista}
                  onChange={handleInputChange}
                  placeholder="Ingrese el número de lista"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
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
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="activo" className="text-sm font-medium">
                  Activo
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

      {/* Cambiar Contraseña */}
      {isModalClave && currentEstudiante && (
        <Dialog open={isModalClave} onOpenChange={setIsModalClave}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Cambiar Contraseña de acceso
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Usuario: {currentEstudiante.nombre}
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
                onClick={handleUpdatePassword}
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

      {/* Confirmación de eliminación */}
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
              Esta acción no se puede deshacer. El estudiante{" "}
              <span className="font-medium text-foreground">
                {estudianteDelete?.nombre}
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
    </>
  );
};

export default Estudiantes;
