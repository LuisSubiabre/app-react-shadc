import React, { useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts";
import { AlertCircle, Printer, ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@radix-ui/react-separator";
import { CursoApiResponseType } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AcademicoNotasCurso: React.FC = () => {
  const {
    error,
    loading,
    funcionarioCursos,
  } = useCursosFuncionarios();

  useEffect(() => {
    if (funcionarioCursos) {
      console.log("Cursos del funcionario cargados:", funcionarioCursos);
    }
  }, []);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-full w-2/5 mx-auto gap-4">
        <Spinner />
        <p className="text-muted-foreground">Cargando cursos...</p>
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
      <Toaster />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Gestión de Notas por Curso</h1>
          <p className="text-sm text-muted-foreground">
            {funcionarioCursos.length} cursos disponibles
          </p>
        </div>
        
        <Separator orientation="horizontal" className="w-full" />
        
        <div className="rounded-md border">
          <Table>
            <TableCaption>Lista de cursos disponibles para gestionar notas</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Nombre</TableHead>
                <TableHead className="w-[50px]">Jefatura</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarioCursos.length > 0 ? (
                funcionarioCursos.map((c: CursoApiResponseType) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.jefatura}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <NavLink to={`/dashboard/academico/calificaciones/${c.id}`}>
                                <Button variant="secondary" size="icon">
                                  <ClipboardList className="h-4 w-4" />
                                </Button>
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Gestionar notas</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="secondary" size="icon">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Imprimir notas</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No hay cursos disponibles para gestionar notas.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AcademicoNotasCurso;
