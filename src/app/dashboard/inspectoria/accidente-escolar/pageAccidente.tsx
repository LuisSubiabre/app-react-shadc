import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CursoApiResponseType, EstudianteType } from "@/types";
import { getCursos } from "@/services/cursosService";
import {
  estudiantesCurso,
  getEstudiantes,
} from "@/services/estudiantesService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PDFDocument } from "pdf-lib";

interface EstudianteData {
  unico: number;
  ano: string;
  patalum: string;
  matalum: string;
  nomalum: string;
  rutalum: string;
  fecnac: string;
  edad: number;
  edad_calculada: number;
  sexo: string;
  dirpar: string;
  telpar: number;
  celular: number;
  currep: string;
  vivecon: string;
  coleproced: string;
  nulo: string;
  mat2024: string;
  fecmat: string;
  correo: string;
  cursole: string;
  letra: string;
  real2024: string;
  is_active: boolean;
  is_staff: boolean;
}

const PageAccidenteEscolar = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [estudianteData, setEstudianteData] = useState<EstudianteData | null>(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteType | null>(null);

  // Nuevos estados para el formulario de accidente con valores por defecto
  const [fechaRegistro, setFechaRegistro] = useState<Date>(new Date());
  const [horaAccidente, setHoraAccidente] = useState<string>("14");
  const [minutoAccidente, setMinutoAccidente] = useState<string>("30");
  const [fechaAccidente, setFechaAccidente] = useState<Date>(new Date());
  const [diaSemanaAccidente, setDiaSemanaAccidente] = useState<string>("Lunes");
  const [tipoAccidente, setTipoAccidente] = useState<string>("En La escuela");
  const [circunstanciaAccidente, setCircunstanciaAccidente] = useState<string>("El estudiante se cayó en el patio durante el recreo, sufriendo una fractura en el brazo derecho.");

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await getCursos();
        if (response) {
          setCursos(response.data);
        }
      } catch (error) {
        console.error("Error al obtener cursos:", error);
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      setIsLoading(true);
      try {
        if (selectedCurso === "all") {
          const response = await getEstudiantes();
          setEstudiantes(Array.isArray(response.data) ? response.data : []);
          setIsLoading(false);
          return;
        }

        const response = await estudiantesCurso(parseInt(selectedCurso));

        if (response) {
          setEstudiantes(response);
        } else {
          setEstudiantes([]);
        }
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        setEstudiantes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEstudiantes();
  }, [selectedCurso]);

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredEstudiantes = estudiantes
    .filter((estudiante) => {
      if (!searchTerm) return true;

      const searchTermNormalized = normalizeString(
        searchTerm.toLowerCase().replace(/\s+/g, " ").trim()
      );
      const nombreNormalized = normalizeString(estudiante.nombre.toLowerCase());
      const rutNormalized = normalizeString(
        estudiante.rut?.toLowerCase() || ""
      );
      const emailNormalized = normalizeString(
        estudiante.email?.toLowerCase() || ""
      );
      const cursoNormalized = normalizeString(
        estudiante.curso_nombre?.toLowerCase() || ""
      );

      if (searchTermNormalized.includes(" ")) {
        const searchWords = searchTermNormalized.split(" ");
        return searchWords.every(
          (word) =>
            nombreNormalized.includes(word) ||
            rutNormalized.includes(word) ||
            emailNormalized.includes(word) ||
            cursoNormalized.includes(word)
        );
      }

      return (
        nombreNormalized.includes(searchTermNormalized) ||
        rutNormalized.includes(searchTermNormalized) ||
        emailNormalized.includes(searchTermNormalized) ||
        cursoNormalized.includes(searchTermNormalized)
      );
    })
    .sort((a, b) => {
      if (!searchTerm) return 0;

      const searchTermNormalized = normalizeString(
        searchTerm.toLowerCase().replace(/\s+/g, " ").trim()
      );
      const nombreANormalized = normalizeString(a.nombre.toLowerCase());
      const nombreBNormalized = normalizeString(b.nombre.toLowerCase());

      const posA = nombreANormalized.indexOf(searchTermNormalized);
      const posB = nombreBNormalized.indexOf(searchTermNormalized);

      if (posA !== posB) {
        return posA - posB;
      }

      return nombreANormalized.localeCompare(nombreBNormalized);
    });

  const formatRut = (rut: string) => {
    // Eliminar todo excepto números y k
    const cleanRut = rut.replace(/[^0-9kK]/g, "");

    // Separar el dígito verificador
    const dv = cleanRut.slice(-1).toUpperCase();
    const numbers = cleanRut.slice(0, -1);

    // Formatear con puntos
    const formattedNumbers = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formattedNumbers}-${dv}`;
  };

  const handleRegistrarAccidente = async (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsDialogOpen(true);
    try {
      const rutFormateado = formatRut(estudiante.rut || "");
      console.log("RUT formateado:", rutFormateado); // Para verificar el formato

      // Nota: Esta llamada fallará por CORS, necesitarás implementar un endpoint en tu backend
      const response = await fetch(
        `https://nerv.liceoexperimental.cl/api/matalumno?rut=${rutFormateado}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener datos del estudiante");
      }
      const data = await response.json();
      setEstudianteData(data);
    } catch (error) {
      console.error("Error:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const generarPDF = async () => {
    if (!estudianteData) return;

    try {
      // Cargar el PDF existente
      const response = await fetch("/Declaracion-Individual-de-Accidente.pdf");
      const pdfBytes = await response.arrayBuffer();

      // Cargar el PDF en pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];

      const estudianteCurso = `${estudianteData.cursole} ${estudianteData.letra}`;
      page.drawText(estudianteCurso, {
        x: 60,
        y: 670,
        size: 10,
      });

      // Añadir el nombre completo del estudiante
      const nombreCompleto = `${estudianteData.patalum} ${estudianteData.matalum} ${estudianteData.nomalum}`;
      page.drawText(nombreCompleto, {
        x: 60,
        y: 613,
        size: 10,
      });

      const estudianteResidencia = `${estudianteData.dirpar} `;
      page.drawText(estudianteResidencia, {
        x: 60,
        y: 560,
        size: 10,
      });

      const estudianteGenero = `${estudianteData.sexo} `;
      page.drawText(estudianteGenero, {
        x: 422,
        y: 600,
        size: 8,
      });

      const estudianteNacimiento = `${estudianteData.fecnac} `;
      page.drawText(estudianteNacimiento, {
        x: 450,
        y: 600,
        size: 8,
      });

      const estudianteEdad = `${estudianteData.edad_calculada} `;
      page.drawText(estudianteEdad, {
        x: 512,
        y: 600,
        size: 8,
      });

      // Agregar la hora del accidente
      const horaAccidenteFormateada = `${horaAccidente.split('').join('   ')}`;
      page.drawText(horaAccidenteFormateada, {
        x: 65,
        y: 480,
        size: 10,
      });
            // Agregar la hora del accidente
  const minutoAccidenteFormateada = `${minutoAccidente.split('').join('   ')}`;
            page.drawText(minutoAccidenteFormateada, {
              x: 90,
              y: 480,
              size: 10,
            });
      

      // Agregar la fecha del accidente
      const fecha = new Date(fechaAccidente);
      const dia = fecha.getDate().toString().padStart(2, '0').split('').join('   ');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0').split('').join('   ');
      const año = fecha.getFullYear().toString();

      // Dibujar día
      page.drawText(dia, {
        x: 270,
        y: 480,
        size: 10,
      });

      // Dibujar mes
      page.drawText(mes, {
        x: 205,
        y: 480,
        size: 10,
      });

      // Dibujar año
      page.drawText(año, {
        x: 140,
        y: 480,
        size: 10,
      });

      // Guardar el PDF modificado
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Crear enlace y descargar
      const link = document.createElement("a");
      link.href = url;
      link.download = `Declaracion-Individual-de-Accidente-${estudianteData.nomalum}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al modificar el PDF:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Accidente Escolar
            </h1>
            <p className="text-muted-foreground mt-2">
              Registra y gestiona los accidentes escolares de los estudiantes
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Filtrar por curso
                  </label>
                  <Select
                    value={selectedCurso}
                    onValueChange={setSelectedCurso}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los cursos</SelectItem>
                      {cursos?.map((curso) => (
                        <SelectItem key={curso.id} value={curso.id.toString()}>
                          {curso.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Buscar estudiante
                  </label>
                  <Input
                    placeholder="Nombre, RUT o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    <span className="font-medium">Total: </span>
                    <span>{filteredEstudiantes.length}</span>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-green-700 dark:text-green-300">
                    <span className="font-medium">Activos: </span>
                    <span>
                      {filteredEstudiantes.filter((e) => e.activo).length}
                    </span>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full text-red-700 dark:text-red-300">
                    <span className="font-medium">Inactivos: </span>
                    <span>
                      {filteredEstudiantes.filter((e) => !e.activo).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    <TableHead className="font-medium">ID</TableHead>
                    <TableHead className="font-medium">Nombre</TableHead>
                    <TableHead className="font-medium">Curso</TableHead>
                    <TableHead className="text-right font-medium">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                          <p className="text-muted-foreground">
                            Cargando estudiantes...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : estudiantes.length > 0 ? (
                    filteredEstudiantes.map((estudiante) => (
                      <TableRow
                        key={estudiante.estudiante_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <TableCell className="font-mono">
                          <span
                            className={`inline-flex items-center gap-2 ${
                              estudiante.activo
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {estudiante.activo ? (
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
                            {estudiante.estudiante_id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {estudiante.nombre}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {estudiante.email}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300">
                            {estudiante.curso_nombre}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegistrarAccidente(estudiante)}
                            className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          >
                            Registrar Accidente
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex flex-col items-center gap-2">
                          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
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
                          </div>
                          <p className="text-muted-foreground">
                            No hay estudiantes disponibles.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Intenta cambiar los filtros de búsqueda
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registro de Accidente Escolar</DialogTitle>
          </DialogHeader>
          {estudianteData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Nombre:</span>{" "}
                    {estudianteData.nomalum}
                  </p>
                  <p>
                    <span className="font-medium">RUT:</span>{" "}
                    {estudianteData.rutalum}
                  </p>
                  <p>
                    <span className="font-medium">Curso Actual:</span>{" "}
                    {estudianteData.cursole} {estudianteData.letra}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Fecha de Nacimiento:</span>{" "}
                    {estudianteData.fecnac}
                  </p>
                  <p>
                    <span className="font-medium">Edad:</span>{" "}
                    {estudianteData.edad} años
                  </p>
                  <p>
                    <span className="font-medium">Sexo:</span>{" "}
                    {estudianteData.sexo}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Información del Accidente</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha de Registro</label>
                    <Input
                      type="date"
                      value={fechaRegistro.toISOString().split('T')[0]}
                      onChange={(e) => setFechaRegistro(new Date(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hora del Accidente</label>
                    <div className="flex gap-2">
                      <Select value={horaAccidente} onValueChange={setHoraAccidente}>
                        <SelectTrigger className="w-1/2">
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 25 }, (_, i) => {
                            const hora = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={hora} value={hora}>
                                {hora}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      <Select value={minutoAccidente} onValueChange={setMinutoAccidente}>
                        <SelectTrigger className="w-1/2">
                          <SelectValue placeholder="Minutos" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => {
                            const minuto = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={minuto} value={minuto}>
                                {minuto}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha del Accidente</label>
                    <Input
                      type="date"
                      value={fechaAccidente.toISOString().split('T')[0]}
                      onChange={(e) => setFechaAccidente(new Date(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Día de la Semana</label>
                    <Select value={diaSemanaAccidente} onValueChange={setDiaSemanaAccidente}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el día" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lunes">Lunes</SelectItem>
                        <SelectItem value="Martes">Martes</SelectItem>
                        <SelectItem value="Miércoles">Miércoles</SelectItem>
                        <SelectItem value="Jueves">Jueves</SelectItem>
                        <SelectItem value="Viernes">Viernes</SelectItem>
                        <SelectItem value="Sábado">Sábado</SelectItem>
                        <SelectItem value="Domingo">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Accidente</label>
                    <Select value={tipoAccidente} onValueChange={setTipoAccidente}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="De Trayecto">De Trayecto</SelectItem>
                        <SelectItem value="En La escuela">En La escuela</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">Circunstancia del Accidente</label>
                  <textarea
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    placeholder="Describa cómo ocurrió el accidente"
                    value={circunstanciaAccidente}
                    onChange={(e) => setCircunstanciaAccidente(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={generarPDF}>Generar PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageAccidenteEscolar;
