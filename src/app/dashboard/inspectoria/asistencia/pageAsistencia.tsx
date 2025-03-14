import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types";
import { AsistenciaState } from "@/types/asistencia";
import {
  getAsistencia,
  saveAsistencia,
  getEstudiantesCurso,
} from "@/services/asistenciaService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Spinner from "@/components/Spinner";
import { FiltrosAsistencia } from "@/components/asistencia/FiltrosAsistencia";
import { TablaAsistencia } from "@/components/asistencia/TablaAsistencia";

const PageAsistencia = () => {
  const { authToken } = useAuth() || {};
  const { funcionarioCursos, loading: loadingCursos } = useCursosFuncionarios();

  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(
    null
  );
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(3);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asistenciaState, setAsistenciaState] = useState<AsistenciaState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      if (!cursoSeleccionado || !authToken) return;

      setLoading(true);
      setError(null);
      try {
        const estudiantesList = await getEstudiantesCurso(
          cursoSeleccionado,
          authToken
        );
        setEstudiantes(estudiantesList);

        // Cargar asistencias para cada estudiante
        const nuevasAsistencias: AsistenciaState = {};
        for (const estudiante of estudiantesList) {
          const asistencia = await getAsistencia(
            estudiante.id,
            mesSeleccionado,
            new Date().getFullYear(),
            authToken
          );
          if (asistencia) {
            nuevasAsistencias[estudiante.id] = {
              dias_asistidos: asistencia.dias_asistidos,
              total_dias: asistencia.total_dias,
            };
          }
        }
        setAsistenciaState(nuevasAsistencias);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarEstudiantes();
  }, [cursoSeleccionado, mesSeleccionado, authToken]);

  const handleCursoChange = (cursoId: number) => {
    setCursoSeleccionado(cursoId);
  };

  const handleMesChange = (mes: number) => {
    setMesSeleccionado(mes);
  };

  const handleAsistenciaChange = async (
    estudianteId: number,
    diasAsistidos: number,
    totalDias: number
  ) => {
    if (!authToken) return;

    setAsistenciaState((prev) => ({
      ...prev,
      [estudianteId]: {
        dias_asistidos: diasAsistidos,
        total_dias: totalDias,
      },
    }));

    try {
      await saveAsistencia(
        estudianteId,
        mesSeleccionado,
        new Date().getFullYear(),
        diasAsistidos,
        totalDias,
        authToken
      );
    } catch (err) {
      console.error("Error al guardar asistencia:", err);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  if (loadingCursos) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Registro de Asistencia</h1>

        <FiltrosAsistencia
          funcionarioCursos={funcionarioCursos}
          cursoSeleccionado={cursoSeleccionado}
          mesSeleccionado={mesSeleccionado}
          onCursoChange={handleCursoChange}
          onMesChange={handleMesChange}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        ) : estudiantes.length > 0 ? (
          <TablaAsistencia
            estudiantes={estudiantes}
            asistenciaState={asistenciaState}
            onAsistenciaChange={handleAsistenciaChange}
          />
        ) : cursoSeleccionado ? (
          <div className="text-center text-gray-500">
            No hay estudiantes registrados en este curso
          </div>
        ) : null}
      </div>
    </>
  );
};

export default PageAsistencia;
