import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ModalSesionesProps {
  isOpen: boolean;
  onClose: () => void;
  taller: {
    taller_id: number;
    taller_nombre: string;
  } | null;
  onSaveSesion: (fecha: Date) => Promise<void>;
  errorMessage: string | null;
}

export const ModalSesiones: React.FC<ModalSesionesProps> = ({
  isOpen,
  onClose,
  taller,
  onSaveSesion,
  errorMessage,
}) => {
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fecha) return;
    setSaving(true);
    try {
      await onSaveSesion(fecha);
      onClose();
    } catch (error) {
      console.error("Error al guardar la sesión:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Sesión</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Taller:</h3>
            <p className="text-gray-600">{taller?.taller_nombre}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Selecciona la fecha:</h3>
            <Calendar
              mode="single"
              selected={fecha}
              onSelect={setFecha}
              locale={es}
              className="rounded-md border"
            />
          </div>
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !fecha}>
            {saving ? "Guardando..." : "Guardar Sesión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 