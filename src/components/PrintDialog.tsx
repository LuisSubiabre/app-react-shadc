import { useEffect, useRef } from "react";
import { EstudianteType } from "@/types";

interface PrintDialogProps {
  estudiante: EstudianteType;
  hora: string;
  onClose: () => void;
}

const PrintDialog = ({ estudiante, hora, onClose }: PrintDialogProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (printRef.current) {
      window.print();
      // Cerrar la ventana después de imprimir
      setTimeout(onClose, 1000);
    }
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={printRef}
        className="bg-white p-8 rounded-lg shadow-lg w-[300px] print:w-[80mm] print:p-0"
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">TICKET DE ATRASO</h2>
          <p className="text-sm">Fecha: {new Date().toLocaleDateString()}</p>
          <p className="text-sm">Hora: {hora}</p>
        </div>

        <div className="border-t border-b py-2 my-2">
          <p className="text-sm">
            <strong>Estudiante:</strong> {estudiante.nombre}
          </p>
          <p className="text-sm">
            <strong>RUT:</strong> {estudiante.rut}
          </p>
          <p className="text-sm">
            <strong>Curso:</strong> {estudiante.curso_nombre}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold">Tipo: Atraso</p>
        </div>
      </div>
    </div>
  );
};

export default PrintDialog;
