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
import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface ExcelRow {
  "Nombre del Estudiante": string;
  [key: string]: string | number | null;
}

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
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});
  const previousValues = useRef<Record<string, string>>({});

  const getColumnRange =
    selectedSemester === 1
      ? [...Array(10).keys()].map((n) => n + 0)
      : [...Array(10).keys()].map((n) => n + 12);

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      rowIndex: number,
      colIndex: number
    ) => {
      const inputs = document.querySelectorAll('input[type="number"]');
      const currentIndex = rowIndex * getColumnRange.length + colIndex;
      let nextInput: HTMLInputElement | null = null;

      // Prevenir el comportamiento predeterminado de las flechas arriba/abajo
      if (
        (e.key === "ArrowUp" && rowIndex === 0) ||
        (e.key === "ArrowDown" && rowIndex === estudiantes.length - 1)
      ) {
        e.preventDefault();
        return;
      }

      switch (e.key) {
        case "ArrowRight":
          nextInput = inputs[currentIndex + 1] as HTMLInputElement;
          break;
        case "ArrowLeft":
          nextInput = inputs[currentIndex - 1] as HTMLInputElement;
          break;
        case "ArrowDown":
        case "Enter":
          nextInput = inputs[
            currentIndex + getColumnRange.length
          ] as HTMLInputElement;
          break;
        case "ArrowUp":
          nextInput = inputs[
            currentIndex - getColumnRange.length
          ] as HTMLInputElement;
          break;
        default:
          return;
      }

      if (nextInput) {
        e.preventDefault();
        nextInput.focus();
      }
    },
    [getColumnRange.length, estudiantes.length]
  );

  const handleCalificacionSave = async (
    estudianteId: number,
    asignaturaId: number,
    index: number,
    value: string | null,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const key = `${estudianteId}-${asignaturaId}-${index}`;
    const currentValue = value === null ? "" : value;
    const previousValue = previousValues.current[key];

    if (currentValue === previousValue) {
      return;
    }

    previousValues.current[key] = currentValue;

    if (value === "") {
      const success = await onCalificacionChange(
        estudianteId,
        Number(asignaturaId),
        index + 1,
        null
      );
      setSavedStates((prev) => ({ ...prev, [key]: success }));
      e.target.style.color = success ? "green" : "red";
      if (!success) {
        setMensajeDialogo("Error al guardar la calificación");
      }
      return;
    }

    const numericValue = Number(value);
    if (numericValue >= 10 && numericValue <= 70) {
      const success = await onCalificacionChange(
        estudianteId,
        Number(asignaturaId),
        index + 1,
        numericValue
      );
      setSavedStates((prev) => ({ ...prev, [key]: success }));
      e.target.style.color = success ? "green" : "red";
      if (!success) {
        setMensajeDialogo("Error al guardar la calificación");
      }
    }
  };

  const handleExportExcel = useCallback(() => {
    if (!asignaturaSeleccionada) return;

    const asignatura = asignaturas.find(
      (a) => a.asignatura_id === Number(asignaturaSeleccionada)
    );

    if (!asignatura) return;

    // Preparar los datos para el Excel
    const excelData = estudiantes.map((estudiante): ExcelRow => {
      const row: ExcelRow = {
        "Nombre del Estudiante": estudiante.nombre,
      };

      getColumnRange.forEach((index) => {
        const calificacionKey = `calificacion${
          index + 1
        }` as keyof EstudianteType;
        const calificacion = estudiante[calificacionKey] as CalificacionValue;
        const savedValue =
          studentGrades[`${estudiante.id}-${asignaturaSeleccionada}`]?.[
            `calificacion${index + 1}`
          ];

        row[`C${index + 1}`] =
          savedValue !== undefined ? savedValue : calificacion || null;
      });

      return row;
    });

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar el ancho de las columnas
    const colWidths = [
      { wch: 30 }, // Nombre del estudiante
      ...getColumnRange.map(() => ({ wch: 10 })), // Columnas de calificaciones
    ];
    ws["!cols"] = colWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");

    // Generar el archivo
    XLSX.writeFile(wb, `Calificaciones_${asignatura.asignatura_nombre}.xlsx`);
  }, [
    estudiantes,
    asignaturas,
    asignaturaSeleccionada,
    studentGrades,
    getColumnRange,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleExportExcel}
          disabled={!asignaturaSeleccionada}
          className="bg-primary hover:bg-primary/90"
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
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Exportar a Excel
        </Button>
      </div>
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
          {estudiantes.map((estudiante, rowIndex) => (
            <TableRow key={estudiante.id}>
              <TableCell>{estudiante.nombre}</TableCell>
              {getColumnRange.map((index) => {
                const calificacionKey = `calificacion${
                  index + 1
                }` as keyof EstudianteType;
                const calificacion = estudiante[
                  calificacionKey
                ] as CalificacionValue;
                const savedKey = `${estudiante.id}-${asignaturaSeleccionada}-${index}`;
                const currentValue =
                  studentGrades[`${estudiante.id}-${asignaturaSeleccionada}`]?.[
                    `calificacion${index + 1}`
                  ] !== undefined
                    ? String(
                        studentGrades[
                          `${estudiante.id}-${asignaturaSeleccionada}`
                        ][`calificacion${index + 1}`]
                      )
                    : calificacion
                    ? String(calificacion)
                    : "";

                if (!(savedKey in previousValues.current)) {
                  previousValues.current[savedKey] = currentValue;
                }

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
                        className="flex flex-col gap-0.5"
                      >
                        {Object.entries(CONCEPT_MAP).map(([concept, value]) => (
                          <div
                            key={concept}
                            className="flex items-center group relative"
                          >
                            <RadioGroupItem
                              value={value === null ? "null" : String(value)}
                              id={`${estudiante.id}-${asignaturaSeleccionada}-${index}-${concept}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`${estudiante.id}-${asignaturaSeleccionada}-${index}-${concept}`}
                              className="w-full px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors bg-muted hover:bg-muted/80 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground rounded-sm"
                            >
                              {concept}
                            </Label>
                            {/* <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-0.5 bg-popover text-popover-foreground text-xs rounded-sm border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm">
                              {concept === "MB"
                                ? "Muy Bueno (70)"
                                : concept === "B"
                                ? "Bueno (50)"
                                : concept === "S"
                                ? "Suficiente (40)"
                                : concept === "I"
                                ? "Insuficiente (30)"
                                : "Quitar calificación"}
                            </div> */}
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="relative">
                        <Input
                          type="number"
                          className={`w-full border border-gray-300 rounded p-1 ${
                            savedStates[savedKey] ? "border-green-500/50" : ""
                          }`}
                          value={currentValue}
                          style={{
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, index)}
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
                              handleCalificacionSave(
                                estudiante.id,
                                Number(asignaturaSeleccionada),
                                index,
                                "",
                                e
                              );
                            }
                          }}
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            if (newValue === "") {
                              handleCalificacionSave(
                                estudiante.id,
                                Number(asignaturaSeleccionada),
                                index,
                                "",
                                e
                              );
                              return;
                            }

                            const numericValue = Number(newValue);
                            if (numericValue < 10 || numericValue > 70) {
                              setStudentGrades((prev) => ({
                                ...prev,
                                [`${estudiante.id}-${asignaturaSeleccionada}`]:
                                  {
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
                            } else {
                              handleCalificacionSave(
                                estudiante.id,
                                Number(asignaturaSeleccionada),
                                index,
                                newValue,
                                e
                              );
                            }
                          }}
                        />
                        {savedStates[savedKey] && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
