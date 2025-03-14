import { Estudiante } from "@/app/dashboard/toor/estudiantes/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AsistenciaState } from "@/types/asistencia";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface TablaAsistenciaProps {
  estudiantes: Estudiante[];
  asistenciaState: AsistenciaState;
  onAsistenciaChange: (
    estudianteId: number,
    diasAsistidos: number,
    totalDias: number
  ) => void;
}

export const TablaAsistencia: React.FC<TablaAsistenciaProps> = ({
  estudiantes,
  asistenciaState,
  onAsistenciaChange,
}) => {
  const [diasTrabajadosModal, setDiasTrabajadosModal] = useState<string>("");
  const [editableCells, setEditableCells] = useState<{
    [key: string]: boolean;
  }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ordenAlfabetico, setOrdenAlfabetico] = useState(false);

  const handleSetDiasTrabajados = () => {
    const dias = Number(diasTrabajadosModal);
    if (dias >= 0 && dias <= 31) {
      estudiantes.forEach((estudiante) => {
        onAsistenciaChange(estudiante.id, 0, dias);
      });
      setIsDialogOpen(false);
      setDiasTrabajadosModal("");
    }
  };

  const toggleEditable = (cellId: string) => {
    setEditableCells((prev) => ({
      ...prev,
      [cellId]: !prev[cellId],
    }));
  };

  const estudiantesOrdenados = ordenAlfabetico
    ? [...estudiantes].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      )
    : estudiantes;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => setOrdenAlfabetico(!ordenAlfabetico)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <span>
            {ordenAlfabetico ? "Orden Original" : "Ordenar Alfabéticamente"}
          </span>
          {ordenAlfabetico ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
              />
            </svg>
          )}
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Establecer días trabajados</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Días trabajados</DialogTitle>
              <DialogDescription>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atención</AlertTitle>
                  <AlertDescription>
                    Al establecer los días trabajados de forma masiva, se
                    actualizará la cantidad de días trabajados de todos los
                    estudiantes del curso y se reiniciarán los días asistidos.
                  </AlertDescription>
                </Alert>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="diasTrabajados" className="text-right">
                  Total días trabajados:
                </Label>
                <Input
                  id="diasTrabajados"
                  type="number"
                  min={0}
                  max={31}
                  value={diasTrabajadosModal}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value || (Number(value) >= 0 && Number(value) <= 31)) {
                      setDiasTrabajadosModal(value);
                    }
                  }}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={handleSetDiasTrabajados}
                  disabled={
                    !diasTrabajadosModal ||
                    Number(diasTrabajadosModal) < 0 ||
                    Number(diasTrabajadosModal) > 31
                  }
                >
                  Guardar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>Registro de Asistencia</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Días Asistidos</TableHead>
            <TableHead>Total Días Trabajados</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {estudiantesOrdenados.map((estudiante) => {
            const asistencia = asistenciaState[estudiante.id] || {
              dias_asistidos: 0,
              total_dias: 0,
            };

            return (
              <TableRow key={estudiante.id}>
                <TableCell>{estudiante.nombre}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={asistencia.dias_asistidos || ""}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      if (
                        newValue >= 0 &&
                        newValue <= (asistencia.total_dias || 31)
                      ) {
                        onAsistenciaChange(
                          estudiante.id,
                          newValue,
                          asistencia.total_dias
                        );
                      }
                    }}
                    min={0}
                    max={asistencia.total_dias || 31}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={asistencia.total_dias || ""}
                    onChange={(e) => {
                      if (!editableCells[`total-${estudiante.id}`]) return;
                      const newValue = Number(e.target.value);
                      if (newValue >= 0 && newValue <= 31) {
                        onAsistenciaChange(estudiante.id, 0, newValue);
                      }
                    }}
                    onDoubleClick={() =>
                      toggleEditable(`total-${estudiante.id}`)
                    }
                    readOnly={!editableCells[`total-${estudiante.id}`]}
                    min={0}
                    max={31}
                    className={`w-20 ${
                      !editableCells[`total-${estudiante.id}`]
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
