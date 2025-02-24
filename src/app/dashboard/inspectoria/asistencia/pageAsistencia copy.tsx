import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Curso } from "@/app/dashboard/academico/inicio/types.ts"; // Importa la interfaz desde el archivo types.ts
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";

import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import { useFetch } from "@/hooks/useFetch";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/config/config";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const InspectoriaAsistencia = () => {
  const { user } = useAuth() || {}; // Si es null, devuelve un objeto vacío
  // Cargar estudiantes del curso
  const [dataEstudiantes, setDataEstudiantes] = useState<Estudiante[]>([]);

  const [cargaAsistencias, setCargaAsistencias] = useState<{
    [key: number]: string;
  }>({});
  const [cargaDiasTrabajados, serCargaDiasTrabajados] = useState<{
    [key: number]: string;
  }>({});
  const [diasTrabajadosEstudiantes, setDiasTrabajadosEstudiantes] = useState<{
    [key: number]: string;
  }>({});
  const [diasTrabajados, setDiasTrabajados] = useState<string | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(3); // Estado para el mes seleccionado

  useEffect(() => {
    const fetchAsistencias = async () => {
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
      serCargaDiasTrabajados(nuevasDiasTrabajados);
    };

    if (dataEstudiantes.length > 0) {
      fetchAsistencias();
    }
  }, [dataEstudiantes, mesSeleccionado]);

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;
  const { data, loading, error } = useFetch<Curso[]>("cursos", token); // Trae los datos de la API

  if (loading) return <div className="spinner">Cargando...</div>; // Spinner de carga
  if (error) return <div className="error">{error}</div>; // Mensaje de error al cargar los datos de la API

  /* logica de negocio */

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
      //console.log("Estudiantes del curso:", dataEstudiantes);
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
        acc[estudiante.id] = nuevoValor; // Asigna el mismo valor de días trabajados a cada estudiante
        return acc;
      },
      {} as { [key: number]: string }
    );
    setDiasTrabajadosEstudiantes(nuevoEstado); // Actualiza el estado con los días trabajados de cada estudiante
    dataEstudiantes.forEach((estudiante) => {
      console.log("Estudiante:", estudiante);
      handleAsistencia(
        estudiante.id,
        Number(diasTrabajadosEstudiantes[estudiante.id] || diasTrabajados), //
        mesSeleccionado,
        Number(diasTrabajados)
      );
    });
    setDiasTrabajados(""); // Resetea el valor global del input
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
                .filter((c) => user?.cursos.includes(c.id)) // Filtra los cursos cuyo id esté en user.cursos
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

        {/* Tabla de asistencia */}
        <Table>
          <TableCaption>Tabla de asistencia</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Estudiante</TableHead>
              <TableHead className="w-[100px]">Asistencia</TableHead>
              <TableHead className="w-[100px]">
                {/* Dialog de días trabajados */}
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
                        Establecer días trabajados para todos los estudiantes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="diasTrabajados" className="text-right">
                          Total días trabajados:
                        </Label>
                        <Input
                          id="diasTrabajados"
                          className="col-span-3"
                          value={diasTrabajados || ""}
                          onChange={(e) => setDiasTrabajados(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          onClick={handleGuardarDiasTrabajados}
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
            {dataEstudiantes.length > 0 ? (
              dataEstudiantes.map((estudiante) => (
                <TableRow key={estudiante.id}>
                  <TableCell>{estudiante.nombre}</TableCell>
                  <TableCell>
                    <Input
                      defaultValue={cargaAsistencias[estudiante.id] || ""}
                      className="w-8/12"
                      data-estudiante-id={`primer-${estudiante.id}`} // Identificador único
                      onBlur={(e) => {
                        const newValue = e.target.value; // Captura el valor del input actual
                        const totalDiasTrabajados =
                          diasTrabajadosEstudiantes[estudiante.id];
                        handleAsistencia(
                          estudiante.id,
                          Number(newValue),
                          mesSeleccionado,
                          Number(totalDiasTrabajados)
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={cargaDiasTrabajados[estudiante.id] || ""}
                      className="w-8/12"
                      value={diasTrabajadosEstudiantes[estudiante.id] || ""}
                      onChange={(e) =>
                        setDiasTrabajadosEstudiantes({
                          ...diasTrabajadosEstudiantes,
                          [estudiante.id]: e.target.value, // Actualiza solo el valor de este estudiante
                        })
                      }
                      onBlur={(e) => {
                        const newValueSegundoInput = e.target.value; // Valor del segundo input
                        // Capturar el valor del primer input
                        const primerInput = document.querySelector(
                          `input[data-estudiante-id="primer-${estudiante.id}"]`
                        );
                        const valorPrimerInput = primerInput
                          ? Number((primerInput as HTMLInputElement).value) || 1
                          : 0;

                        handleAsistencia(
                          estudiante.id,
                          valorPrimerInput, // Valor capturado del primer input
                          mesSeleccionado,
                          Number(newValueSegundoInput) // Valor del segundo input
                        );
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  No hay estudiantes disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Tabla de asistencia */}
      </div>
    </>
  );
};

export default InspectoriaAsistencia;
