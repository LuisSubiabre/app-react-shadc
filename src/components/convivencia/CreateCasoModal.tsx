import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EstudianteType } from "@/types";
import { createCaso } from "@/services/convivenciaService";
import { format } from "date-fns";
import { Plus, Link, FileText, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreateCasoModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: EstudianteType | null;
  onCasoCreated: () => void;
}

export function CreateCasoModal({
  isOpen,
  onClose,
  estudiante,
  onCasoCreated,
}: CreateCasoModalProps) {
  const [formData, setFormData] = useState({
    paso1: false,
    fecha_paso1: "",
    paso2: false,
    fecha_paso2: "",
    paso3: false,
    fecha_paso3: "",
    paso4: false,
    fecha_paso4: "",
    url: "",
    observaciones: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!estudiante) return;

    setIsLoading(true);
    try {
      const createData = {
        estudiante_id: estudiante.estudiante_id || estudiante.id,
        paso1: formData.paso1,
        fecha_paso1: formData.paso1 && formData.fecha_paso1 ? new Date(formData.fecha_paso1).toISOString() : null,
        paso2: formData.paso2,
        fecha_paso2: formData.paso2 && formData.fecha_paso2 ? new Date(formData.fecha_paso2).toISOString() : null,
        paso3: formData.paso3,
        fecha_paso3: formData.paso3 && formData.fecha_paso3 ? new Date(formData.fecha_paso3).toISOString() : null,
        paso4: formData.paso4,
        fecha_paso4: formData.paso4 && formData.fecha_paso4 ? new Date(formData.fecha_paso4).toISOString() : null,
        url: formData.url || null,
        observaciones: formData.observaciones || null,
      };

      await createCaso(createData);
      
      toast({
        title: "Caso creado",
        description: "El nuevo caso se ha creado correctamente.",
      });
      
      onCasoCreated();
      handleClose();
    } catch (error) {
      console.error("Error al crear caso:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el caso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      paso1: false,
      fecha_paso1: "",
      paso2: false,
      fecha_paso2: "",
      paso3: false,
      fecha_paso3: "",
      paso4: false,
      fecha_paso4: "",
      url: "",
      observaciones: "",
    });
    onClose();
  };

  const handlePasoChange = (paso: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [paso]: checked,
      [`fecha_${paso}`]: checked ? format(new Date(), "yyyy-MM-dd'T'HH:mm") : "",
    }));
  };

  if (!estudiante) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Plus className="h-6 w-6 text-green-600" />
            Crear Nuevo Caso - {estudiante.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del estudiante */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudiante</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {estudiante.nombre}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Curso</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {estudiante.curso_nombre}
                </p>
              </div>
            </div>
          </div>

          {/* Pasos del protocolo */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pasos del Protocolo
            </h3>
            
            {/* Paso 1 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-medium">Paso 1</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inicio</p>
                </div>
                <Switch
                  checked={formData.paso1}
                  onCheckedChange={(checked) => handlePasoChange("paso1", checked)}
                />
              </div>
              {formData.paso1 && (
                <div className="space-y-2">
                  <Label htmlFor="fecha_paso1" className="text-sm text-gray-600 dark:text-gray-400">
                    Fecha de completado
                  </Label>
                  <Input
                    id="fecha_paso1"
                    type="datetime-local"
                    value={formData.fecha_paso1}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, fecha_paso1: e.target.value }))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Paso 2 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-medium">Paso 2</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Investigación</p>
                </div>
                <Switch
                  checked={formData.paso2}
                  onCheckedChange={(checked) => handlePasoChange("paso2", checked)}
                />
              </div>
              {formData.paso2 && (
                <div className="space-y-2">
                  <Label htmlFor="fecha_paso2" className="text-sm text-gray-600 dark:text-gray-400">
                    Fecha de completado
                  </Label>
                  <Input
                    id="fecha_paso2"
                    type="datetime-local"
                    value={formData.fecha_paso2}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, fecha_paso2: e.target.value }))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Paso 3 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-medium">Paso 3</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cierre</p>
                </div>
                <Switch
                  checked={formData.paso3}
                  onCheckedChange={(checked) => handlePasoChange("paso3", checked)}
                />
              </div>
              {formData.paso3 && (
                <div className="space-y-2">
                  <Label htmlFor="fecha_paso3" className="text-sm text-gray-600 dark:text-gray-400">
                    Fecha de completado
                  </Label>
                  <Input
                    id="fecha_paso3"
                    type="datetime-local"
                    value={formData.fecha_paso3}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, fecha_paso3: e.target.value }))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Paso 4 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-medium">Paso 4</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Seguimiento</p>
                </div>
                <Switch
                  checked={formData.paso4}
                  onCheckedChange={(checked) => handlePasoChange("paso4", checked)}
                />
              </div>
              {formData.paso4 && (
                <div className="space-y-2">
                  <Label htmlFor="fecha_paso4" className="text-sm text-gray-600 dark:text-gray-400">
                    Fecha de completado
                  </Label>
                  <Input
                    id="fecha_paso4"
                    type="datetime-local"
                    value={formData.fecha_paso4}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, fecha_paso4: e.target.value }))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Información Adicional
            </h3>
            
            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Enlace de documento
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://drive.google.com/documento-convivencia-123"
                value={formData.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full"
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observaciones
              </Label>
              <Textarea
                id="observaciones"
                placeholder="Descripción del caso, acciones tomadas, observaciones importantes..."
                value={formData.observaciones}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                className="w-full min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Creando..." : "Crear Caso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 