import Breadcrumbs from "@/components/ui/Breadcrumbs";
import React, { useState } from "react";
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts";
import { AlertCircle, Users, FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CursoApiResponseType, EstudianteType } from "@/types";
import { estudiantesCurso } from "@/services/estudiantesService";
import { getInformePersonalidad } from "@/services/informePersonalidadService";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { InformePersonalidad } from "@/types/informePersonalidad";

const FORMACION_ETICA_ITEMS = [
  "Es responsable con sus tareas, trabajos y demás obligaciones escolares.",
  "Asiste a clases en forma puntual y constante",
  "Trata con respeto a sus compañeros/as, profesores/as y miembros de la comunidad",
  "Es honesto(a) en su trabajo y en su vida escolar en general, asumiendo responsabilidades en sus acciones",
  "Respeta las normas de convivencia establecidas",
  "Respeta ideas y creencias distintas a las propias",
  "Es un alumno(a) solidario(a) y generoso(a) con los demás",
  "Utiliza el diálogo como medio de resolución de conflictos",
];

const CRECIMIENTO_ITEMS = [
  "Reconoce sus virtudes y defectos",
  "Es responsable con los compromisos que adquiere",
  "Se preocupa por su higiene y presentación personal",
  "Reacciona positivamente frente a situaciones nuevas o conflictivas",
  "Reconoce sus errores y trata de superarlos",
];

const ENTORNO_ITEMS = [
  "Tiene un grupo de amigos(as) estable",
  "Ayuda a sus compañeros(as)",
  "Propone ideas al grupo",
  "Se ofrece voluntario(a) en las actividades a realizar",
  "Actúa con responsabilidad en el cuidado del medio ambiente",
  "Participa en actividades que el Liceo programa en la comunidad",
  "Respeta las normas disciplinarias y seguridad vigentes en el Liceo",
];

const APRENDIZAJE_ITEMS = [
  "Atiende en clases",
  "Se concentra adecuadamente en el trabajo",
  "Demuestra interés y compromiso por su aprendizaje",
  "Desarrolla al máximo sus capacidades",
  "Demuestra sentido de superación",
  "Participa activamente durante la clase y/o actividades",
  "Asiste regularmente a rendir sus evaluaciones, en fecha indicada",
];

const CONDUCTAS_ITEMS = [
  "Agresividad",
  "Estado de ánimo decaído",
  "Conflictos interpersonales",
  "Aislamiento, soledad",
  "Episodios de ansiedad inmanejables",
  "Excesiva pasividad",
  "Desinterés en labores académicas",
];

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

