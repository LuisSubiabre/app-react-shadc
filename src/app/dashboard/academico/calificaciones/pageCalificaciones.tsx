import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCallback, useState } from "react";
import {
  getAsignaturasCurso,
  getEstudiantesEnAsignatura,
  saveCalificacion,
} from "@/services/academicoService";
import { EstudianteType } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Spinner from "@/components/Spinner";
import { FiltrosCalificaciones } from "@/components/calificaciones/FiltrosCalificaciones";
import { TablaCalificaciones } from "@/components/calificaciones/TablaCalificaciones";
import { Asignatura, CalificacionesState } from "@/types/calificaciones";
import { Button } from "@/components/ui/button";
import { ModalInscripcionEstudiantes } from "@/components/calificaciones/ModalInscripcionEstudiantes";

const PageCalificaciones: React.FC = () => {
  const { funcionarioCursos } = useCursosFuncionarios();

  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(
    null
  );
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<
    string | null
  >(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [loading, setLoading] = useState(false);
  const [studentGrades, setStudentGrades] = useState<CalificacionesState>({});
  const [ordenAlfabetico, setOrdenAlfabetico] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [mensageDialogo, setMensajeDialogo] = useState("");
  const [isModalInscripcionOpen, setIsModalInscripcionOpen] = useState(false);

  const handleCursoChange = useCallback(async (cursoId: number) => {
    setCursoSeleccionado(cursoId);
    setEstudiantes([]);
    setLoading(true);
    try {
      const response = await getAsignaturasCurso(cursoId);
      setAsignaturas(response.data || []);
      setAsignaturaSeleccionada(null);
    } catch (error) {
      console.error("Error al obtener asignaturas:", error);
      setAsignaturas([]);
      setAsignaturaSeleccionada(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAsignaturaChange = useCallback(
    async (asignaturaId: string) => {
      setAsignaturaSeleccionada(asignaturaId);
      if (cursoSeleccionado) {
        setEstudiantes([]);
        setLoading(true);
        try {
          const enrolled = await getEstudiantesEnAsignatura(
            Number(asignaturaId),
            cursoSeleccionado
          );
          setEstudiantes(enrolled.data || []);
        } catch (error) {
          console.error("Error al obtener estudiantes:", error);
        } finally {
          setLoading(false);
        }
      }
    },
    [cursoSeleccionado]
  );

  const actualizarEstudiantes = useCallback(async () => {
    if (cursoSeleccionado && asignaturaSeleccionada) {
      setLoading(true);
      try {
        const enrolled = await getEstudiantesEnAsignatura(
          Number(asignaturaSeleccionada),
          cursoSeleccionado
        );
        setEstudiantes(enrolled.data || []);
      } catch (error) {
        console.error("Error al actualizar estudiantes:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [cursoSeleccionado, asignaturaSeleccionada]);

  const handleCalificacionChange = useCallback(
    async (
      estudianteId: number,
      asignaturaId: number,
      posicion: number,
      valor: number | null
    ) => {
      const response = await saveCalificacion(
        estudianteId,
        asignaturaId,
        posicion,
        valor
      );
      return response.status === 200;
    },
    []
  );

  const estudiantesOrdenados = ordenAlfabetico
    ? [...estudiantes].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      )
    : estudiantes;

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
              Calificaciones
            </h1>
            <p className="text-muted-foreground">
              Gestiona las calificaciones de los estudiantes
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <FiltrosCalificaciones
            funcionarioCursos={funcionarioCursos}
            asignaturas={asignaturas}
            cursoSeleccionado={cursoSeleccionado}
            asignaturaSeleccionada={asignaturaSeleccionada}
            selectedSemester={selectedSemester}
            onCursoChange={handleCursoChange}
            onAsignaturaChange={handleAsignaturaChange}
            onSemesterChange={setSelectedSemester}
          />

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : estudiantes.length > 0 ? (
            <div className="p-4">
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setIsModalInscripcionOpen(true)}
                  className="flex items-center gap-2"
                >
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
                      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                    />
                  </svg>
                  <span>Gestionar Inscripciones</span>
                </Button>
                <Button
                  onClick={() => setOrdenAlfabetico(!ordenAlfabetico)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <span>
                    {ordenAlfabetico
                      ? "Orden Original"
                      : "Ordenar Alfabéticamente"}
                  </span>
                  {ordenAlfabetico ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                      />
                    </svg>
                  )}
                </Button>
              </div>

              <TablaCalificaciones
                estudiantes={estudiantesOrdenados}
                asignaturas={asignaturas}
                asignaturaSeleccionada={asignaturaSeleccionada}
                selectedSemester={selectedSemester}
                studentGrades={studentGrades}
                onCalificacionChange={handleCalificacionChange}
                setStudentGrades={setStudentGrades}
                setMensajeDialogo={setMensajeDialogo}
                setAlertOpen={setAlertOpen}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-muted-foreground mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <p className="text-muted-foreground">
                No hay estudiantes inscritos en la asignatura
              </p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
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
                Atención
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {mensageDialogo}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-primary hover:bg-primary/90">
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {cursoSeleccionado && asignaturaSeleccionada && (
        <ModalInscripcionEstudiantes
          isOpen={isModalInscripcionOpen}
          onClose={() => setIsModalInscripcionOpen(false)}
          cursoId={cursoSeleccionado}
          asignaturaId={Number(asignaturaSeleccionada)}
          asignaturaNombre={
            asignaturas.find(
              (a) => a.asignatura_id.toString() === asignaturaSeleccionada
            )?.asignatura_nombre || ""
          }
          onEstudiantesChange={actualizarEstudiantes}
        />
      )}
    </>
  );
};

export default PageCalificaciones;
