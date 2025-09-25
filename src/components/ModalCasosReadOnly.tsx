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
import { Textarea } from "@/components/ui/textarea";
import { EstudianteType, CasoConvivenciaType, ComentarioConvivenciaType } from "@/types";
import { 
  getCasosEstudiante, 
  getComentariosConvivenciaCaso, 
  insertComentarioConvivencia, 
  updateComentarioConvivencia, 
  deleteComentarioConvivencia 
} from "@/services/convivenciaService";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar,
  AlertCircle,
  Link,
  Eye,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  User
} from "lucide-react";

interface ModalCasosReadOnlyProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: EstudianteType | null;
}

export function ModalCasosReadOnly({
  isOpen,
  onClose,
  estudiante,
}: ModalCasosReadOnlyProps) {
  const [casos, setCasos] = useState<CasoConvivenciaType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comentarios, setComentarios] = useState<{ [casoId: number]: ComentarioConvivenciaType[] }>({});
  const [nuevoComentario, setNuevoComentario] = useState<{ [casoId: number]: string }>({});
  const [editandoComentario, setEditandoComentario] = useState<{ [comentarioId: number]: string }>({});
  const [casoSeleccionado, setCasoSeleccionado] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [comentarioToDelete, setComentarioToDelete] = useState<{ id: number; casoId: number } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && estudiante) {
      fetchCasos();
    }
  }, [isOpen, estudiante]);

  useEffect(() => {
    if (casoSeleccionado) {
      fetchComentarios(casoSeleccionado);
    }
  }, [casoSeleccionado]);

  const fetchCasos = async () => {
    if (!estudiante) return;
    
    setIsLoading(true);
    try {
      const estudianteId = estudiante.estudiante_id || estudiante.id;
      const response = await getCasosEstudiante(estudianteId);
      setCasos(response);
      // Seleccionar el primer caso por defecto si hay casos
      if (response.length > 0) {
        setCasoSeleccionado(response[0].caso_id);
      }
    } catch (error) {
      console.error("Error al obtener casos:", error);
      setCasos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComentarios = async (casoId: number) => {
    try {
      const response = await getComentariosConvivenciaCaso(casoId);
      setComentarios(prev => ({
        ...prev,
        [casoId]: response
      }));
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      setComentarios(prev => ({
        ...prev,
        [casoId]: []
      }));
    }
  };

  const handleEnviarComentario = async (casoId: number) => {
    const comentario = nuevoComentario[casoId]?.trim();
    if (!comentario || !user) return;

    try {
      await insertComentarioConvivencia({
        caso_id: casoId,
        comentario,
        usuario_id: parseInt(user.id)
      });
      
      // Limpiar el input y recargar comentarios
      setNuevoComentario(prev => ({
        ...prev,
        [casoId]: ""
      }));
      fetchComentarios(casoId);
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    }
  };

  const handleEditarComentario = async (comentarioId: number, casoId: number) => {
    const comentario = editandoComentario[comentarioId]?.trim();
    if (!comentario) return;

    try {
      await updateComentarioConvivencia(comentarioId, { comentario });
      
      // Limpiar completamente el estado de edición
      setEditandoComentario(prev => {
        const newState = { ...prev };
        delete newState[comentarioId];
        return newState;
      });
      
      // Recargar comentarios para mostrar la actualización
      fetchComentarios(casoId);
    } catch (error) {
      console.error("Error al editar comentario:", error);
    }
  };

  const handleEliminarComentario = (comentarioId: number, casoId: number) => {
    setComentarioToDelete({ id: comentarioId, casoId });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteComentario = async () => {
    if (!comentarioToDelete) return;

    try {
      await deleteComentarioConvivencia(comentarioToDelete.id);
      fetchComentarios(comentarioToDelete.casoId);
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setComentarioToDelete(null);
    }
  };

  const puedeEditarComentario = (comentario: ComentarioConvivenciaType) => {
    if (!user) return false;
    
    // Comparar IDs como números para mayor precisión
    const userId = parseInt(user.id);
    const comentarioUsuarioId = parseInt(comentario.usuario_id.toString());
    
    return userId === comentarioUsuarioId;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-blue-600" />
            Casos de Convivencia - {estudiante?.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del estudiante */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
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
          </div>

          {/* Lista de casos */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando casos...</p>
            </div>
          ) : casos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de casos */}
              <div className="lg:col-span-1 space-y-4">
                {casos.map((caso) => (
                <div
                  key={caso.caso_id}
                  className={`bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-sm cursor-pointer transition-colors relative ${
                    casoSeleccionado === caso.caso_id 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  style={{ borderLeft: `3px solid ${caso.falta_color}` }}
                  onClick={() => setCasoSeleccionado(caso.caso_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-1.5 rounded-lg"
                        style={{ 
                          backgroundColor: `${caso.falta_color}20`,
                          border: `1px solid ${caso.falta_color}40`
                        }}
                      >
                        <AlertCircle 
                          className="h-3 w-3" 
                          style={{ color: caso.falta_color }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                          Caso #{caso.caso_id}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <div 
                            className="w-2 h-2 rounded-full border border-gray-300"
                            style={{ backgroundColor: caso.falta_color }}
                          />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {caso.falta_nombre}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatearFecha(caso.fecha_creacion)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">
                        {getProgresoTotal(caso)}%
                      </div>
                      <div className="text-xs text-gray-500">Progreso</div>
                    </div>
                  </div>
                </div>
              ))}
              </div>

              {/* Información detallada del caso seleccionado */}
              {casoSeleccionado && (
                <div className="lg:col-span-2 space-y-4">
                  {/* Información del caso */}
                  {(() => {
                    const caso = casos.find(c => c.caso_id === casoSeleccionado);
                    if (!caso) return null;
                    
                    return (
                      <div 
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 relative"
                        style={{ borderLeft: `4px solid ${caso.falta_color}` }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ 
                                backgroundColor: `${caso.falta_color}20`,
                                border: `2px solid ${caso.falta_color}40`
                              }}
                            >
                              <AlertCircle 
                                className="h-5 w-5" 
                                style={{ color: caso.falta_color }}
                              />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Caso #{caso.caso_id}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: caso.falta_color }}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {caso.falta_nombre}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Creado el {formatearFecha(caso.fecha_creacion)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {getProgresoTotal(caso)}%
                            </div>
                            <div className="text-sm text-gray-500">Progreso</div>
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
                    );
                  })()}

                  {/* Sección de comentarios */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Comentarios
                      </h3>
                    </div>

                  {/* Lista de comentarios */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {comentarios[casoSeleccionado]?.map((comentario) => (
                      <div key={comentario.comentario_id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {comentario.usuario_nombre || `Usuario ${comentario.usuario_id}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatearFecha(comentario.fecha_creacion)}
                            </span>
                          </div>
                          {puedeEditarComentario(comentario) && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditandoComentario(prev => ({
                                  ...prev,
                                  [comentario.comentario_id]: comentario.comentario
                                }))}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarComentario(comentario.comentario_id, casoSeleccionado)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {editandoComentario[comentario.comentario_id] !== undefined ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editandoComentario[comentario.comentario_id]}
                              onChange={(e) => setEditandoComentario(prev => ({
                                ...prev,
                                [comentario.comentario_id]: e.target.value
                              }))}
                              className="min-h-[60px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditarComentario(comentario.comentario_id, casoSeleccionado)}
                                className="h-7 px-3 text-xs"
                              >
                                Guardar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditandoComentario(prev => {
                                  const newState = { ...prev };
                                  delete newState[comentario.comentario_id];
                                  return newState;
                                })}
                                className="h-7 px-3 text-xs"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {comentario.comentario}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {(!comentarios[casoSeleccionado] || comentarios[casoSeleccionado].length === 0) && (
                      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                        No hay comentarios aún
                      </div>
                    )}
                  </div>

                  {/* Formulario para nuevo comentario */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Escribe un comentario..."
                        value={nuevoComentario[casoSeleccionado] || ""}
                        onChange={(e) => setNuevoComentario(prev => ({
                          ...prev,
                          [casoSeleccionado]: e.target.value
                        }))}
                        className="min-h-[80px] text-sm"
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleEnviarComentario(casoSeleccionado)}
                          disabled={!nuevoComentario[casoSeleccionado]?.trim()}
                          className="h-8 px-4 text-xs"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              )}
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

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteComentario}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
