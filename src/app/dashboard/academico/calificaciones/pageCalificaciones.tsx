import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getAsignaturasCurso,
  getEstudiantesEnAsignatura,
} from "@/services/academicoService";
import { EstudianteType } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Spinner from "@/components/Spinner";
import { Input } from "@/components/ui/input";

const PageCalificaciones: React.FC = () => {
  const funcionarioId = 84;
  const { funcionarioCursos } = useCursosFuncionarios(funcionarioId);

  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(
    null
  );
  const [asignaturas, setAsignaturas] = useState<
    {
      asignatura_id: number;
      asignatura_nombre: string;
      asignatura_concepto: boolean;
    }[]
  >([]);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<
    string | null
  >(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [loading, setLoading] = useState(false);

  const conceptMap = useMemo(
    () => ({
      MB: 70,
      B: 50,
      S: 40,
      I: 30,
    }),
    []
  );

  const handleCursoChange = useCallback(async (cursoId: number) => {
    setEstudiantes([]);
    setLoading(true);
    try {
      const response = await getAsignaturasCurso(cursoId);
      setAsignaturas(response.data || []);
      setAsignaturaSeleccionada(null);
    } catch (error) {
      console.error("Error al obtener asignaturas:", error);
      setAsignaturas([]);
      setAsignaturaSeleccionada(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEstudiantes = useCallback(
    async (asignaturaId: number, cursoId: number) => {
      setLoading(true);
      try {
        const enrolled = await getEstudiantesEnAsignatura(
          asignaturaId,
          cursoId
        );
        setEstudiantes(enrolled.data || []);
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleAsignaturasClick = useCallback(
    (cursoId: number, asignaturaId: number) => {
      setEstudiantes([]);
      getEstudiantes(asignaturaId, cursoId);
    },
    [getEstudiantes]
  );

  const handleSemesterChange = useCallback((semester: number) => {
    setSelectedSemester(semester);
  }, []);

  const getColumnRange = useMemo(() => {
    return selectedSemester === 1
      ? [...Array(10).keys()].map((n) => n + 0)
      : [...Array(10).keys()].map((n) => n + 12);
  }, [selectedSemester]);

  useEffect(() => {
    if (cursoSeleccionado !== null) {
      handleCursoChange(cursoSeleccionado);
    }
  }, [cursoSeleccionado, handleCursoChange]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Calificaciones</h1>

        <div className="grid gap-2">
          <Label>Seleccionar Curso: </Label>
          <Select
            onValueChange={(value) => setCursoSeleccionado(Number(value))}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Seleccione un curso" />
            </SelectTrigger>
            <SelectContent>
              {funcionarioCursos.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Seleccionar Asignatura:</Label>
          <Select
            disabled={asignaturas.length === 0}
            value={asignaturaSeleccionada ?? ""}
            onValueChange={(value) => {
              setAsignaturaSeleccionada(value);
              if (cursoSeleccionado !== null) {
                handleAsignaturasClick(cursoSeleccionado, Number(value));
              }
            }}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Seleccione asignatura" />
            </SelectTrigger>
            <SelectContent>
              {asignaturas.map((a) => (
                <SelectItem
                  key={a.asignatura_id}
                  value={a.asignatura_id.toString()}
                >
                  {a.asignatura_nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <RadioGroup
            value={String(selectedSemester)}
            onValueChange={(value) => handleSemesterChange(Number(value))}
          >
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="semester-1" />
                <Label htmlFor="semester-1">1er Semestre</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="semester-2" />
                <Label htmlFor="semester-2">2do Semestre</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {loading ? (
          <div className="text-center">
            <Spinner />
          </div>
        ) : estudiantes.length > 0 ? (
          <div>
            <Table>
              <TableCaption>Calificaciones de estudiantes</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  {getColumnRange.map((col) => (
                    <TableHead key={col}>C{col + 1}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudiantes.map((estudiante) => (
                  <TableRow key={estudiante.id}>
                    <TableCell>{estudiante.estudiante_nombre}</TableCell>
                    {getColumnRange.map((index) => (
                      <TableCell key={index}>
                        {asignaturas.find(
                          (a) =>
                            a.asignatura_id === Number(asignaturaSeleccionada)
                        )?.asignatura_concepto ? (
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(conceptMap).map(
                                ([concept, value]) => (
                                  <SelectItem
                                    key={concept}
                                    value={String(value)}
                                  >
                                    {concept}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="number"
                            className="w-full border border-gray-300 rounded p-1"
                            placeholder="Nota"
                          />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold">Estudiantes inscritos:</h2>
            <p>No hay estudiantes inscritos en la asignatura</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PageCalificaciones;
