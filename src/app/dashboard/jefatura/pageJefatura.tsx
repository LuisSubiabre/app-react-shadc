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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { estudiantesCurso } from "@/services/estudiantesService";
import { useAuth } from "@/hooks/useAuth";

const PageJefatura = () => {
  const [curso, setCurso] = useState<CursoType | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [error, setError] = useState("");
  const [errorEstudiantes, setErrorEstudiantes] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState<boolean>(true);
  const { user } = useAuth() || {};
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
        <h1 className="text-2xl font-bold">Jefatura</h1>
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
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
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
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
};

export default PageJefatura;
