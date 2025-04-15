import React, { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts";
import { AlertCircle, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { Curso } from "./types";
import { User } from "@/app/dashboard/toor/usuarios/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CursoApiResponseType } from "@/types";
import { getFuncionarios } from "@/services/funcionariosService";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";
import { API_BASE_URL } from "@/config/config";

const AcademicoImprimirLibreta: React.FC = () => {
  const { error, loading, funcionarioCursos, setFuncionarioCursos } =
    useCursosFuncionarios();

  const [isModalEstudiantesOpen, setIsModalEstudiantesOpen] =
    useState<boolean>(false);
  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null);
  const [dataUsuarios, setDataUsuarios] = useState<User[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [dataEstudiantes, setDataEstudiantes] = useState<Estudiante[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true);
        const response = await getFuncionarios();
        setDataUsuarios(response.data);
      } catch (err) {
        setErrorUsuarios(
          err instanceof Error ? err.message : "Error al cargar usuarios"
        );
        console.error("Error al cargar usuarios:", err);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (funcionarioCursos && dataUsuarios.length > 0) {
      const cursosActualizados = funcionarioCursos.map((curso) => ({
        ...curso,
        jefatura:
          dataUsuarios.find((user) => user.id === curso.profesor_jefe_id)
            ?.nombre || "S/N",
      }));
      setFuncionarioCursos(cursosActualizados);
    }
  }, [funcionarioCursos, dataUsuarios]);

  const handleEstudiantesClick = async (curso: Curso) => {
    setIsModalEstudiantesOpen(true);
    setCurrentCurso(curso);
    setLoadingEstudiantes(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/cursos/estudiantes/${curso.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar estudiantes");
      }

      const data = await response.json();
      const estudiantes = Array.isArray(data)
        ? data.map((estudiante) => ({
            ...estudiante,
            id: estudiante.estudiante_id,
          }))
        : [];
      setDataEstudiantes(estudiantes);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  if (loading || loadingUsuarios)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    );

  if (error || errorUsuarios)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || errorUsuarios}</AlertDescription>
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
      <Toaster />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Imprimir Libretas
          </h1>
          <p className="text-muted-foreground">
            Imprime las libretas de los estudiantes
          </p>
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
                funcionarioCursos.map((c: CursoApiResponseType) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.jefatura}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEstudiantesClick(c)}
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
                        No hay cursos disponibles
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={isModalEstudiantesOpen}
        onOpenChange={setIsModalEstudiantesOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Estudiantes - {currentCurso?.nombre}
            </DialogTitle>
          </DialogHeader>
          {loadingEstudiantes ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-hidden">
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-auto max-h-[50vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>RUT</TableHead>
                        <TableHead>N° Lista</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataEstudiantes.length > 0 ? (
                        dataEstudiantes.map((estudiante) => (
                          <TableRow key={estudiante.id}>
                            <TableCell>{estudiante.nombre}</TableCell>
                            <TableCell>{estudiante.rut}</TableCell>
                            <TableCell>{estudiante.numlista}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                Imprimir Libreta
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No hay estudiantes en este curso
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalEstudiantesOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicoImprimirLibreta;
