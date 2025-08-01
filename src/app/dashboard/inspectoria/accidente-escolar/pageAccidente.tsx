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
  DialogDescription,
} from "@/components/ui/dialog";
import { PDFDocument } from "pdf-lib";
import { insertAccidente } from "@/services/inspectoriaService";
import { HistorialAccidentes } from "@/components/HistorialAccidentes";
import { Search, BookOpen, Users, AlertCircle } from "lucide-react";

// Función para obtener el número del día de la semana
const getNumeroDiaSemana = (dia: string): string => {
  const map: { [key: string]: string } = {
    Lunes: "1",
    Martes: "2",
    Miercoles: "3",
    Jueves: "4",
    Viernes: "5",
    Sabado: "6",
    Domingo: "7",
  };
  return map[dia] || "";
};

// Función para obtener el código del tipo de accidente
const getCodigoTipoAccidente = (tipo: string): string => {
  const map: { [key: string]: string } = {
    "De Trayecto": "1",
    "En La escuela": "2",
  };
  return map[tipo] || "";
};

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
  telpar: string | number;
  celular: string | number;
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
  const [estudianteData, setEstudianteData] = useState<EstudianteData | null>(
    null
  );
  const [selectedEstudiante, setSelectedEstudiante] =
    useState<EstudianteType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Nuevos estados para el formulario de accidente con valores por defecto
  const [fechaRegistro, setFechaRegistro] = useState<Date>(new Date());
  const [horaAccidente, setHoraAccidente] = useState<string>("14");
  const [minutoAccidente, setMinutoAccidente] = useState<string>("30");
  const [fechaAccidente, setFechaAccidente] = useState<Date>(new Date());
  const [diaSemanaAccidente, setDiaSemanaAccidente] = useState<string>("Lunes");
  const [tipoAccidente, setTipoAccidente] = useState<string>("En La escuela");
  const [horario, setHorario] = useState<string>("COMPLETA");
  const [circunstanciaAccidente, setCircunstanciaAccidente] =
    useState<string>("");

  // Estados para los testigos
  const [testigos, setTestigos] = useState([
    { nombre: "", cedula: "" },
    { nombre: "", cedula: "" },
  ]);

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
    setErrorMessage(null);
    try {
      const rutFormateado = formatRut(estudiante.rut || "");
      console.log("RUT formateado:", rutFormateado);

      const response = await fetch(
        `https://nerv.liceoexperimental.cl/api/matalumno?rut=${rutFormateado}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener datos del estudiante");
      }
      const data = await response.json();

      if (!data || Object.keys(data).length === 0) {
        throw new Error("No se pudo obtener la información del estudiante");
      }

      setEstudianteData(data);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("No se pudo obtener la información del estudiante");
    }
  };

  const generarPDF = async () => {
    if (!estudianteData || !selectedEstudiante) return;

    try {
      console.log("Estudiante seleccionado:", selectedEstudiante);

      // Obtener el ID del estudiante y asegurarnos de que sea un número válido
      const estudianteId = Number(
        selectedEstudiante.id || selectedEstudiante.estudiante_id
      );

      if (isNaN(estudianteId)) {
        throw new Error("No se pudo obtener un ID válido del estudiante");
      }

      // Preparar los datos del accidente
      const accidenteData = {
        estudiante_id: estudianteId,
        rut_estudiante: String(estudianteData.rutalum).trim(),
        nombre_estudiante:
          `${estudianteData.patalum} ${estudianteData.matalum} ${estudianteData.nomalum}`.trim(),
        fecha_nacimiento: estudianteData.fecnac,
        edad: Number(estudianteData.edad_calculada),
        sexo: String(estudianteData.sexo).trim(),
        direccion: String(estudianteData.dirpar).trim(),
        celular: String(estudianteData.celular || "").trim(),
        curso: `${estudianteData.cursole} ${estudianteData.letra}`.trim(),
        fecha_registro: new Date().toISOString().split("T")[0],
        fecha_accidente: fechaAccidente.toISOString().split("T")[0],
        hora_accidente: `${horaAccidente}:${minutoAccidente}`,
        dia_semana: diaSemanaAccidente,
        tipo_accidente: tipoAccidente,
        horario: horario,
        circunstancia: circunstanciaAccidente.trim(),
        testigo1_nombre: (testigos[0]?.nombre || "").trim(),
        testigo1_cedula: (testigos[0]?.cedula || "").trim(),
        testigo2_nombre: (testigos[1]?.nombre || "").trim(),
        testigo2_cedula: (testigos[1]?.cedula || "").trim(),
      } as const;

      console.log("Datos a enviar:", accidenteData);

      try {
        // Enviar datos al backend
        await insertAccidente(accidenteData);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al guardar los datos del accidente";
        console.error("Error al enviar datos al backend:", errorMessage);
        throw new Error(
          "Error al guardar los datos del accidente. Por favor, intente nuevamente."
        );
      }

      // Continuar con la generación del PDF
      const response = await fetch(
        "/static/Declaracion-Individual-de-Accidente.pdf",
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al cargar el PDF: ${response.status} ${response.statusText}`
        );
      }

      const pdfBytes = await response.arrayBuffer();

      // Verificar que el PDF sea válido
      if (pdfBytes.byteLength === 0) {
        throw new Error("El archivo PDF está vacío");
      }

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

      const estudianteGenero = `${estudianteData.sexo === "M" ? "1" : "2"} `;
      page.drawText(estudianteGenero, {
        x: 422,
        y: 600,
        size: 8,
      });

      // Fecha de nacimiento
      const fechaNacimiento = estudianteData.fecnac
        .split("-")
        .reverse()
        .join("/");
      page.drawText(fechaNacimiento, {
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
      const horaAccidenteFormateada = `${horaAccidente.split("").join("   ")}`;
      page.drawText(horaAccidenteFormateada, {
        x: 65,
        y: 480,
        size: 10,
      });
      // Agregar la hora del accidente
      const minutoAccidenteFormateada = `${minutoAccidente
        .split("")
        .join("   ")}`;
      page.drawText(minutoAccidenteFormateada, {
        x: 90,
        y: 480,
        size: 10,
      });

      // Agregar la fecha del accidente
      const fecha = new Date(fechaAccidente);
      // Ajustar la fecha para evitar problemas de zona horaria
      const dia = fecha
        .getUTCDate()
        .toString()
        .padStart(2, "0")
        .split("")
        .join("   ");
      const mes = (fecha.getUTCMonth() + 1)
        .toString()
        .padStart(2, "0")
        .split("")
        .join("   ");
      const año = fecha.getUTCFullYear().toString();

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
      //console.log(selectedEstudiante);
      // Fecha de Registro
      const fechaReg = new Date(fechaRegistro);
      // Ajustar la fecha para evitar problemas de zona horaria
      const diaReg = fechaReg
        .getUTCDate()
        .toString()
        .padStart(2, "0")
        .split("")
        .join("   ");
      const mesReg = (fechaReg.getUTCMonth() + 1)
        .toString()
        .padStart(2, "0")
        .split("")
        .join("   ");
      const añoReg = fechaReg.getUTCFullYear().toString();

      // Dibujar día
      page.drawText(diaReg, {
        x: 330,
        y: 655,
        size: 10,
      });

      // Dibujar mes
      page.drawText(mesReg, {
        x: 355,
        y: 655,
        size: 10,
      });

      // Dibujar año
      page.drawText(añoReg, {
        x: 390,
        y: 655,
        size: 10,
      });

      // Dia semana accidente
      const numeroDiaSemana = getNumeroDiaSemana(diaSemanaAccidente);
      const codigoTipoAccidente = getCodigoTipoAccidente(tipoAccidente);

      page.drawText(numeroDiaSemana, {
        x: 135,
        y: 430,
        size: 10,
      });

      // Tipo de accidente
      page.drawText(codigoTipoAccidente, {
        x: 250,
        y: 430,
        size: 10,
      });

      // Horario
      page.drawText(horario, {
        x: 190,
        y: 670,
        size: 10,
      });

      // Testigos
      testigos.forEach((testigo, index) => {
        if (testigo.nombre) {
          // Nombre del testigo
          page.drawText(testigo.nombre, {
            x: 290,
            y: 445 - index * 35,
            size: 10,
          });

          // Cédula del testigo
          if (testigo.cedula) {
            page.drawText(testigo.cedula, {
              x: 420,
              y: 445 - index * 35,
              size: 10,
            });
          }
        }
      });

      // Circunstancia del accidente
      const wrapText = (text: string, maxChars: number): string[] => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (testLine.length <= maxChars) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines;
      };

      const lineasCircunstancia = wrapText(circunstanciaAccidente, 75);
      lineasCircunstancia.forEach((linea, index) => {
        page.drawText(linea, {
          x: 60,
          y: 360 - index * 17, // 15 es el espacio entre líneas
          size: 10,
        });
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

      // Cerrar el diálogo y mostrar mensaje de éxito
      setIsDialogOpen(false);
      setSuccessMessage("Archivo generado exitosamente");

      // Limpiar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error al modificar el PDF:", error);
      setErrorMessage(
        "Error al generar el PDF. Por favor, intente nuevamente."
      );
    }
  };

  const handleTestigoChange = (
    index: number,
    field: "nombre" | "cedula",
    value: string
  ) => {
    const nuevosTestigos = [...testigos];
    nuevosTestigos[index][field] = value;
    setTestigos(nuevosTestigos);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-md shadow-md flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          {successMessage}
        </div>
      )}
      <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Accidente Escolar
            </h1>
            <p className="text-muted-foreground text-lg">
              Registra y gestiona los accidentes escolares de los estudiantes
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">
                  Filtrar por curso
                </label>
                <Select
                  value={selectedCurso}
                  onValueChange={setSelectedCurso}
                >
                  <SelectTrigger className="w-full h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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

              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-300">
                  Buscar estudiante
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre, RUT o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredEstudiantes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudiantes activos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredEstudiantes.filter((e) => e.activo).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudiantes inactivos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredEstudiantes.filter((e) => !e.activo).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lista de Estudiantes
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredEstudiantes.length} estudiantes encontrados
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">ID</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nombre</TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Curso</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        <p className="text-muted-foreground font-medium">
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
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            estudiante.activo
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
                          <span className="font-medium text-gray-900 dark:text-white">
                            {estudiante.nombre}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {estudiante.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10">
                          {estudiante.curso_nombre}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <HistorialAccidentes estudianteId={estudiante.id} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegistrarAccidente(estudiante)}
                            className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                          >
                            Registrar Accidente
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8 text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          No hay estudiantes disponibles
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Registro de Accidente Escolar</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Complete los datos del accidente escolar para generar el PDF correspondiente.
            </DialogDescription>
          </DialogHeader>
          {errorMessage ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          ) : (
            estudianteData && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Información del Estudiante
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Nombre Completo
                        </span>
                        <span className="text-base text-gray-900 dark:text-white">{`${estudianteData.patalum} ${estudianteData.matalum} ${estudianteData.nomalum}`}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          RUT
                        </span>
                        <span className="text-base text-gray-900 dark:text-white">
                          {estudianteData.rutalum}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Curso
                        </span>
                        <span className="text-base text-gray-900 dark:text-white">{`${estudianteData.cursole} ${estudianteData.letra}`}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Fecha de Nacimiento
                        </span>
                        <span className="text-base text-gray-900 dark:text-white">
                          {estudianteData.fecnac}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Edad
                        </span>
                        <span className="text-base text-gray-900 dark:text-white">
                          {estudianteData.edad} años
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Sexo
                        </span>
                        <span className="text-base text-gray-900 dark:text-white">{estudianteData.sexo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Información de Contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Dirección
                      </span>
                      <span className="text-base text-gray-900 dark:text-white">{estudianteData.dirpar}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Teléfono Celular
                      </span>
                      <span className="text-base text-gray-900 dark:text-white">
                        {estudianteData.celular}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha de Registro
                    </label>
                    <Input
                      type="date"
                      value={fechaRegistro.toISOString().split("T")[0]}
                      onChange={(e) =>
                        setFechaRegistro(new Date(e.target.value))
                      }
                      className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hora del Accidente
                    </label>
                    <div className="flex gap-2">
                      <Select
                        value={horaAccidente}
                        onValueChange={setHoraAccidente}
                      >
                        <SelectTrigger className="w-1/2 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 25 }, (_, i) => {
                            const hora = i.toString().padStart(2, "0");
                            return (
                              <SelectItem key={hora} value={hora}>
                                {hora}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      <Select
                        value={minutoAccidente}
                        onValueChange={setMinutoAccidente}
                      >
                        <SelectTrigger className="w-1/2 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Minutos" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => {
                            const minuto = i.toString().padStart(2, "0");
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha del Accidente
                    </label>
                    <Input
                      type="date"
                      value={fechaAccidente.toISOString().split("T")[0]}
                      onChange={(e) =>
                        setFechaAccidente(new Date(e.target.value))
                      }
                      className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Día de la Semana
                    </label>
                    <Select
                      value={diaSemanaAccidente}
                      onValueChange={setDiaSemanaAccidente}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Seleccione el día" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lunes">Lunes</SelectItem>
                        <SelectItem value="Martes">Martes</SelectItem>
                        <SelectItem value="Miercoles">Miércoles</SelectItem>
                        <SelectItem value="Jueves">Jueves</SelectItem>
                        <SelectItem value="Viernes">Viernes</SelectItem>
                        <SelectItem value="Sabado">Sábado</SelectItem>
                        <SelectItem value="Domingo">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Accidente
                    </label>
                    <Select
                      value={tipoAccidente}
                      onValueChange={setTipoAccidente}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="De Trayecto">De Trayecto</SelectItem>
                        <SelectItem value="En La escuela">
                          En La escuela
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Horario</label>
                    <Select value={horario} onValueChange={setHorario}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Seleccione el horario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAÑANA">Mañana</SelectItem>
                        <SelectItem value="TARDE">Tarde</SelectItem>
                        <SelectItem value="COMPLETA">Completa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Circunstancia del Accidente
                  </label>
                  <textarea
                    className="w-full min-h-[80px] p-2 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describa cómo ocurrió el accidente (máximo 250 caracteres)"
                    value={circunstanciaAccidente}
                    onChange={(e) => {
                      if (e.target.value.length <= 250) {
                        setCircunstanciaAccidente(e.target.value);
                      }
                    }}
                    maxLength={250}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                    {circunstanciaAccidente.length}/250 caracteres
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Testigos (Opcional)
                  </h3>
                  <div className="space-y-3">
                    {testigos.map((testigo, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Input
                            placeholder={`Nombre y Apellido Testigo ${
                              index + 1
                            }`}
                            value={testigo.nombre}
                            onChange={(e) =>
                              handleTestigoChange(
                                index,
                                "nombre",
                                e.target.value
                              )
                            }
                            className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          />
                        </div>
                        <div className="space-y-1">
                          <Input
                            placeholder="Cédula de Identidad"
                            value={testigo.cedula}
                            onChange={(e) =>
                              handleTestigoChange(
                                index,
                                "cedula",
                                e.target.value
                              )
                            }
                            className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
          <DialogFooter className="mt-4">
            {!errorMessage && estudianteData && (
              <Button 
                onClick={generarPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageAccidenteEscolar;
