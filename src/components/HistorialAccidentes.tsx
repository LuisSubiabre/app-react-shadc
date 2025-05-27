import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAccidenteByEstudiante, deleteAccidente } from "@/services/inspectoriaService";
import { PDFDocument } from "pdf-lib";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HistorialAccidentesProps {
  estudianteId: number | undefined;
}

interface Accidente {
  accidente_id: number;
  estudiante_id: number;
  rut_estudiante: string;
  nombre_estudiante: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: string;
  direccion: string;
  celular: string;
  curso: string;
  fecha_registro: string;
  fecha_accidente: string;
  hora_accidente: string;
  dia_semana: string;
  tipo_accidente: string;
  horario: string;
  circunstancia: string;
  testigo1_nombre: string;
  testigo1_cedula: string;
  testigo2_nombre: string;
  testigo2_cedula: string;
  created_at: string;
  updated_at: string;
}

export function HistorialAccidentes({ estudianteId }: HistorialAccidentesProps) {
  const [accidentes, setAccidentes] = useState<Accidente[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accidenteAEliminar, setAccidenteAEliminar] = useState<number | null>(null);

  const cargarAccidentes = async () => {
    if (!estudianteId) {
      setError("ID de estudiante no válido");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getAccidenteByEstudiante(estudianteId);
      setAccidentes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar accidentes:", error);
      setError("Error al cargar el historial de accidentes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      cargarAccidentes();
    } else {
      setAccidentes([]);
      setError(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      const fechaObj = new Date(fecha);
      
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }

      const dia = fechaObj.getUTCDate().toString().padStart(2, '0');
      const mes = (fechaObj.getUTCMonth() + 1).toString().padStart(2, '0');
      const año = fechaObj.getUTCFullYear();
      
      return `${dia}/${mes}/${año}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  const generarPDF = async (accidente: Accidente) => {
    try {
      // Cargar el PDF base
      const response = await fetch(
        "/static/Declaracion-Individual-de-Accidente.pdf",
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al cargar el PDF: ${response.status} ${response.statusText}`
        );
      }

      const pdfBytes = await response.arrayBuffer();

      // Verificar que el PDF sea válido
      if (pdfBytes.byteLength === 0) {
        throw new Error("El archivo PDF está vacío");
      }

      // Cargar el PDF en pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];

      // Información del curso
      page.drawText(accidente.curso, {
        x: 60,
        y: 670,
        size: 10,
      });

      // Nombre completo del estudiante
      page.drawText(accidente.nombre_estudiante, {
        x: 60,
        y: 613,
        size: 10,
      });

      // Dirección
      page.drawText(accidente.direccion, {
        x: 60,
        y: 560,
        size: 10,
      });

      // Sexo
      const estudianteGenero = `${accidente.sexo === "M" ? "1" : "2"} `;
      page.drawText(estudianteGenero, {
        x: 422,
        y: 600,
        size: 8,
      });

      // Fecha de nacimiento
      const fechaNacimiento = new Date(accidente.fecha_nacimiento);
      const diaNac = fechaNacimiento.getUTCDate().toString().padStart(2, "0");
      const mesNac = (fechaNacimiento.getUTCMonth() + 1).toString().padStart(2, "0");
      const añoNac = fechaNacimiento.getUTCFullYear().toString();

      page.drawText(diaNac, {
        x: 450,
        y: 600,
        size: 8,
      });

      page.drawText("/", {
        x: 462,
        y: 600,
        size: 8,
      });

      page.drawText(mesNac, {
        x: 467,
        y: 600,
        size: 8,
      });

      page.drawText("/", {
        x: 479,
        y: 600,
        size: 8,
      });

      page.drawText(añoNac, {
        x: 484,
        y: 600,
        size: 8,
      });

      // Edad
      page.drawText(accidente.edad.toString(), {
        x: 512,
        y: 600,
        size: 8,
      });

      // Hora del accidente
      const [hora, minuto] = accidente.hora_accidente.split(":");
      const horaFormateada = hora.split("").join("   ");
      const minutoFormateado = minuto.split("").join("   ");

      page.drawText(horaFormateada, {
        x: 65,
        y: 480,
        size: 10,
      });

      page.drawText(minutoFormateado, {
        x: 90,
        y: 480,
        size: 10,
      });

      // Fecha del accidente
      const fecha = new Date(accidente.fecha_accidente);
      const dia = fecha.getUTCDate().toString().padStart(2, "0").split("").join("   ");
      const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, "0").split("").join("   ");
      const año = fecha.getUTCFullYear().toString();

      page.drawText(dia, {
        x: 270,
        y: 480,
        size: 10,
      });

      page.drawText(mes, {
        x: 205,
        y: 480,
        size: 10,
      });

      page.drawText(año, {
        x: 140,
        y: 480,
        size: 10,
      });

      // Fecha de Registro
      const fechaReg = new Date(accidente.fecha_registro);
      const diaReg = fechaReg.getUTCDate().toString().padStart(2, "0").split("").join("   ");
      const mesReg = (fechaReg.getUTCMonth() + 1).toString().padStart(2, "0").split("").join("   ");
      const añoReg = fechaReg.getUTCFullYear().toString();

      page.drawText(diaReg, {
        x: 330,
        y: 655,
        size: 10,
      });

      page.drawText(mesReg, {
        x: 355,
        y: 655,
        size: 10,
      });

      page.drawText(añoReg, {
        x: 390,
        y: 655,
        size: 10,
      });

      // Día semana accidente
      const getNumeroDiaSemana = (dia: string): string => {
        const map: { [key: string]: string } = {
          Lunes: "1",
          Martes: "2",
          Miércoles: "3",
          Jueves: "4",
          Viernes: "5",
          Sábado: "6",
          Domingo: "7",
        };
        return map[dia] || "";
      };

      const getCodigoTipoAccidente = (tipo: string): string => {
        const map: { [key: string]: string } = {
          "De Trayecto": "1",
          "En La escuela": "2",
        };
        return map[tipo] || "";
      };

      const numeroDiaSemana = getNumeroDiaSemana(accidente.dia_semana);
      const codigoTipoAccidente = getCodigoTipoAccidente(accidente.tipo_accidente);

      page.drawText(numeroDiaSemana, {
        x: 135,
        y: 430,
        size: 10,
      });

      // Tipo de accidente
      page.drawText(codigoTipoAccidente, {
        x: 250,
        y: 430,
        size: 10,
      });

      // Horario
      page.drawText(accidente.horario, {
        x: 190,
        y: 670,
        size: 10,
      });

      // Testigos
      if (accidente.testigo1_nombre) {
        page.drawText(accidente.testigo1_nombre, {
          x: 290,
          y: 445,
          size: 10,
        });

        if (accidente.testigo1_cedula) {
          page.drawText(accidente.testigo1_cedula, {
            x: 420,
            y: 445,
            size: 10,
          });
        }
      }

      if (accidente.testigo2_nombre) {
        page.drawText(accidente.testigo2_nombre, {
          x: 290,
          y: 410,
          size: 10,
        });

        if (accidente.testigo2_cedula) {
          page.drawText(accidente.testigo2_cedula, {
            x: 420,
            y: 410,
            size: 10,
          });
        }
      }

      // Circunstancia del accidente
      const wrapText = (text: string, maxChars: number): string[] => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (testLine.length <= maxChars) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }
        return lines;
      };

      const lineasCircunstancia = wrapText(accidente.circunstancia, 75);
      lineasCircunstancia.forEach((linea, index) => {
        page.drawText(linea, {
          x: 60,
          y: 360 - index * 17,
          size: 10,
        });
      });

      // Guardar el PDF modificado
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Crear enlace y descargar
      const link = document.createElement("a");
      link.href = url;
      link.download = `Declaracion-Individual-de-Accidente-${accidente.nombre_estudiante}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al modificar el PDF:", error);
    }
  };

  const handleEliminarAccidente = async (accidenteId: number) => {
    try {
      await deleteAccidente(accidenteId);
      setAccidentes(accidentes.filter(acc => acc.accidente_id !== accidenteId));
      setAccidenteAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar el accidente:", error);
      setError("Error al eliminar el accidente");
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
          disabled={!estudianteId}
        >
          Historial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historial de Accidentes</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : accidentes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay registros de accidentes
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Fecha Accidente</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accidentes.map((accidente) => (
                  <TableRow key={accidente.accidente_id}>
                    <TableCell>{accidente.accidente_id}</TableCell>
                    <TableCell>{formatearFecha(accidente.fecha_registro)}</TableCell>
                    <TableCell>{formatearFecha(accidente.fecha_accidente)}</TableCell>
                      <TableCell className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generarPDF(accidente)}
                      >
                        Descargar PDF
                      </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setAccidenteAEliminar(accidente.accidente_id)}
                        >
                          Eliminar
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>

      <AlertDialog open={accidenteAEliminar !== null} onOpenChange={() => setAccidenteAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro del accidente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => accidenteAEliminar && handleEliminarAccidente(accidenteAEliminar)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 