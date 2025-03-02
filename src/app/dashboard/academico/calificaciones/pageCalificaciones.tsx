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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Calificaciones</h1>

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
          <div className="text-center">
            <Spinner />
          </div>
        ) : estudiantes.length > 0 ? (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setOrdenAlfabetico(!ordenAlfabetico)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              </button>
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
          <div>
            <h2 className="text-xl font-semibold">Estudiantes inscritos:</h2>
            <p>No hay estudiantes inscritos en la asignatura</p>
          </div>
        )}
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atención</AlertDialogTitle>
            <AlertDialogDescription>{mensageDialogo}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PageCalificaciones;
