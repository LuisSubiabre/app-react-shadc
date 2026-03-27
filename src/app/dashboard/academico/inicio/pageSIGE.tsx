import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/Spinner";
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts";
import { CursoApiResponseType } from "@/types";
import { getSigeArchivo4 } from "@/services/sigeService";
import { useToast } from "@/hooks/use-toast";

const PageSIGE: React.FC = () => {
  const { loading, error, funcionarioCursos } = useCursosFuncionarios();
  const { toast } = useToast();
  const [downloadingCursoId, setDownloadingCursoId] = useState<number | null>(
    null
  );
  const [excluirSinPromedio, setExcluirSinPromedio] = useState<boolean>(false);

  type Archivo4Item = {
    numero_fijo_1: number | string;
    numero_fijo_2: number | string;
    numero_fijo_3: number | string;
    nivel_educativo: number | string;
    numero_curso: number | string;
    letra_curso: string;
    anio_actual: number | string;
    rut_numero: string;
    rut_dv: string;
    numero_fijo_4: number | string;
    numero_fijo_5: number | string;
    codigo_sige: number | string;
    promedio: string | number;
  };

  const handleDownloadArchivo4 = async (curso: CursoApiResponseType) => {
    try {
      setDownloadingCursoId(curso.id);
      const response = await getSigeArchivo4(curso.id);
      const data: Archivo4Item[] = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      if (data.length === 0) {
        toast({
          title: "Sin datos",
          description: "No se encontraron registros para este curso.",
        });
        return;
      }

      // Filtrar registros sin promedio si la opción está activada
      const dataFiltrada = excluirSinPromedio
        ? data.filter((item) => {
            const promedio = item.promedio;
            return (
              promedio !== null &&
              promedio !== undefined &&
              promedio !== "" &&
              String(promedio).trim() !== ""
            );
          })
        : data;

      if (excluirSinPromedio && dataFiltrada.length === 0) {
        toast({
          title: "Sin datos",
          description: "No se encontraron registros con promedio para este curso.",
        });
        return;
      }

      const lines = dataFiltrada
        .map((item) => {
          const promedio = `${item.promedio ?? ""}`;
          const esConcepto = ["MB", "B", "S", "I"].includes(promedio.toUpperCase());
          
          const valores = [
            item.numero_fijo_1 ?? "",
            item.numero_fijo_2 ?? "",
            item.numero_fijo_3 ?? "",
            item.nivel_educativo ?? "",
            item.numero_curso ?? "",
            item.letra_curso ?? "",
            item.anio_actual ?? "",
            item.rut_numero ?? "",
            item.rut_dv ?? "",
            item.numero_fijo_4 ?? "",
            item.numero_fijo_5 ?? "",
            item.codigo_sige ?? "",
          ];
          
          // Si el promedio es un concepto, añadir un tabulador extra delante
          if (esConcepto) {
            valores.push(""); // Añadir un campo vacío que se convertirá en un tabulador extra
          }
          
          valores.push(promedio);
          
          return valores
            .map((value) => `${value}`)
            .join("\t");
        })
        .join("\n");

      const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `archivo4_${curso.nombre.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generando Archivo 4:", err);
      toast({
        title: "Error",
        description:
          "No fue posible generar el Archivo 4. Intenta nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setDownloadingCursoId(null);
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
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <Breadcrumbs />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">SIGE</h1>
          <div className="flex items-center space-x-3">
            <Label
              htmlFor="excluir-sin-promedio"
              className="text-sm font-medium cursor-pointer"
            >
              Excluir registros sin promedio
            </Label>
            <Switch
              id="excluir-sin-promedio"
              checked={excluirSinPromedio}
              onCheckedChange={(checked) =>
                setExcluirSinPromedio(checked as boolean)
              }
            />
          </div>
        </div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadArchivo4(curso)}
                        disabled={downloadingCursoId === curso.id}
                      >
                        {downloadingCursoId === curso.id
                          ? "Generando..."
                          : "Archivo 4"}
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
