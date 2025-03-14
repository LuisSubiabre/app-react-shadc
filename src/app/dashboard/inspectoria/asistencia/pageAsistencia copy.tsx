import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { API_BASE_URL } from "@/config/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Curso } from "@/app/dashboard/academico/inicio/types.ts";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";

const InspectoriaAsistencia = () => {
  const { user } = useAuth() || {};
  const [dataEstudiantes, setDataEstudiantes] = useState<Estudiante[]>([]);
  const [cargaAsistencias, setCargaAsistencias] = useState<{
    [key: number]: string;
  }>({});
  const [cargaDiasTrabajados, setCargaDiasTrabajados] = useState<{
    [key: number]: string;
  }>({});
  const [diasTrabajados, setDiasTrabajados] = useState<string | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(3);
  const [cargandoAsistencias, setCargandoAsistencias] =
    useState<boolean>(false); // Nuevo estado para controlar la carga

  useEffect(() => {
    const fetchAsistencias = async () => {
      setCargandoAsistencias(true); // Activar el estado de carga
      const nuevasAsistencias: { [key: number]: string } = {};
      const nuevasDiasTrabajados: { [key: number]: string } = {};
      for (const estudiante of dataEstudiantes) {
        const asistencia = await consultaAsistencia(
          estudiante.id,
          mesSeleccionado,
          2025
        );
        nuevasAsistencias[estudiante.id] = asistencia?.dias_asistidos || "";
        nuevasDiasTrabajados[estudiante.id] = asistencia?.total_dias || "";
      }
      setCargaAsistencias(nuevasAsistencias);
      setCargaDiasTrabajados(nuevasDiasTrabajados);
      setCargandoAsistencias(false); // Desactivar el estado de carga
    };

    if (dataEstudiantes.length > 0) {
      fetchAsistencias();
    }
  }, [dataEstudiantes, mesSeleccionado]);

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;
  const { data, loading, error } = useFetch<Curso[]>("cursos", token);

  if (loading) return <div className="spinner">Cargando cursos...</div>;
  if (error) return <div className="error">{error}</div>;

  const estudiantesCurso = async (curso_id: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cursos/estudiantes/${curso_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const responseData = await response.json();
      const mappedData = Array.isArray(responseData)
        ? responseData.map((estudiante) => ({
            ...estudiante,
            id: estudiante.estudiante_id,
          }))
        : [];
      setDataEstudiantes(mappedData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setDataEstudiantes([]);
    }
  };

  const consultaAsistencia = async (
    estudiante_id: number,
    mes: number,
    anio: number
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/asistencias/${estudiante_id}/${mes}/${anio}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error fetching asistencia:", error);
      return null;
    }
  };

  const handleAsistencia = (
    estudiante_id: number,
    totalDias: number,
    mes: number,
    totalDiasTrabajados: number
  ) => {
    try {
      fetch(`${API_BASE_URL}/asistencias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estudiante_id,
          mes,
          anio: new Date().getFullYear(),
          dias_asistidos: totalDias,
          total_dias: totalDiasTrabajados,
        }),
      });
    } catch (error) {
      console.error("Error al guardar la asistencia:", error);
    }
  };

  const handleGuardarDiasTrabajados = () => {
    const nuevoValor = diasTrabajados || "";
    const nuevoEstado: { [key: number]: string } = dataEstudiantes.reduce(
      (acc: { [key: number]: string }, estudiante) => {
        acc[estudiante.id] = nuevoValor;
        return acc;
      },
      {} as { [key: number]: string }
    );
    setCargaDiasTrabajados(nuevoEstado);
    dataEstudiantes.forEach((estudiante) => {
      handleAsistencia(
        estudiante.id,
        Number(cargaDiasTrabajados[estudiante.id] || diasTrabajados),
        mesSeleccionado,
        Number(diasTrabajados)
      );
    });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4"></div>
        <label
          htmlFor="curso-select"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Selecciona un curso:
        </label>
        <Select onValueChange={(value) => estudiantesCurso(Number(value))}>
          <SelectTrigger id="curso-select">
            <SelectValue placeholder="Selecciona un curso" />
          </SelectTrigger>
          <SelectContent>
            {data && data.length > 0 ? (
              data
                .filter((c) => user?.cursos.includes(c.id))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nombre}
                  </SelectItem>
                ))
            ) : (
              <SelectItem value="">No hay cursos disponibles</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select
          value={mesSeleccionado.toString()}
          onValueChange={(value) => setMesSeleccionado(Number(value))}
        >
          <SelectTrigger id="curso-select">
            <SelectValue placeholder="Selecciona un mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Marzo</SelectItem>
            <SelectItem value="4">Abril</SelectItem>
            <SelectItem value="5">Mayo</SelectItem>
            <SelectItem value="6">Junio</SelectItem>
            <SelectItem value="7">Julio</SelectItem>
            <SelectItem value="8">Agosto</SelectItem>
            <SelectItem value="9">Septiembre</SelectItem>
            <SelectItem value="10">Octubre</SelectItem>
            <SelectItem value="11">Noviembre</SelectItem>
            <SelectItem value="12">Diciembre</SelectItem>
          </SelectContent>
        </Select>

        {dataEstudiantes.length > 0 ? (
          <Table>
            <TableCaption>Tabla de asistencia</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Estudiante</TableHead>
                <TableHead className="w-[100px]">Asistencia</TableHead>
                <TableHead className="w-[100px]">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm">
                        Establecer días trabajados
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Días trabajados</DialogTitle>
                        <DialogDescription>
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Atención</AlertTitle>
                            <AlertDescription>
                              Al Establecer los días trabajados de forma masiva,
                              se actualizará la cantidad de asistencias de todos
                              los estudiantes del curso.
                            </AlertDescription>
                          </Alert>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="diasTrabajados"
                            className="text-right"
                          >
                            Total días trabajados:
                          </Label>
                          <Input
                            id="diasTrabajados"
                            className="col-span-3"
                            value={diasTrabajados || ""}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              if (
                                newValue &&
                                (Number(newValue) < 1 || Number(newValue) > 31)
                              ) {
                                return;
                              }
                              setDiasTrabajados(newValue);
                            }}
                            type="number"
                            min="1"
                            max="31"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            type="button"
                            onClick={handleGuardarDiasTrabajados}
                            disabled={!diasTrabajados}
                          >
                            Guardar
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataEstudiantes.map((estudiante) => (
                <TableRow key={estudiante.id}>
                  <TableCell>{estudiante.nombre}</TableCell>
                  <TableCell>
                    {cargandoAsistencias ? ( // Mostrar spinner si está cargando
                      <div className="spinner">Cargando...</div>
                    ) : (
                      <Input
                        value={cargaAsistencias[estudiante.id] || ""}
                        className="w-8/12"
                        onChange={(e) => {
                          const newValue = e.target.value;
                          const diasTrabajados =
                            cargaDiasTrabajados[estudiante.id] || "0";
                          if (
                            newValue &&
                            (Number(newValue) < 1 ||
                              Number(newValue) > 31 ||
                              Number(newValue) > Number(diasTrabajados))
                          ) {
                            return;
                          }
                          setCargaAsistencias({
                            ...cargaAsistencias,
                            [estudiante.id]: newValue,
                          });
                        }}
                        onBlur={() => {
                          const totalDiasTrabajados =
                            cargaDiasTrabajados[estudiante.id] || "0";
                          handleAsistencia(
                            estudiante.id,
                            Number(cargaAsistencias[estudiante.id] || "0"),
                            mesSeleccionado,
                            Number(totalDiasTrabajados)
                          );
                        }}
                        type="number"
                        min="1"
                        max="31"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {cargandoAsistencias ? ( // Mostrar spinner si está cargando
                      <div className="spinner">Cargando...</div>
                    ) : (
                      <Input
                        value={cargaDiasTrabajados[estudiante.id] || ""}
                        className="w-8/12"
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (
                            newValue &&
                            (Number(newValue) < 1 || Number(newValue) > 31)
                          ) {
                            return;
                          }
                          setCargaDiasTrabajados({
                            ...cargaDiasTrabajados,
                            [estudiante.id]: newValue,
                          });
                        }}
                        onBlur={() => {
                          const totalDiasAsistidos =
                            cargaAsistencias[estudiante.id] || "0";
                          handleAsistencia(
                            estudiante.id,
                            Number(totalDiasAsistidos),
                            mesSeleccionado,
                            Number(cargaDiasTrabajados[estudiante.id] || "0")
                          );
                        }}
                        type="number"
                        min="1"
                        max="31"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div>No hay estudiantes disponibles</div>
        )}
      </div>
    </>
  );
};

export default InspectoriaAsistencia;
