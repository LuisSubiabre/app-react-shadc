import React from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Spinner from "@/components/Spinner";
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts";
import { CursoApiResponseType } from "@/types";

const PageSIGE: React.FC = () => {
  const { loading, error, funcionarioCursos } = useCursosFuncionarios();

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
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <Breadcrumbs />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-3xl font-semibold">SIGE</h1>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[200px] font-semibold">Nombre</TableHead>
                <TableHead className="w-[200px] font-semibold">Jefatura</TableHead>
                <TableHead className="w-[150px] font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarioCursos.length > 0 ? (
                funcionarioCursos.map((curso: CursoApiResponseType) => (
                  <TableRow key={curso.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{curso.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {curso.jefatura}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Archivo 4
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    No hay cursos disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
};

export default PageSIGE;
