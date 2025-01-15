import React, { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Pencil, Printer } from "lucide-react";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";

import {
  Table,
  TableBody,
  TableCaption,
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import { useFetch } from "@/hooks/useFetch"; // Importamos correctamente desde hooks
import { savaEdit } from "./cursoService";
import { API_BASE_URL } from "@/config/config";

const AcademicoInicio: React.FC = () => {
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [isModalSubjectsOpen, setIsModalSubjectsOpen] =
    useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  const { user } = useAuth() || {}; // Si es null, devuelve un objeto vacío

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch<Curso[]>("cursos", token); // Trae los datos de la API
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

  if (loading) return <div className="spinner">Cargando...</div>; // Spinner de carga

  if (error) return <div className="error">{error}</div>; // Mensaje de error al cargar los datos de la API

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
      console.log(mappedData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setDataEstudiantes([]);
    }
  };
  /* Logica Editar */

  const handleSaveEdit = async () => {
    if (!currentCurso) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      await savaEdit(token, {
        ...currentCurso,
        nombre: currentCurso.nombre,
        descripcion: currentCurso.descripcion,
        indice: currentCurso.indice,
        codigo_ensenanza: currentCurso.codigo_ensenanza,
        profesor_jefe_id: currentCurso.profesor_jefe_id, // Verifica que este campo esté bien asignado
        id: currentCurso.id.toString(),
      });
      refetch();
      setIsModalEditOpen(false); // Cerrar el modal después de guardar
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unknown error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (curso: Curso) => {
    setCurrentCurso(curso);
    setIsModalEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setCurrentCurso(null);
    setErrorMessage(null);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentCurso) {
      setCurrentCurso({
        ...currentCurso,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleAsignaturasClick = async (curso: Curso) => {
    estudiantesCurso(curso.id);
    try {
      const response = await fetch(
        `http://localhost:3100/asignaturascursos/curso/${curso.id}`,
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
      console.log(subjectsForCourse);
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
    console.log(estudiante_id, asignatura_id);
    try {
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

  const handleCheckboxChange = (estudiante_id: number, asignatura_id: number, isChecked: boolean) => {
    if (isChecked) {
      // Si está marcando el checkbox, proceder normalmente
      handleStudentEnrollment(estudiante_id, asignatura_id, true);
    } else {
      // Si está desmarcando, mostrar diálogo de confirmación
      setConfirmationData({
        show: true,
        estudiante_id,
        asignatura_id
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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
            {data && data.length > 0 ? (
              data
                .filter((c) => user?.cursos.includes(c.id)) // Filtra los cursos cuyo id esté en user.cursos
                .map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.jefatura}</TableCell>
                    <TableCell>
                      <Button
                        className="mr-2"
                        onClick={() => handleEditClick(c)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="secondary"
                        className="mr-2"
                        onClick={() => handleAsignaturasClick(c)}
                      >
                        Asignaturas
                      </Button>
                      <Button variant="secondary" className="mr-2">
                        Notas
                      </Button>
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

      {/* Editar */}
      <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          {currentCurso && (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  disabled
                  id="nombre"
                  name="nombre"
                  value={currentCurso.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  value={currentCurso.descripcion}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Jefatura</Label>
                <Select
                  value={JSON.stringify({
                    id: currentCurso.profesor_jefe_id,
                    nombre:
                      dataUsuarios?.find(
                        (user) => user.id === currentCurso.profesor_jefe_id
                      )?.nombre || "",
                  })}
                  onValueChange={(value) => {
                    const selected = JSON.parse(value);
                    setCurrentCurso({
                      ...currentCurso,
                      profesor_jefe_id: selected.id,
                    });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona Jefatura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Funcionarios</SelectLabel>
                      {dataUsuarios?.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={JSON.stringify({
                            id: user.id,
                            nombre: user.nombre,
                          })}
                        >
                          {user.nombre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* <select
                  id="profesor_jefe_id"
                  name="profesor_jefe_id"
                  value={currentCurso.profesor_jefe_id}
                  onChange={handleSelectChange}
                  className="form-select"
                >
                  <option value="" disabled>
                    Seleccionar profesor jefe
                  </option>
                  {dataUsuarios?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre}
                    </option>
                  ))}
                </select> */}
              </div>
              <div className="mb-4">
                <Label htmlFor="indice">Índice</Label>
                <Input
                  id="indice"
                  name="indice"
                  type="number"
                  value={currentCurso.indice}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="codigo_ensenanza">Código Enseñanza</Label>
                <Input
                  id="codigo_ensenanza"
                  name="codigo_ensenanza"
                  type="number"
                  value={currentCurso.codigo_ensenanza}
                  onChange={handleInputChange}
                />
              </div>

              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseEditModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para gestión de asignaturas */}
      <Dialog
        open={isModalSubjectsOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Limpiar estados cuando se cierra el modal
            setSelectedSubject(null);
            setDataEstudiantes([]);
            setEnrolledStudents({});
          }
          setIsModalSubjectsOpen(open);
        }}
      >
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>
              Gestión de Asignaturas - {currentCurso?.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
              <>
                <div className="grid gap-2">
                  <Label>Profesor Asignatura</Label>
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

                        if (!response.ok) throw new Error("Error al actualizar profesor");

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
                    <SelectTrigger>
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

                <div className="grid gap-2">
                  <Label>Inscripción de Estudiantes</Label>

                  <div className="p-4 border rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                    <ul>
                      {Array.isArray(dataEstudiantes) &&
                        dataEstudiantes.map((estudiante) => (
                          <li
                            key={estudiante.id}
                            className="flex items-center gap-2"
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
                            />
                            <label
                              htmlFor={`estudiante-${estudiante.id}`}
                              className="text-sm"
                            >
                              {estudiante.nombre} {estudiante.nombre}
                            </label>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
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
              Cancelar
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
            <p className="text-red-500">Las calificaciones se eliminarán para el estudiante.</p>
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
                if (confirmationData.estudiante_id && confirmationData.asignatura_id) {
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

export default AcademicoInicio;
