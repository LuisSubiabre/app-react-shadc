import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CursoApiResponseType } from "@/types/index.ts";
import Spinner from "@/components/Spinner";
import { TallerType } from "@/types/index.ts";

interface ModalCursosProps {
  isOpen: boolean;
  onClose: () => void;
  currentTaller: TallerType | null;
  dataCursos: CursoApiResponseType[];
  loadingCursos: boolean;
  errorCursos: string | null;
  asignacionesActuales: Map<number, number[]>;
  onCursoChange: (cursoId: number, checked: boolean) => void;
  errorMessage: string | null;
}

export const ModalCursos: React.FC<ModalCursosProps> = ({
  isOpen,
  onClose,
  currentTaller,
  dataCursos,
  loadingCursos,
  errorCursos,
  asignacionesActuales,
  onCursoChange,
  errorMessage,
}) => {
  if (!currentTaller) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar Cursos</DialogTitle>
        </DialogHeader>
        <div className="font-semibold leading-none tracking-tight">
          Taller: {currentTaller.taller_nombre}
        </div>
        <div className="grid gap-2">
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 max-h-64 overflow-y-auto">
            {loadingCursos && <Spinner />}
            {errorCursos && (
              <div className="text-red-500 text-sm">{errorCursos}</div>
            )}
            {dataCursos?.map((curso) => {
              const cursosAsignados = asignacionesActuales.get(curso.id);
              const isSelected = cursosAsignados ? true : false;

              return (
                <div
                  key={curso.id}
                  className="space-y-3 border-b pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`curso-${curso.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          onCursoChange(curso.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`curso-${curso.id}`}
                        className="font-medium"
                      >
                        {curso.nombre}
                      </Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
