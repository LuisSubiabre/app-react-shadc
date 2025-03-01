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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Asignatura,
  CalificacionesState,
  CONCEPT_MAP,
  CalificacionValue,
} from "@/types/calificaciones";
import { EstudianteType } from "@/types";

interface TablaCalificacionesProps {
  estudiantes: EstudianteType[];
  asignaturas: Asignatura[];
  asignaturaSeleccionada: string | null;
  selectedSemester: number;
  studentGrades: CalificacionesState;
  onCalificacionChange: (
    estudianteId: number,
    asignaturaId: number,
    posicion: number,
    valor: number | null
  ) => Promise<boolean>;
  setStudentGrades: React.Dispatch<React.SetStateAction<CalificacionesState>>;
  setMensajeDialogo: (mensaje: string) => void;
  setAlertOpen: (open: boolean) => void;
}

export const TablaCalificaciones: React.FC<TablaCalificacionesProps> = ({
  estudiantes,
  asignaturas,
  asignaturaSeleccionada,
  selectedSemester,
  studentGrades,
  onCalificacionChange,
  setStudentGrades,
  setMensajeDialogo,
  setAlertOpen,
}) => {
  const getColumnRange =
    selectedSemester === 1
      ? [...Array(10).keys()].map((n) => n + 0)
      : [...Array(10).keys()].map((n) => n + 12);

  return (
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
            <TableCell>{estudiante.nombre}</TableCell>
            {getColumnRange.map((index) => {
              const calificacionKey = `calificacion${
                index + 1
              }` as keyof EstudianteType;
              const calificacion = estudiante[
                calificacionKey
              ] as CalificacionValue;

              return (
                <TableCell key={index}>
                  {asignaturas.find(
                    (a) => a.asignatura_id === Number(asignaturaSeleccionada)
                  )?.asignatura_concepto ? (
                    <RadioGroup
                      value={
                        studentGrades[
                          `${estudiante.id}-${asignaturaSeleccionada}`
                        ]?.[`calificacion${index + 1}`] === null
                          ? "null"
                          : String(
                              studentGrades[
                                `${estudiante.id}-${asignaturaSeleccionada}`
                              ]?.[`calificacion${index + 1}`] ||
                                calificacion ||
                                ""
                            )
                      }
                      onValueChange={(value: string) => {
                        const numericValue =
                          value === "null" ? null : Number(value);
                        setStudentGrades((prev) => ({
                          ...prev,
                          [`${estudiante.id}-${asignaturaSeleccionada}`]: {
                            ...prev[
                              `${estudiante.id}-${asignaturaSeleccionada}`
                            ],
                            [`calificacion${index + 1}`]: numericValue,
                          },
                        }));

                        onCalificacionChange(
                          estudiante.id,
                          Number(asignaturaSeleccionada),
                          index + 1,
                          numericValue
                        );
                      }}
                      className="flex flex-col space-y-1"
                    >
                      {Object.entries(CONCEPT_MAP).map(([concept, value]) => (
                        <div
                          key={concept}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={value === null ? "null" : String(value)}
                            id={`${estudiante.id}-${asignaturaSeleccionada}-${index}-${concept}`}
                          />
                          <Label
                            htmlFor={`${estudiante.id}-${asignaturaSeleccionada}-${index}-${concept}`}
                          >
                            {concept}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Input
                      type="number"
                      className="w-full border border-gray-300 rounded p-1"
                      value={
                        studentGrades[
                          `${estudiante.id}-${asignaturaSeleccionada}`
                        ]?.[`calificacion${index + 1}`] !== undefined
                          ? String(
                              studentGrades[
                                `${estudiante.id}-${asignaturaSeleccionada}`
                              ][`calificacion${index + 1}`]
                            )
                          : calificacion
                          ? String(calificacion)
                          : ""
                      }
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setStudentGrades((prev) => ({
                          ...prev,
                          [`${estudiante.id}-${asignaturaSeleccionada}`]: {
                            ...prev[
                              `${estudiante.id}-${asignaturaSeleccionada}`
                            ],
                            [`calificacion${index + 1}`]: newValue,
                          },
                        }));

                        if (newValue === "") {
                          onCalificacionChange(
                            estudiante.id,
                            Number(asignaturaSeleccionada),
                            index + 1,
                            null
                          ).then((success) => {
                            e.target.style.color = success ? "green" : "red";
                            if (!success) {
                              setMensajeDialogo(
                                "Error al guardar la calificación"
                              );
                            }
                          });
                          return;
                        }

                        const numericValue = Number(newValue);
                        if (numericValue >= 10 && numericValue <= 70) {
                          onCalificacionChange(
                            estudiante.id,
                            Number(asignaturaSeleccionada),
                            index + 1,
                            numericValue
                          ).then((success) => {
                            e.target.style.color = success ? "green" : "red";
                            if (!success) {
                              setMensajeDialogo(
                                "Error al guardar la calificación"
                              );
                            }
                          });
                        }
                      }}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        if (newValue === "") return;

                        const numericValue = Number(newValue);
                        if (numericValue < 10 || numericValue > 70) {
                          setStudentGrades((prev) => ({
                            ...prev,
                            [`${estudiante.id}-${asignaturaSeleccionada}`]: {
                              ...prev[
                                `${estudiante.id}-${asignaturaSeleccionada}`
                              ],
                              [`calificacion${index + 1}`]: "",
                            },
                          }));
                          setMensajeDialogo(
                            "La calificación debe estar entre 10 y 70"
                          );
                          setAlertOpen(true);
                        }
                      }}
                    />
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
