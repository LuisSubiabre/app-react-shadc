import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

/* refactory */
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts"; // Asegúrate de importar el hook que creaste
/* refactory */

import { AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";



import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CursoApiResponseType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPromedioPorCurso } from "@/services/infoService";

interface PromedioData {
  curso: string;
  asignatura: string;
  cantidad_estudiantes: string;
  promedio_general: string;
}

const AcademicoCursoAsignaturas: React.FC = () => {
  const { error, loading, funcionarioCursos } = useCursosFuncionarios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [promediosData, setPromediosData] = useState<PromedioData[]>([]);
  const [loadingPromedios, setLoadingPromedios] = useState(false);

  useEffect(() => {
    if (funcionarioCursos) {
      console.log("Cursos del funcionario cargados:", funcionarioCursos);
    }
  }, [funcionarioCursos]);

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }

  const handleOpenModal = async (cursoId: number) => {
    setSelectedCursoId(cursoId);
    setIsModalOpen(true);
    setLoadingPromedios(true);
    try {
      const response = await getPromedioPorCurso(cursoId);
      setPromediosData(response.data);
    } catch (error) {
      console.error("Error al cargar los promedios:", error);
    } finally {
      setLoadingPromedios(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    ); // Spinner de carga

  if (error)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    ); // Mensaje de error al cargar los datos de la API



  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <Toaster />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Promedios
            </h1>
            <p className="text-muted-foreground">
              Visualiza los promedios de asignaturas por curso
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[200px] font-semibold">
                  Nombre del Curso
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(c.id)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                          />
                        </svg>
                        Promedio Consolidado
                      </Button>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Promedios por Asignatura</DialogTitle>
          </DialogHeader>
          {loadingPromedios ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="mt-4 overflow-auto flex-1">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[50%]">Asignatura</TableHead>
                    <TableHead className="text-right w-[25%]">Cantidad de Estudiantes</TableHead>
                    <TableHead className="text-right w-[25%]">Promedio General</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promediosData.map((promedio, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{promedio.asignatura}</TableCell>
                      <TableCell className="text-right">{promedio.cantidad_estudiantes}</TableCell>
                      <TableCell className="text-right font-medium">
                        {promedio.promedio_general}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicoCursoAsignaturas;
