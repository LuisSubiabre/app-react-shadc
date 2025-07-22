import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";

import { EstudianteType, CasoConvivenciaType } from "@/types";
import { getCasosEstudiante, deleteCaso } from "@/services/convivenciaService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  Link,
  Plus
} from "lucide-react";
import { EditCasoModal } from "./EditCasoModal";
import { CreateCasoModal } from "./CreateCasoModal";
import { toast } from "@/hooks/use-toast";

interface ModalCasosProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: EstudianteType | null;
}

export function ModalCasos({
  isOpen,
  onClose,
  estudiante,
}: ModalCasosProps) {
  const [casos, setCasos] = useState<CasoConvivenciaType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCaso, setSelectedCaso] = useState<CasoConvivenciaType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [casoToDelete, setCasoToDelete] = useState<CasoConvivenciaType | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && estudiante) {
      fetchCasos();
    }
  }, [isOpen, estudiante]);

  const fetchCasos = async () => {
    if (!estudiante) return;
    
    setIsLoading(true);
    try {
      const estudianteId = estudiante.estudiante_id || estudiante.id;
      const response = await getCasosEstudiante(estudianteId);
      setCasos(response);
    } catch (error) {
      console.error("Error al obtener casos:", error);
      setCasos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatearFecha = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      return format(fecha, "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const getEstadoPaso = (completado: boolean, fecha: string | null) => {
    if (completado && fecha) {
      return (
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Completado</span>
        </div>
      );
    } else if (completado) {
      return (
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Completado</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pendiente</span>
        </div>
      );
    }
  };

  const getProgresoTotal = (caso: CasoConvivenciaType) => {
    const pasos = [caso.paso1, caso.paso2, caso.paso3, caso.paso4];
    const completados = pasos.filter(paso => paso).length;
    return Math.round((completados / 4) * 100);
  };

  const handleEditCaso = (caso: CasoConvivenciaType) => {
    setSelectedCaso(caso);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCaso(null);
  };

  const handleCasoUpdate = () => {
    fetchCasos();
  };

  const handleCreateCaso = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCasoCreated = () => {
    fetchCasos();
  };

  const handleDeleteCaso = (caso: CasoConvivenciaType) => {
    setCasoToDelete(caso);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!casoToDelete) return;

    try {
      await deleteCaso(casoToDelete.caso_id);
      toast({
        title: "Caso eliminado",
        description: "El caso se ha eliminado correctamente.",
      });
      fetchCasos();
    } catch (error) {
      console.error("Error al eliminar caso:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el caso. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCasoToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Casos de Convivencia - {estudiante?.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del estudiante */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudiante</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {estudiante?.nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Curso</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {estudiante?.curso_nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de casos</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {casos.length}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleCreateCaso}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Caso
                </Button>
              </div>
            </div>





            {/* Lista de casos */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando casos...</p>
              </div>
            ) : casos.length > 0 ? (
              <div className="space-y-4">
                {casos.map((caso) => (
                  <div
                    key={caso.caso_id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Caso #{caso.caso_id}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Creado el {formatearFecha(caso.fecha_creacion)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {getProgresoTotal(caso)}%
                          </div>
                          <div className="text-sm text-gray-500">Progreso</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCaso(caso)}
                            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCaso(caso)}
                            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Progreso de pasos */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Progreso del Protocolo
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Paso 1 */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Paso 1
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Inicio</p>
                            </div>
                            {getEstadoPaso(caso.paso1, caso.fecha_paso1)}
                          </div>
                          {caso.fecha_paso1 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                              {formatearFecha(caso.fecha_paso1)}
                            </p>
                          )}
                        </div>

                        {/* Paso 2 */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Paso 2
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Investigación</p>
                            </div>
                            {getEstadoPaso(caso.paso2, caso.fecha_paso2)}
                          </div>
                          {caso.fecha_paso2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                              {formatearFecha(caso.fecha_paso2)}
                            </p>
                          )}
                        </div>

                        {/* Paso 3 */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Paso 3
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Cierre</p>
                            </div>
                            {getEstadoPaso(caso.paso3, caso.fecha_paso3)}
                          </div>
                          {caso.fecha_paso3 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                              {formatearFecha(caso.fecha_paso3)}
                            </p>
                          )}
                        </div>

                        {/* Paso 4 */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Paso 4
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Seguimiento</p>
                            </div>
                            {getEstadoPaso(caso.paso4, caso.fecha_paso4)}
                          </div>
                          {caso.fecha_paso4 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                              {formatearFecha(caso.fecha_paso4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    {(caso.observaciones || caso.url) && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        {caso.observaciones && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Observaciones:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded border">
                              {caso.observaciones}
                            </p>
                          </div>
                        )}
                        {caso.url && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <Link className="h-4 w-4" />
                              Enlace:
                            </p>
                            <a
                              href={caso.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline break-all"
                            >
                              {caso.url}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fechas */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Creado: {formatearFecha(caso.fecha_creacion)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Actualizado: {formatearFecha(caso.fecha_actualizacion)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay casos registrados
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Este estudiante no tiene casos de convivencia registrados en el sistema.
                </p>
              </div>
            )}
          </div>
        </DialogContent>

        {/* Modal de Edición */}
        <EditCasoModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          caso={selectedCaso}
          onUpdate={handleCasoUpdate}
        />

        {/* Modal de Creación */}
        <CreateCasoModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          estudiante={estudiante}
          onCasoCreated={handleCasoCreated}
        />
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar caso?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el caso #{casoToDelete?.caso_id}? 
              Esta acción no se puede deshacer y se perderá toda la información del caso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 