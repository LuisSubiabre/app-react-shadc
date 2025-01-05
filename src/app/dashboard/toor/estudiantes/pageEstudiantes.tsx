import * as Imports from "@/app/dashboard/toor/estudiantes/importEstudiantes.ts";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";

const Estudiantes: React.FC = () => {
  const {
    useState,
    useAuth,
    Breadcrumbs,
    useFetch,
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
    Checkbox,
  } = Imports;
  const [isNewModalOpen, setisNewModalOpen] = useState<boolean>(false);
  const [newEstudiante, setNewEstudiante] = useState<Partial<Estudiante>>({
    nombre: "",
    email: "",
    clave_email: "",
    clave: "",
    rut: "",
    curso_id: 99,
    activo: true,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  const { data, loading, error, refetch } = useFetch<Estudiante[]>(
    "estudiantes",
    token
  ); // Trae los datos de la API

  if (loading) return <div className="spinner">Cargando...</div>;
  if (error) return <div className="error">{error}</div>; // Mensaje de error al cargar los datos de la API

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
      curso_id: 99,
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
    console.log("newEstudiante", newEstudiante);
    // try {
    //   await saveNew(newEstudiante, token);
    //   setisNewModalOpen(false);
    //   refetch();
    // } catch (error: unknown) {
    //   console.error(error);
    // }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs /> {/* Usa el componente de breadcrumbs aquí */}
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <Button onClick={handleNewClick}>Nuevo Estudiante</Button>
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
            {data && data.length > 0 ? (
              data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell>
                    {c.nombre} <br />
                    <small>{c.email}</small>
                  </TableCell>
                  <TableCell>{c.rut}</TableCell>
                  <TableCell>1ero Medio A</TableCell>
                  <TableCell>
                    <Button className="mr-2" onClick={() => handleEditClick(c)}>
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
                    <Button onClick={() => handleDeleteClick(c)}>
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
                    type="email"
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
                  <Label htmlFor="password">Contraseña sesión</Label>
                  <Input
                    id="clave"
                    name="clave"
                    type="password"
                    onChange={handleNewInputChange}
                    placeholder="Contraseña"
                  />
                </div>
                {/* <div>
                  <Label htmlFor="activo">Activo </Label>
                  <Checkbox id="activo" name="activo" defaultChecked />
                </div> */}
              </div>
            </form>

            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseNewModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNew}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Estudiantes;
