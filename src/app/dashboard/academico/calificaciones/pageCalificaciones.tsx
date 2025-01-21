import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";
import { AsignaturaCurso } from "../inicio/types";
import { API_BASE_URL } from "@/config/config";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Calificaciones = () => {
  const { user } = useAuth() || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] =
    useState<AsignaturaCurso | null>(null);
  const [subjectsForCourse, setSubjectsForCourse] = useState<AsignaturaCurso[]>(
    []
  );
  const [dataEstudiantes, setDataEstudiantes] = useState<Estudiante[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<{
    [key: string]: boolean;
  }>({});
  const [studentGrades, setStudentGrades] = useState<{
    [key: string]: { [key: string]: number | string };
  }>({});

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertNotaOpen, setAlertNotaOpen] = useState(false);
  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  // Verificar acceso al curso
  if (id) {
    const cursoId = parseInt(id, 10);
    const existeCurso = user?.cursos.includes(cursoId);

    if (!existeCurso) {
      navigate("/unauthorized");
    }
  } else {
    navigate("/unauthorized");
  }

  // Cargar estudiantes del curso
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

  // Cargar asignaturas del curso
  const loadSubjects = async (curso_id: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/asignaturascursos/curso/${curso_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al cargar asignaturas");
      const data = await response.json();

      const mappedSubjects = data.data.map(
        (item: {
          asignatura_id: number;
          asignatura_nombre: string;
          asignatura_descripcion: string;
          curso_id: number;
          profesor_id: number;
        }) => ({
          id: item.asignatura_id,
          nombre: item.asignatura_nombre,
          descripcion: item.asignatura_descripcion,
          curso_id: item.curso_id,
          profesor_jefe_id: item.profesor_id,
        })
      );
      setSubjectsForCourse(mappedSubjects || []);
    } catch (error) {
      console.error("Error:", error);
      setSubjectsForCourse([]);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (id) {
      const curso_id = parseInt(id, 10);
      estudiantesCurso(curso_id);
      loadSubjects(curso_id);
    }
  }, [id, token]);

  useEffect(() => {
    const loadEnrollments = async () => {
      if (selectedSubject && Array.isArray(dataEstudiantes)) {
        const enrollments: { [key: string]: boolean } = {};

        for (const estudiante of dataEstudiantes) {
          const isEnrolled = await checkStudentEnrollment(
            estudiante.id,
            selectedSubject.id
          );
          enrollments[`${estudiante.id}-${selectedSubject.id}`] = isEnrolled;
        }

        setEnrolledStudents(enrollments);
      }
    };

    loadEnrollments();
  }, [selectedSubject, dataEstudiantes]);

  const handleSubjectSelect = (asignatura: AsignaturaCurso) => {
    setSelectedSubject(asignatura);
  };

  const checkStudentEnrollment = async (
    estudiante_id: number,
    asignatura_id: number
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/estudiantes-asignaturas/${estudiante_id}/${asignatura_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const jsonResponse = await response.json();
      if (response.ok) {
        setStudentGrades((prev) => ({
          ...prev,
          [`${estudiante_id}-${asignatura_id}`]: jsonResponse.data,
        }));
      }
      return response.ok;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return false;
    }
  };

  const enrolledStudentsList = selectedSubject
    ? dataEstudiantes.filter(
        (estudiante) =>
          enrolledStudents[`${estudiante.id}-${selectedSubject.id}`]
      )
    : [];

  const saveCalificaciones = async (
    estudiante_id: number,
    asignatura_id: number,
    posicionCalificacion: number,
    numericValue: number
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/estudiantes-asignaturas/${estudiante_id}/${asignatura_id}/${posicionCalificacion}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nota: numericValue,
          }),
        }
      );
      // if (!response.ok) throw new Error("Error al guardar calificación");
      if (!response.ok) {
        setAlertNotaOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-2">
          <Label>Seleccionar Asignatura</Label>
          <Select
            onValueChange={(value) => {
              const asignatura = subjectsForCourse.find(
                (a) => a.id.toString() === value
              );
              if (asignatura) handleSubjectSelect(asignatura);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una asignatura" />
            </SelectTrigger>
            <SelectContent>
              {subjectsForCourse.map((asignatura) => (
                <SelectItem
                  key={asignatura.id}
                  value={asignatura.id.toString()}
                >
                  {asignatura.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSubject && (
          <div className="mt-4">
            <Table>
              <TableCaption>Calificaciones de estudiantes</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>C1</TableHead>
                  <TableHead>C2</TableHead>
                  <TableHead>C3</TableHead>
                  <TableHead>C4</TableHead>
                  <TableHead>C5</TableHead>
                  <TableHead>C6</TableHead>
                  <TableHead>C7</TableHead>
                  <TableHead>C8</TableHead>
                  <TableHead>C9</TableHead>
                  <TableHead>C10</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledStudentsList.map((estudiante) => (
                  <TableRow key={estudiante.id}>
                    <TableCell>
                      {estudiante.nombre} {estudiante.id}
                    </TableCell>
                    {[...Array(10)].map((_, index) => (
                      <TableCell key={index}>
                        <Input
                          type="number"
                          value={
                            studentGrades[
                              `${estudiante.id}-${selectedSubject.id}`
                            ]?.[`calificacion${index + 1}`] || ""
                          }
                          onChange={(e) => {
                            const newValue = e.target.value;

                            // Permitir vacío sin validación inmediata
                            setStudentGrades((prev) => ({
                              ...prev,
                              [`${estudiante.id}-${selectedSubject.id}`]: {
                                ...prev[
                                  `${estudiante.id}-${selectedSubject.id}`
                                ],
                                [`calificacion${index + 1}`]: newValue,
                              },
                            }));

                            // Cambiar color a verde cuando el valor cambia
                            e.target.style.color = "green";
                            const numericValue = Number(newValue);
                            if (numericValue >= 10 && numericValue <= 70) {
                              const posicionCalificacion = index + 1;
                              saveCalificaciones(
                                estudiante.id,
                                selectedSubject.id,
                                posicionCalificacion,
                                numericValue
                              );
                            }
                          }}
                          onBlur={(e) => {
                            const newValue = e.target.value;

                            // Validar solo si no está vacío
                            if (newValue !== "") {
                              const numericValue = Number(newValue);
                              if (numericValue < 10 || numericValue > 70) {
                                setAlertOpen(true);

                                e.target.value = "";
                                setStudentGrades((prev) => ({
                                  ...prev,
                                  [`${estudiante.id}-${selectedSubject.id}`]: {
                                    ...prev[
                                      `${estudiante.id}-${selectedSubject.id}`
                                    ],
                                    [`calificacion${index + 1}`]: "",
                                  },
                                }));
                                // Resetear color si el valor es inválido
                                e.target.style.color = "";
                              }
                            }
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atención</AlertDialogTitle>
            <AlertDialogDescription>
              El valor ingresado debe estar entre 10 y 70.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={alertNotaOpen} onOpenChange={setAlertNotaOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atención</AlertDialogTitle>
            <AlertDialogDescription>
              Error al guardar la calificación
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Calificaciones;
