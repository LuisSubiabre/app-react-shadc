import React, { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

/* refactory */
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts"; // Asegúrate de importar el hook que creaste
/* refactory */

import { AlertCircle } from "lucide-react";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

import { Curso } from "./types"; // Importa la interfaz desde el archivo types.ts
import { User } from "@/app/dashboard/toor/usuarios/types"; // Importa la interfaz desde el archivo types.ts
import { AsignaturaCurso } from "./types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import { useFetch } from "@/hooks/useFetch"; // Importamos correctamente desde hooks
import { API_BASE_URL } from "@/config/config";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CursoApiResponseType } from "@/types";

const AcademicoCursoAsignaturas: React.FC = () => {
  const { error, loading, funcionarioCursos } = useCursosFuncionarios();

  useEffect(() => {
    if (funcionarioCursos) {
      console.log("Cursos del funcionario cargados:", funcionarioCursos);
    }
  }, [funcionarioCursos]);

  const [isModalSubjectsOpen, setIsModalSubjectsOpen] =
    useState<boolean>(false);

  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null);
  const [selectedSubject, setSelectedSubject] =
    useState<AsignaturaCurso | null>(null);
  const [subjectsForCourse, setSubjectsForCourse] = useState<AsignaturaCurso[]>(
    []
  );
  const [dataEstudiantes, setDataEstudiantes] = useState<Estudiante[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<{
    [key: string]: boolean;
  }>({});
  const [confirmationData, setConfirmationData] = useState<{
    show: boolean;
    estudiante_id?: number;
    asignatura_id?: number;
  }>({ show: false });
  //const { user } = useAuth() || {}; // Si es null, devuelve un objeto vacío
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);
  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;
  const { toast } = useToast();

  const { data: dataUsuarios } = useFetch<User[]>("usuarios", token); // Trae los datos de la API (usuarios)

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
      // Mapear los datos para adaptar estudiante_id a id
      const mappedData = Array.isArray(responseData)
        ? responseData.map((estudiante) => ({
            ...estudiante,
            id: estudiante.estudiante_id, // Mantener estudiante_id como id para compatibilidad
          }))
        : [];
      setDataEstudiantes(mappedData);
      // console.log(mappedData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setDataEstudiantes([]);
    }
  };

  const handleAsignaturasClick = async (curso: Curso) => {
    estudiantesCurso(curso.id);
    try {
      const response = await fetch(
        `${API_BASE_URL}/asignaturascursos/curso/${curso.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al cargar asignaturas");
      const data = await response.json();

      // Mapear los datos recibidos al formato esperado
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
      // console.log(subjectsForCourse);
      setCurrentCurso(curso);
      setIsModalSubjectsOpen(true);
    } catch (error) {
      console.error("Error:", error);
      setSubjectsForCourse([]); // Asegúrate de que sea un array vacío en caso de error
    }
  };

  const handleSubjectSelect = (asignatura: AsignaturaCurso) => {
    setSelectedSubject(asignatura);
  };

  const checkStudentEnrollment = async (
    estudiante_id: number,
    asignatura_id: number
  ) => {
    // console.log(estudiante_id, asignatura_id);
    try {
      setLoadingEstudiantes(true); // Inicia la carga
      const response = await fetch(
        `${API_BASE_URL}/estudiantes-asignaturas/${estudiante_id}/${asignatura_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return false;
    } finally {
      setLoadingEstudiantes(false); // Finaliza la carga
    }
  };

  const handleStudentEnrollment = async (
    estudiante_id: number,
    asignatura_id: number,
    isChecked: boolean
  ) => {
    try {
      if (isChecked) {
        // Enroll student
        const response = await fetch(
          `${API_BASE_URL}/estudiantes-asignaturas`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ estudiante_id, asignatura_id }),
          }
        );

        if (!response.ok) throw new Error("Error al inscribir estudiante");
      } else {
        // Unenroll student
        const response = await fetch(
          `${API_BASE_URL}/estudiantes-asignaturas/${estudiante_id}/${asignatura_id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al desinscribir estudiante");
      }

      setEnrolledStudents((prev) => ({
        ...prev,
        [`${estudiante_id}-${asignatura_id}`]: isChecked,
      }));

      toast({
        title: isChecked ? "Estudiante inscrito" : "Estudiante desinscrito",
        description: isChecked
          ? "El estudiante ha sido inscrito exitosamente"
          : "El estudiante ha sido desinscrito exitosamente",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Hubo un error al procesar la inscripción",
        variant: "destructive",
      });
    }
  };

  const handleCheckboxChange = (
    estudiante_id: number,
    asignatura_id: number,
    isChecked: boolean
  ) => {
    if (isChecked) {
      // Si está marcando el checkbox, proceder normalmente
      handleStudentEnrollment(estudiante_id, asignatura_id, true);
    } else {
      // Si está desmarcando, mostrar diálogo de confirmación
      setConfirmationData({
        show: true,
        estudiante_id,
        asignatura_id,
      });
    }
  };

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
              Gestión de Asignaturas
            </h1>
            <p className="text-muted-foreground">
              Administra las asignaturas por curso
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
                        onClick={() => handleAsignaturasClick(c)}
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
                        Asignaturas
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

      {/* Modal para gestión de asignaturas */}
      <Dialog
        open={isModalSubjectsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubject(null);
            setDataEstudiantes([]);
            setEnrolledStudents({});
          }
          setIsModalSubjectsOpen(open);
        }}
      >
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Gestión de Asignaturas - {currentCurso?.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                Seleccionar Asignatura
              </Label>
              <Select
                onValueChange={(value) => {
                  const asignatura = subjectsForCourse.find(
                    (a) => a.id.toString() === value
                  );
                  if (asignatura) handleSubjectSelect(asignatura);
                }}
              >
                <SelectTrigger className="w-full">
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
              <>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">
                    Profesor Asignatura
                  </Label>
                  <Select
                    value={selectedSubject.profesor_jefe_id?.toString()}
                    onValueChange={async (value) => {
                      try {
                        const response = await fetch(
                          `${API_BASE_URL}/asignaturascursos/${selectedSubject.id}/${selectedSubject.curso_id}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              profesor_id: parseInt(value),
                            }),
                          }
                        );

                        if (!response.ok)
                          throw new Error("Error al actualizar profesor");

                        // Actualizar el estado local de subjectsForCourse
                        setSubjectsForCourse((prevSubjects) =>
                          prevSubjects.map((subject) =>
                            subject.id === selectedSubject.id
                              ? {
                                  ...subject,
                                  profesor_jefe_id: parseInt(value),
                                }
                              : subject
                          )
                        );

                        setSelectedSubject({
                          ...selectedSubject,
                          profesor_jefe_id: parseInt(value),
                        });

                        toast({
                          title: "Éxito",
                          description: "Profesor actualizado correctamente",
                        });
                      } catch (error) {
                        console.error("Error:", error);
                        toast({
                          title: "Error",
                          description: "Error al actualizar profesor",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione profesor jefe" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataUsuarios
                        ?.filter((user) => user.activo)
                        .map((profesor) => (
                          <SelectItem
                            key={profesor.id}
                            value={profesor.id.toString()}
                          >
                            {profesor.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {loadingEstudiantes ? (
                  <div className="flex justify-center items-center py-8">
                    <Spinner />
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Inscripción de Estudiantes
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedSubject) {
                            const allSelected = dataEstudiantes.every(
                              (estudiante) =>
                                enrolledStudents[
                                  `${estudiante.id}-${selectedSubject.id}`
                                ]
                            );

                            if (!allSelected) {
                              const updatedEnrolledStudents = {
                                ...enrolledStudents,
                              };

                              dataEstudiantes.forEach((estudiante) => {
                                updatedEnrolledStudents[
                                  `${estudiante.id}-${selectedSubject.id}`
                                ] = true;
                              });

                              setEnrolledStudents(updatedEnrolledStudents);

                              dataEstudiantes.forEach((estudiante) => {
                                handleCheckboxChange(
                                  estudiante.id,
                                  selectedSubject.id,
                                  true
                                );
                              });
                            }
                          }
                        }}
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
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                        Seleccionar Todos
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 max-h-64 overflow-y-auto">
                      <ul className="space-y-2">
                        {Array.isArray(dataEstudiantes) &&
                          dataEstudiantes.map((estudiante) => (
                            <li
                              key={estudiante.id}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <input
                                type="checkbox"
                                id={`estudiante-${estudiante.id}`}
                                checked={
                                  enrolledStudents[
                                    `${estudiante.id}-${selectedSubject?.id}`
                                  ] || false
                                }
                                onChange={(e) => {
                                  if (selectedSubject) {
                                    handleCheckboxChange(
                                      estudiante.id,
                                      selectedSubject.id,
                                      e.target.checked
                                    );
                                  }
                                }}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label
                                htmlFor={`estudiante-${estudiante.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {estudiante.nombre}
                              </label>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalSubjectsOpen(false);
                setSelectedSubject(null);
                setDataEstudiantes([]);
                setEnrolledStudents({});
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de confirmación para desinscribir */}
      <Dialog
        open={confirmationData.show}
        onOpenChange={(open) => setConfirmationData({ show: open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar desinscripción</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Está seguro de realizar esta acción?</p>
            <p className="text-red-500">
              Las calificaciones se eliminarán para el estudiante.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmationData({ show: false })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  confirmationData.estudiante_id &&
                  confirmationData.asignatura_id
                ) {
                  handleStudentEnrollment(
                    confirmationData.estudiante_id,
                    confirmationData.asignatura_id,
                    false
                  );
                }
                setConfirmationData({ show: false });
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicoCursoAsignaturas;
