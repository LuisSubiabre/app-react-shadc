import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getJefatura } from "@/services/jefaturaService";
import { CursoType, EstudianteType } from "@/types/index.ts";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileDown } from "lucide-react";
import { estudiantesCurso } from "@/services/estudiantesService";
import { useAuth } from "@/hooks/useAuth";
import { getTalleresByCursoJefatura } from "@/services/talleresService";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ModalVerAtrasos } from "@/components/atrasos/ModalVerAtrasos";
import { getAtrasosByEstudiante } from "@/services/atrasosService";
import { Atraso } from "@/types";
import { ModalVerAsistencia } from "@/components/asistencia/ModalVerAsistencia";
import { getAsistenciaEstudiante } from "@/services/asistenciaService";
import { AsistenciaEstudiante } from "@/types/asistencia";

interface TallerACLE {
  estudiante_id: number;
  nombre_estudiante: string;
  nombre_curso: string;
  taller_id: number;
  nombre_taller: string;
  horario: string;
  ubicacion: string;
}

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

const PageJefatura = () => {
  const [curso, setCurso] = useState<CursoType | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [error, setError] = useState("");
  const [errorEstudiantes, setErrorEstudiantes] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState<boolean>(true);
  const { user } = useAuth() || {};
  const [selectedEstudiante, setSelectedEstudiante] =
    useState<EstudianteType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [atrasos, setAtrasos] = useState<Atraso[]>([]);
  const [isModalAsistenciaOpen, setIsModalAsistenciaOpen] = useState(false);
  const [asistencias, setAsistencias] = useState<AsistenciaEstudiante[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(3);
  const [asistencia, setAsistencia] = useState<AsistenciaEstudiante | null>(
    null
  );

  useEffect(() => {
    getJefatura(Number(user?.id))
      .then((response) => {
        if (response) {
          setCurso(response);
          console.log("Curso: ", response);
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
    if (curso) {
      estudiantesCurso(curso.curso_id)
        .then((response) => {
          setEstudiantes(response);
        })
        .catch(() => {
          setErrorEstudiantes(
            "No se pudo cargar la información de los estudiantes"
          );
        })
        .finally(() => {
          setLoadingEstudiantes(false);
        });
    }
  }, [curso]);

  const exportarACLEs = async () => {
    if (!curso) return;

    try {
      const response = await getTalleresByCursoJefatura(curso.curso_id);
      const talleres = response.talleres as TallerACLE[];

      if (!talleres || talleres.length === 0) {
        setError("No hay talleres ACLE para este curso");
        return;
      }

      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Configuración de página
      doc.setProperties({
        title: `Listado ACLES - ${curso.curso_nombre}`,
        subject: "Listado de talleres ACLE",
        author: "Sistema Liceo Experimental",
        keywords: "ACLE, talleres, estudiantes",
        creator: "Sistema Liceo Experimental",
      });

      // Encabezado con logo (opcional)
      // doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);

      // Título principal
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("LISTADO DE TALLERES ACLE", 14, 20);

      // Información del curso
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`Curso: ${curso.curso_nombre}`, 14, 30);

      // Fecha y hora de generación
      doc.setFontSize(10);
      const fechaActual = new Date();
      const fechaFormateada = fechaActual.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const horaFormateada = fechaActual.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Fecha: ${fechaFormateada}`, 14, 38);
      doc.text(`Hora: ${horaFormateada}`, 14, 44);

      // Resumen
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total de estudiantes inscritos: ${talleres.length}`, 14, 54);

      // Línea separadora
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(14, 58, 196, 58);

      // Preparar datos para la tabla
      const tableData = talleres.map((taller: TallerACLE) => [
        taller.nombre_estudiante,
        taller.nombre_taller,
        taller.horario,
        taller.ubicacion,
      ]);

      // Configurar y generar la tabla
      autoTable(doc, {
        startY: 65,
        head: [["Estudiante", "Taller", "Horario", "Ubicación"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { top: 65, left: 14, right: 14, bottom: 20 },
      });

      // Pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);

        // Nombre del liceo
        doc.setFont("helvetica", "bold");
        doc.text(
          "Liceo Experimental Umag",
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 15,
          { align: "center" }
        );

        // Numeración de páginas
        doc.setFont("helvetica", "normal");
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Guardar el PDF
      doc.save(`ACLEs_${curso.curso_nombre.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error al exportar ACLEs:", error);
      setError("Error al exportar el listado de ACLEs");
    }
  };

  const handleOpenModal = async (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsModalOpen(true);
    try {
      const response = await getAtrasosByEstudiante(
        estudiante.estudiante_id || estudiante.id
      );
      setAtrasos(response);
    } catch (error) {
      console.error("Error al cargar atrasos:", error);
      setAtrasos([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEstudiante(null);
  };

  const handleOpenModalAsistencia = async (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsModalAsistenciaOpen(true);
    try {
      const response = await getAsistenciaEstudiante(
        estudiante.estudiante_id || estudiante.id
      );

      if (response && response.length > 0) {
        setAsistencias(response);
        // Encontrar la asistencia del mes actual
        const asistenciaActual = response.find(
          (a: AsistenciaEstudiante) => a.mes === mesSeleccionado
        );
        setAsistencia(asistenciaActual || null);
      } else {
        setAsistencias([]);
        setAsistencia(null);
      }
    } catch (error) {
      console.error("Error al cargar asistencia:", error);
      setAsistencias([]);
      setAsistencia(null);
    }
  };

  const handleCloseModalAsistencia = () => {
    setIsModalAsistenciaOpen(false);
    setSelectedEstudiante(null);
  };

  const handleMesChange = (mes: number) => {
    setMesSeleccionado(mes);
    const asistenciaDelMes = asistencias.find(
      (a: AsistenciaEstudiante) => a.mes === mes
    );
    setAsistencia(asistenciaDelMes || null);
  };

  if (loading) return <div>Cargando...</div>;

  if (!curso)
    return (
      <div className="flex justify-center items-center h-full px-36">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Jefatura</h1>
          <Button onClick={exportarACLEs} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Listado ACLES
          </Button>
        </div>
        <h2>{curso?.curso_nombre}</h2>

        {loadingEstudiantes && <div>Cargando...</div>}
        {errorEstudiantes && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorEstudiantes}</AlertDescription>
          </Alert>
        )}

        {!loadingEstudiantes && !errorEstudiantes && (
          <Table>
            <TableCaption>Lista de estudiantes</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>RUN</TableHead>
                <TableHead>Atrasos</TableHead>
                <TableHead>Asistencia</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Inf. Personalidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudiantes.map((estudiante: EstudianteType, index: number) => (
                <TableRow key={estudiante.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {estudiante.nombre} <br />{" "}
                    <span className="text-xs">{estudiante.email}</span>
                  </TableCell>
                  <TableCell>{estudiante.rut}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(estudiante)}
                      className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModalAsistencia(estudiante)}
                      className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    {/* <BookOpenText /> */}
                  </TableCell>
                  <TableCell>
                    {/* <Button variant="outline" className="w-full">
                      Ver
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ModalVerAtrasos
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estudiante={selectedEstudiante}
        atrasos={atrasos}
      />

      <ModalVerAsistencia
        isOpen={isModalAsistenciaOpen}
        onClose={handleCloseModalAsistencia}
        estudiante={selectedEstudiante}
        asistencia={asistencia}
        mesSeleccionado={mesSeleccionado}
        onMesChange={handleMesChange}
      />
    </>
  );
};

export default PageJefatura;
