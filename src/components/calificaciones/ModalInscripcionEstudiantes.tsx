import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/Spinner";
import { EstudianteType } from "@/types";
import { API_BASE_URL } from "@/config/config";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from "xlsx";

interface ModalInscripcionEstudiantesProps {
  isOpen: boolean;
  onClose: () => void;
  cursoId: number;
  asignaturaId: number;
  asignaturaNombre: string;
  onEstudiantesChange?: () => void;
}

export const ModalInscripcionEstudiantes: React.FC<
  ModalInscripcionEstudiantesProps
> = ({
  isOpen,
  onClose,
  cursoId,
  asignaturaId,
  asignaturaNombre,
  onEstudiantesChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<{
    [key: string]: boolean;
  }>({});
  const [confirmationData, setConfirmationData] = useState<{
    show: boolean;
    estudiante_id?: number;
    asignatura_id?: number;
  }>({ show: false });
  const { toast } = useToast();
  const { authToken } = useAuth();

  const checkStudentEnrollment = async (
    estudiante_id: number,
    asignatura_id: number
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/estudiantes-asignaturas/${estudiante_id}/${asignatura_id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
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
        const response = await fetch(
          `${API_BASE_URL}/estudiantes-asignaturas`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ estudiante_id, asignatura_id }),
          }
        );

        if (!response.ok) throw new Error("Error al inscribir estudiante");
      } else {
        const response = await fetch(
          `${API_BASE_URL}/estudiantes-asignaturas/${estudiante_id}/${asignatura_id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al desinscribir estudiante");
      }

      setEnrolledStudents((prev) => ({
        ...prev,
        [`${estudiante_id}-${asignatura_id}`]: isChecked,
      }));

      if (onEstudiantesChange) {
        onEstudiantesChange();
      }

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

  const loadEstudiantes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cursos/estudiantes/${cursoId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();
      const estudiantes = Array.isArray(data)
        ? data.map((estudiante) => ({
            ...estudiante,
            id: estudiante.estudiante_id,
          }))
        : [];

      const enrollments: { [key: string]: boolean } = {};
      for (const estudiante of estudiantes) {
        const isEnrolled = await checkStudentEnrollment(
          estudiante.id,
          asignaturaId
        );
        enrollments[`${estudiante.id}-${asignaturaId}`] = isEnrolled;
      }

      setEstudiantes(estudiantes);
      setEnrolledStudents(enrollments);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      toast({
        title: "Error",
        description: "Error al cargar los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEstudiantes();
    }
  }, [isOpen]);

  const handleCheckboxChange = (
    estudiante_id: number,
    asignatura_id: number,
    isChecked: boolean
  ) => {
    if (isChecked) {
      handleStudentEnrollment(estudiante_id, asignatura_id, true);
    } else {
      setConfirmationData({
        show: true,
        estudiante_id,
        asignatura_id,
      });
    }
  };

  const handleExportExcel = () => {
    // Filtrar solo los estudiantes inscritos
    const estudiantesInscritos = estudiantes.filter(
      (estudiante) => enrolledStudents[`${estudiante.id}-${asignaturaId}`]
    );

    if (estudiantesInscritos.length === 0) {
      toast({
        title: "No hay estudiantes inscritos",
        description: "No hay estudiantes inscritos para exportar",
        variant: "destructive",
      });
      return;
    }

    // Preparar los datos para el Excel
    const excelData = estudiantesInscritos.map((estudiante) => ({
      "Nombre del Estudiante": estudiante.nombre,
      "RUT": estudiante.rut,
      "Número de Lista": estudiante.numlista,
      "Estado": "Inscrito",
    }));

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar el ancho de las columnas
    const colWidths = [
      { wch: 30 }, // Nombre del estudiante
      { wch: 15 }, // RUT
      { wch: 15 }, // Número de lista
      { wch: 12 }, // Estado
    ];
    ws["!cols"] = colWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Estudiantes Inscritos");

    // Generar el archivo
    XLSX.writeFile(wb, `Estudiantes_Inscritos_${asignaturaNombre}.xlsx`);

    toast({
      title: "Exportación exitosa",
      description: `Se han exportado ${estudiantesInscritos.length} estudiantes inscritos`,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Gestión de Inscripciones - {asignaturaNombre}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium">
                      Inscripción de Estudiantes
                    </Label>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {
                          estudiantes.filter(
                            (estudiante) =>
                              enrolledStudents[
                                `${estudiante.id}-${asignaturaId}`
                              ]
                          ).length
                        }{" "}
                        inscritos
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        {
                          estudiantes.filter(
                            (estudiante) =>
                              !enrolledStudents[
                                `${estudiante.id}-${asignaturaId}`
                              ]
                          ).length
                        }{" "}
                        no inscritos
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allSelected = estudiantes.every(
                          (estudiante) =>
                            enrolledStudents[`${estudiante.id}-${asignaturaId}`]
                        );

                        if (!allSelected) {
                          const updatedEnrolledStudents = {
                            ...enrolledStudents,
                          };

                          estudiantes.forEach((estudiante) => {
                            updatedEnrolledStudents[
                              `${estudiante.id}-${asignaturaId}`
                            ] = true;
                          });

                          setEnrolledStudents(updatedEnrolledStudents);

                          estudiantes.forEach((estudiante) => {
                            handleStudentEnrollment(
                              estudiante.id,
                              asignaturaId,
                              true
                            );
                          });
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <span>Seleccionar Todos</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportExcel}
                      className="flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      <span>Exportar Excel</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                  {estudiantes.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          id={`estudiante-${estudiante.id}`}
                          checked={
                            enrolledStudents[
                              `${estudiante.id}-${asignaturaId}`
                            ] || false
                          }
                          onChange={(e) => {
                            handleCheckboxChange(
                              estudiante.id,
                              asignaturaId,
                              e.target.checked
                            );
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                      <div className="flex-grow">
                        <label
                          htmlFor={`estudiante-${estudiante.id}`}
                          className="flex flex-col cursor-pointer"
                        >
                          <span className="font-medium text-sm">
                            {estudiante.nombre}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            RUT: {estudiante.rut}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Lista: {estudiante.numlista}
                          </span>
                        </label>
                      </div>
                      <div className="flex-shrink-0">
                        {enrolledStudents[
                          `${estudiante.id}-${asignaturaId}`
                        ] && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Inscrito
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bottom-0 bg-background border-t pt-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
