import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstudianteType } from "@/types";
import { useEffect, useState } from "react";
import { getLibretaEstudiante } from "@/services/academicoService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ModalVerNotasProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: EstudianteType | null;
}

interface AsignaturaNota {
  asignatura_id: number;
  nombre: string;
  concepto: boolean;
  calificacion1: number | null;
  calificacion2: number | null;
  calificacion3: number | null;
  calificacion4: number | null;
  calificacion5: number | null;
  calificacion6: number | null;
  calificacion7: number | null;
  calificacion8: number | null;
  calificacion9: number | null;
  calificacion10: number | null;
  calificacion11: number | null;
  calificacion12: number | null;
  calificacion13: number | null;
  calificacion14: number | null;
  calificacion15: number | null;
  calificacion16: number | null;
  calificacion17: number | null;
  calificacion18: number | null;
  calificacion19: number | null;
  calificacion20: number | null;
  calificacion21: number | null;
  calificacion22: number | null;
  calificacion23: number | null;
}

const ModalVerNotas = ({ isOpen, onClose, estudiante }: ModalVerNotasProps) => {
  const [notas, setNotas] = useState<AsignaturaNota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [semestre, setSemestre] = useState<"1" | "2">("1");

  useEffect(() => {
    const fetchNotas = async () => {
      if (!estudiante) return;

      setLoading(true);
      setError("");

      try {
        const response = await getLibretaEstudiante(
          estudiante.estudiante_id || estudiante.id
        );
        if (response.data) {
          setNotas(response.data);
        }
      } catch (err) {
        setError("Error al cargar las notas del estudiante");
        console.error("Error al cargar notas:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && estudiante) {
      fetchNotas();
    }
  }, [isOpen, estudiante]);

  const transformarNota = (nota: number | null, esConcepto: boolean) => {
    if (nota === null) return { valor: "-", esRojo: false };

    if (!esConcepto) {
      return {
        valor: nota.toString(),
        esRojo: nota < 40,
      };
    }

    if (nota >= 70) return { valor: "MB", esRojo: false };
    if (nota >= 50) return { valor: "B", esRojo: false };
    if (nota >= 40) return { valor: "S", esRojo: false };
    if (nota >= 30) return { valor: "I", esRojo: true };
    return { valor: "I", esRojo: true };
  };

  const redondearPromedio = (promedio: number) => {
    const decimal = promedio - Math.floor(promedio);
    if (decimal >= 0.5) {
      return Math.ceil(promedio);
    }
    return Math.floor(promedio);
  };

  const getPromedioSemestre = (asignatura: AsignaturaNota) => {
    const calificaciones =
      semestre === "1"
        ? [
            asignatura.calificacion1,
            asignatura.calificacion2,
            asignatura.calificacion3,
            asignatura.calificacion4,
            asignatura.calificacion5,
            asignatura.calificacion6,
            asignatura.calificacion7,
            asignatura.calificacion8,
            asignatura.calificacion9,
            asignatura.calificacion10,
            asignatura.calificacion11,
            asignatura.calificacion12,
          ]
        : [
            asignatura.calificacion13,
            asignatura.calificacion14,
            asignatura.calificacion15,
            asignatura.calificacion16,
            asignatura.calificacion17,
            asignatura.calificacion18,
            asignatura.calificacion19,
            asignatura.calificacion20,
            asignatura.calificacion21,
            asignatura.calificacion22,
            asignatura.calificacion23,
          ];

    const notasValidas = calificaciones.filter(
      (nota): nota is number => nota !== null
    );

    if (notasValidas.length === 0) return null;

    const promedio =
      notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
    const promedioRedondeado = redondearPromedio(promedio);
    return asignatura.concepto
      ? transformarNota(promedioRedondeado, true).valor
      : promedioRedondeado.toString();
  };

  const getPromedioNumericoSemestre = (
    asignatura: AsignaturaNota,
    semestreActual: "1" | "2"
  ) => {
    const calificaciones =
      semestreActual === "1"
        ? [
            asignatura.calificacion1,
            asignatura.calificacion2,
            asignatura.calificacion3,
            asignatura.calificacion4,
            asignatura.calificacion5,
            asignatura.calificacion6,
            asignatura.calificacion7,
            asignatura.calificacion8,
            asignatura.calificacion9,
            asignatura.calificacion10,
            asignatura.calificacion11,
            asignatura.calificacion12,
          ]
        : [
            asignatura.calificacion13,
            asignatura.calificacion14,
            asignatura.calificacion15,
            asignatura.calificacion16,
            asignatura.calificacion17,
            asignatura.calificacion18,
            asignatura.calificacion19,
            asignatura.calificacion20,
            asignatura.calificacion21,
            asignatura.calificacion22,
            asignatura.calificacion23,
          ];

    const notasValidas = calificaciones.filter(
      (nota): nota is number => nota !== null
    );

    if (notasValidas.length === 0) return null;

    const promedio =
      notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
    return redondearPromedio(promedio);
  };

  const getPromedioGeneralSemestre = (semestre: "1" | "2") => {
    const promediosAsignaturas = notas
      .map((asignatura) => getPromedioNumericoSemestre(asignatura, semestre))
      .filter((promedio): promedio is number => promedio !== null);

    if (promediosAsignaturas.length === 0) return null;

    const promedioGeneral =
      promediosAsignaturas.reduce((a, b) => a + b, 0) /
      promediosAsignaturas.length;
    return Math.floor(promedioGeneral).toString();
  };

  const getPromedioGeneralFinal = () => {
    const promedioSemestre1 = getPromedioGeneralSemestre("1");
    const promedioSemestre2 = getPromedioGeneralSemestre("2");

    if (!promedioSemestre1 && !promedioSemestre2) return null;

    if (!promedioSemestre1) return promedioSemestre2;
    if (!promedioSemestre2) return promedioSemestre1;

    const promedioFinal =
      (Number(promedioSemestre1) + Number(promedioSemestre2)) / 2;
    return redondearPromedio(promedioFinal).toString();
  };

  const getPromedioFinal = (asignatura: AsignaturaNota) => {
    const promedioSemestre1 = getPromedioNumericoSemestre(asignatura, "1");
    const promedioSemestre2 = getPromedioNumericoSemestre(asignatura, "2");

    if (!promedioSemestre1 && !promedioSemestre2) return null;

    if (!promedioSemestre1) return promedioSemestre2?.toString();
    if (!promedioSemestre2) return promedioSemestre1?.toString();

    const promedioFinal = (promedioSemestre1 + promedioSemestre2) / 2;
    const promedioRedondeado = redondearPromedio(promedioFinal);

    if (asignatura.concepto) {
      return transformarNota(promedioRedondeado, true).valor;
    }

    return promedioRedondeado.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Notas del Estudiante
          </DialogTitle>
        </DialogHeader>

        {loading && <div>Cargando notas...</div>}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Información del Estudiante
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Nombre:</span>{" "}
                    {estudiante?.nombre}
                  </p>
                  <p>
                    <span className="font-medium">RUT:</span> {estudiante?.rut}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Semestre</h3>
                <RadioGroup
                  defaultValue="1"
                  value={semestre}
                  onValueChange={(value) => setSemestre(value as "1" | "2")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="semestre1" />
                    <Label htmlFor="semestre1">1º Semestre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="semestre2" />
                    <Label htmlFor="semestre2">2º Semestre</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Asignaturas</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asignatura</TableHead>
                    {semestre === "1" ? (
                      <>
                        <TableHead>N1</TableHead>
                        <TableHead>N2</TableHead>
                        <TableHead>N3</TableHead>
                        <TableHead>N4</TableHead>
                        <TableHead>N5</TableHead>
                        <TableHead>N6</TableHead>
                        <TableHead>N7</TableHead>
                        <TableHead>N8</TableHead>
                        <TableHead>N9</TableHead>
                        <TableHead>N10</TableHead>
                        <TableHead>N11</TableHead>
                        <TableHead>N12</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>N13</TableHead>
                        <TableHead>N14</TableHead>
                        <TableHead>N15</TableHead>
                        <TableHead>N16</TableHead>
                        <TableHead>N17</TableHead>
                        <TableHead>N18</TableHead>
                        <TableHead>N19</TableHead>
                        <TableHead>N20</TableHead>
                        <TableHead>N21</TableHead>
                        <TableHead>N22</TableHead>
                        <TableHead>N23</TableHead>
                      </>
                    )}
                    <TableHead>Promedio Semestre</TableHead>
                    <TableHead>Promedio Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notas.map((asignatura) => (
                    <TableRow key={asignatura.asignatura_id}>
                      <TableCell className="font-medium">
                        {asignatura.nombre}
                      </TableCell>
                      {semestre === "1" ? (
                        <>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion1,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion1,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion2,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion2,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion3,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion3,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion4,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion4,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion5,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion5,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion6,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion6,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion7,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion7,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion8,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion8,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion9,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion9,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion10,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion10,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion11,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion11,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion12,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion12,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion13,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion13,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion14,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion14,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion15,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion15,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion16,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion16,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion17,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion17,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion18,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion18,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion19,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion19,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion20,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion20,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion21,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion21,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion22,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion22,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transformarNota(
                                  asignatura.calificacion23,
                                  asignatura.concepto
                                ).esRojo
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {
                                transformarNota(
                                  asignatura.calificacion23,
                                  asignatura.concepto
                                ).valor
                              }
                            </span>
                          </TableCell>
                        </>
                      )}
                      <TableCell className="font-bold">
                        <span
                          className={
                            transformarNota(
                              Number(getPromedioSemestre(asignatura)),
                              asignatura.concepto
                            ).esRojo
                              ? "text-red-600"
                              : ""
                          }
                        >
                          {getPromedioSemestre(asignatura) || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">
                        <span
                          className={
                            transformarNota(
                              Number(getPromedioFinal(asignatura)),
                              asignatura.concepto
                            ).esRojo
                              ? "text-red-600"
                              : ""
                          }
                        >
                          {getPromedioFinal(asignatura) || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="font-semibold text-sm text-gray-600">
                    Promedio General 1° Semestre
                  </p>
                  <p className="text-2xl font-bold">
                    {getPromedioGeneralSemestre("1") || "-"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-gray-600">
                    Promedio General 2° Semestre
                  </p>
                  <p className="text-2xl font-bold">
                    {getPromedioGeneralSemestre("2") || "-"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-gray-600">
                    Promedio Final
                  </p>
                  <p className="text-2xl font-bold">
                    {getPromedioGeneralFinal() || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalVerNotas;
