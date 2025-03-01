import React, { useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

/* refactory */
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts"; // Asegúrate de importar el hook que creaste
/* refactory */

import { AlertCircle, Printer } from "lucide-react";
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

const AcademicoNotasCurso: React.FC = () => {
  /* refactory */
  const funcionarioId = 84; // O cualquier ID de funcionario que quieras pasar
  const {
    error,
    loading,
    funcionarioCursos,
    // Desestructura setFuncionarioCursos
  } = useCursosFuncionarios(funcionarioId);

  useEffect(() => {
    // Aquí puedes hacer algo cuando el `funcionarioCursos` cambie o cuando se haya cargado
    if (funcionarioCursos) {
      console.log("Cursos del funcionario cargados:", funcionarioCursos);
    }
  }, []);

  /* refactory */

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

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Separator orientation="horizontal" className="w-full" />
        <Separator orientation="horizontal" className="w-full" />
        <Table>
          <TableCaption>Lista de cursos</TableCaption>
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
                    <NavLink to={`/dashboard/academico/calificaciones/${c.id}`}>
                      <Button variant="secondary" className="mr-2">
                        Notas
                      </Button>
                    </NavLink>
                    <Button variant="secondary" className="mr-2">
                      <Printer />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No hay cursos disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AcademicoNotasCurso;
