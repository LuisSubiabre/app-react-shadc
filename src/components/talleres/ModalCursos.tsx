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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Gestión de Cursos - {currentTaller.taller_nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {loadingCursos ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : errorCursos ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorCursos}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Asignación de Cursos
                </Label>
                <span className="text-sm text-muted-foreground">
                  {dataCursos.length} cursos disponibles
                </span>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataCursos.map((curso) => {
                    const cursosAsignados = asignacionesActuales.get(curso.id);
                    const isSelected = cursosAsignados ? true : false;

                    return (
                      <div
                        key={curso.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <Checkbox
                            id={`curso-${curso.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              onCursoChange(curso.id, checked as boolean)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </div>
                        <div className="flex-grow">
                          <Label
                            htmlFor={`curso-${curso.id}`}
                            className="flex flex-col cursor-pointer"
                          >
                            <span className="font-medium text-sm">
                              {curso.nombre}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Jefatura: {curso.jefatura}
                            </span>
                          </Label>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Asignado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {errorMessage && (
            <Alert variant="destructive" className="w-full">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