const PageInformes = () => {
  const { error, loading, funcionarioCursos } = useCursosFuncionarios();
  const [isEstudiantesModalOpen, setIsEstudiantesModalOpen] =
    useState<boolean>(false);
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState<boolean>(false);
  const [errorEstudiantes, setErrorEstudiantes] = useState<string | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] =
    useState<CursoApiResponseType | null>(null);
  const [loadingPDF, setLoadingPDF] = useState<number | null>(null);

  const handleVerEstudiantes = async (curso: CursoApiResponseType) => {
    setCursoSeleccionado(curso);
    setIsEstudiantesModalOpen(true);
    setLoadingEstudiantes(true);
    setErrorEstudiantes(null);
    setEstudiantes([]);

    try {
      const response = await estudiantesCurso(curso.id);
      if (response) {
        setEstudiantes(response);
      } else {
        setErrorEstudiantes(
          "No se pudo cargar la información de los estudiantes"
        );
        setEstudiantes([]);
      }
    } catch (err) {
      setErrorEstudiantes("Error al cargar los estudiantes. " + err);
      setEstudiantes([]);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const generarPDFInformeEstudiante = async (
    informe: InformePersonalidad,
    doc: jsPDF,
    fecha: string
  ) => {
    // Agregar logo
    const logoUrl =
      "https://res.cloudinary.com/dx219dazh/image/upload/v1744723831/varios/urcbzygzvfvzupglmwqy.png";
    const logoWidth = 35;
    const logoHeight = 10;
    doc.addImage(logoUrl, "PNG", 20, 8, logoWidth, logoHeight);

    // Establecer fuente y colores
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);

    // Nombre de la institución
    doc.setFontSize(9);
    //doc.text("Liceo Experimental UMAG", 65, 15);

    // Título principal
    doc.setFontSize(12);
    doc.text("Informe de Personalidad", 105, 22, { align: "center" });

    // Línea decorativa superior
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(20, 26, 190, 26);

    // Información del estudiante
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const infoY = 32;
    const nombreEstudiante = `Estudiante: ${informe.estudiante_nombre}`;
    const curso = `Curso: ${informe.curso_nombre}`;
    doc.text(nombreEstudiante, 20, infoY);
    doc.text(curso, 20 + doc.getTextWidth(nombreEstudiante) + 10, infoY);

    // I. FORMACIÓN ÉTICA
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("I. FORMACIÓN ÉTICA", 20, infoY + 10);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    let y = infoY + 16;
    FORMACION_ETICA_ITEMS.forEach((item, index) => {
      const valor =
        informe[`formacion_etica_${index + 1}` as keyof typeof informe];
      doc.text(`${index + 1}. ${item}: ${valor}`, 25, y);
      y += 4;
    });

    // II. CRECIMIENTO Y AUTOAFIRMACIÓN PERSONAL
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("II. CRECIMIENTO Y AUTOAFIRMACIÓN PERSONAL", 20, y + 3);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    y += 9;

    CRECIMIENTO_ITEMS.forEach((item, index) => {
      const valor = informe[`crecimiento_${index + 1}` as keyof typeof informe];
      doc.text(`${index + 1}. ${item}: ${valor}`, 25, y);
      y += 4;
    });

    // III. LA PERSONA Y SU ENTORNO
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("III. LA PERSONA Y SU ENTORNO", 20, y + 3);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    y += 9;

    ENTORNO_ITEMS.forEach((item, index) => {
      const valor = informe[`entorno_${index + 1}` as keyof typeof informe];
      doc.text(`${index + 1}. ${item}: ${valor}`, 25, y);
      y += 4;
    });

    // IV. ÁREA DE APRENDIZAJE
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("IV. ÁREA DE APRENDIZAJE", 20, y + 3);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    y += 9;

    APRENDIZAJE_ITEMS.forEach((item, index) => {
      const valor = informe[`aprendizaje_${index + 1}` as keyof typeof informe];
      doc.text(`${index + 1}. ${item}: ${valor}`, 25, y);
      y += 4;
    });

    // V. CONDUCTAS PREOCUPANTES
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("V. CONDUCTAS PREOCUPANTES", 20, y + 3);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    y += 9;

    CONDUCTAS_ITEMS.forEach((item, index) => {
      const valor = informe[`conductas_${index + 1}` as keyof typeof informe];
      doc.text(`${index + 1}. ${item}: ${valor}`, 25, y);
      y += 4;
    });

    // VI. COMENTARIOS
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("VI. OBSERVACIONES", 20, y + 3);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    y += 9;

    if (informe.observaciones) {
      const observaciones = doc.splitTextToSize(informe.observaciones, 170);
      doc.text(observaciones, 25, y);
      y += observaciones.length * 4;
    }

    // Espacio para firmas y timbres
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);

    // Línea izquierda (Profesor Jefe)
    doc.line(20, y + 20, 100, y + 20);
    doc.setFontSize(7);
    const nombreProfesor = cursoSeleccionado?.jefatura || "Profesor Jefe";
    const anchoProfesor = doc.getTextWidth(nombreProfesor);
    const xProfesor = 20 + (80 - anchoProfesor) / 2;
    doc.text(nombreProfesor, xProfesor, y + 25);

    doc.setFontSize(6);
    const textoProfesor = "PROFESOR JEFE";
    const anchoTextoProfesor = doc.getTextWidth(textoProfesor);
    const xTextoProfesor = 20 + (80 - anchoTextoProfesor) / 2;
    doc.text(textoProfesor, xTextoProfesor, y + 30);

    // Línea derecha (Director)
    doc.line(110, y + 20, 190, y + 20);

    doc.setFontSize(7);
    const nombreDirector =
      cursoSeleccionado?.id &&
      cursoSeleccionado.id >= 22 &&
      cursoSeleccionado.id <= 33
        ? "MAVIS OYARZÚN"
        : cursoSeleccionado?.id &&
          cursoSeleccionado.id >= 6 &&
          cursoSeleccionado.id <= 21
        ? "MARIBEL MANSILLA"
        : "ORIENTADOR(A)";
    const anchoDirector = doc.getTextWidth(nombreDirector);
    const xDirector = 110 + (80 - anchoDirector) / 2;
    doc.text(nombreDirector, xDirector, y + 25);

    doc.setFontSize(6);
    const textoDirector =
      cursoSeleccionado?.id &&
      cursoSeleccionado.id >= 22 &&
      cursoSeleccionado.id <= 33
        ? "ORIENTACIÓN E.M."
        : cursoSeleccionado?.id &&
          cursoSeleccionado.id >= 6 &&
          cursoSeleccionado.id <= 21
        ? "ORIENTACIÓN E.G.B."
        : "ORIENTACIÓN";
    const anchoTextoDirector = doc.getTextWidth(textoDirector);
    const xTextoDirector = 110 + (80 - anchoTextoDirector) / 2;
    doc.text(textoDirector, xTextoDirector, y + 30);

    // Pie de página
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text(`Impreso el: ${fecha}`, 20, y + 40);

    return informe.estudiante_nombre;
  };

  const generarPDFInforme = async (estudiante: EstudianteType) => {
    setLoadingPDF(estudiante.id);
    try {
      const informe = await getInformePersonalidad(
        estudiante.estudiante_id || estudiante.id
      );
      const doc = new jsPDF() as JsPDFWithAutoTable;
      const fecha = new Date().toLocaleDateString();

      const nombreEstudiante = await generarPDFInformeEstudiante(
        informe,
        doc,
        fecha
      );
      doc.save(
        `informe_personalidad_${nombreEstudiante.replace(/\s+/g, "_")}.pdf`
      );
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setLoadingPDF(null);
    }
  };

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
              Informes de Personalidad
            </h1>
            <p className="text-muted-foreground">
              Informes de personalidad de estudiantes.
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[200px] font-semibold">
                  Nombre
                </TableHead>
                <TableHead className="w-[200px] font-semibold">
                  Jefatura
                </TableHead>
                <TableHead className="w-[150px] font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarioCursos.length > 0 ? (
                funcionarioCursos.map((curso) => (
                  <TableRow
                    key={curso.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {curso.nombre}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {curso.jefatura}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVerEstudiantes(curso)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Users className="size-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
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
                        No hay cursos asignados
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de Estudiantes */}
      <Dialog
        open={isEstudiantesModalOpen}
        onOpenChange={setIsEstudiantesModalOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Estudiantes del Curso {cursoSeleccionado?.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {loadingEstudiantes ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
              </div>
            ) : errorEstudiantes ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorEstudiantes}</AlertDescription>
              </Alert>
            ) : !estudiantes || estudiantes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay estudiantes en este curso
              </div>
            ) : (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N.</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>RUT</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estudiantes.map((estudiante) => (
                      <TableRow key={estudiante.estudiante_id}>
                        <TableCell>{estudiante.numlista}</TableCell>
                        <TableCell>{estudiante.nombre}</TableCell>
                        <TableCell>{estudiante.rut}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generarPDFInforme(estudiante)}
                            disabled={loadingPDF === estudiante.id}
                            className="flex items-center gap-2"
                          >
                            {loadingPDF === estudiante.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                              <FileDown className="h-4 w-4" />
                            )}
                            Imprimir PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageInformes;
