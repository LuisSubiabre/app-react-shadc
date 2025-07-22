"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CasoConvivenciaType } from "@/types";
import { getAllCasos } from "@/services/convivenciaService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Calendar, User, BookOpen, ExternalLink, FileText, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ModalTodosCasosProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalTodosCasos = ({ isOpen, onClose }: ModalTodosCasosProps) => {
  const [casos, setCasos] = useState<CasoConvivenciaType[]>([]);
  const [filteredCasos, setFilteredCasos] = useState<CasoConvivenciaType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCaso, setExpandedCaso] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (isOpen) {
      fetchCasos();
    }
  }, [isOpen]);

  useEffect(() => {
    filterCasos();
  }, [casos, searchTerm, statusFilter]);

  const fetchCasos = async () => {
    setIsLoading(true);
    try {
      const response = await getAllCasos();
      const casosData = Array.isArray(response) ? response : response.data || [];
      setCasos(casosData);
    } catch (error) {
      console.error("Error al obtener todos los casos:", error);
      toast({
        title: "Error",
        description: "Error al cargar los casos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCasos = () => {
    let filtered = casos;

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((caso) => {
        const progreso = getProgresoTotal(caso);
        switch (statusFilter) {
          case "completed":
            return progreso === 100;
          case "in-progress":
            return progreso >= 50 && progreso < 100;
          case "started":
            return progreso < 50;
          default:
            return true;
        }
      });
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter((caso) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          caso.estudiante_nombre.toLowerCase().includes(searchLower) ||
          caso.curso_nombre.toLowerCase().includes(searchLower) ||
          (caso.observaciones && caso.observaciones.toLowerCase().includes(searchLower)) ||
          caso.caso_id.toString().includes(searchLower)
        );
      });
    }

    setFilteredCasos(filtered);
  };

  const formatearFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const getProgresoTotal = (caso: CasoConvivenciaType) => {
    const pasosCompletados = [caso.paso1, caso.paso2, caso.paso3, caso.paso4].filter(Boolean).length;
    return Math.round((pasosCompletados / 4) * 100);
  };

  const getEstadoPaso = (completado: boolean, fecha: string | null) => {
    if (completado && fecha) {
      return (
        <div className="flex items-center gap-1 text-xs">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-green-600 font-medium">Completado</span>
        </div>
      );
    } else if (completado) {
      return (
        <div className="flex items-center gap-1 text-xs">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-green-600 font-medium">Completado</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3 text-gray-400" />
          <span className="text-gray-500">Pendiente</span>
        </div>
      );
    }
  };

  const getEstadoGeneral = (caso: CasoConvivenciaType) => {
    const progreso = getProgresoTotal(caso);
    if (progreso === 100) {
      return { texto: "Completado", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
    } else if (progreso >= 50) {
      return { texto: "En Progreso", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" };
    } else {
      return { texto: "Iniciado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Todos los Casos de Convivencia
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredCasos.length} casos encontrados
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por estudiante, curso, observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="in-progress">En progreso</SelectItem>
                <SelectItem value="started">Iniciados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total casos</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{casos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {casos.filter(c => getProgresoTotal(c) === 100).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">En progreso</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {casos.filter(c => getProgresoTotal(c) >= 50 && getProgresoTotal(c) < 100).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estudiantes únicos</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {new Set(casos.map(c => c.estudiante_id)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de casos */}
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando casos...</p>
              </div>
            </div>
          ) : filteredCasos.length > 0 ? (
            <div className="space-y-3">
              {filteredCasos.map((caso) => (
                <Card key={caso.caso_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Información principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {caso.caso_id}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {caso.estudiante_nombre}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {caso.curso_nombre}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatearFecha(caso.fecha_creacion)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progreso compacto */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${caso.paso1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Inicio</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${caso.paso2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Inv.</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${caso.paso3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Cierre</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${caso.paso4 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Seg.</span>
                            </div>
                          </div>
                        </div>

                        {/* Información adicional compacta */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {caso.url && (
                            <span className="flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              <span className="truncate max-w-32">Documento</span>
                            </span>
                          )}
                          {caso.observaciones && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span className="truncate max-w-32">Observaciones</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Estado y progreso */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Badge className={getEstadoGeneral(caso).color}>
                          {getEstadoGeneral(caso).texto}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {getProgresoTotal(caso)}%
                          </div>
                          <div className="text-xs text-gray-500">Progreso</div>
                        </div>
                      </div>

                      {/* Botón expandir/contraer */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCaso(expandedCaso === caso.caso_id ? null : caso.caso_id)}
                        className="ml-2 p-1 h-8 w-8"
                      >
                        {expandedCaso === caso.caso_id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Detalles expandidos */}
                    {expandedCaso === caso.caso_id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Progreso detallado */}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                              Progreso del Protocolo
                            </h4>
                            <div className="space-y-2">
                              {[
                                { paso: caso.paso1, fecha: caso.fecha_paso1, nombre: "Inicio", numero: 1 },
                                { paso: caso.paso2, fecha: caso.fecha_paso2, nombre: "Investigación", numero: 2 },
                                { paso: caso.paso3, fecha: caso.fecha_paso3, nombre: "Cierre", numero: 3 },
                                { paso: caso.paso4, fecha: caso.fecha_paso4, nombre: "Seguimiento", numero: 4 }
                              ].map(({ paso, fecha, nombre, numero }) => (
                                <div key={numero} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${paso ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Paso {numero}: {nombre}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {paso ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-gray-400" />
                                    )}
                                    {fecha && (
                                      <span className="text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                        {formatearFecha(fecha)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Información adicional */}
                          <div className="space-y-3">
                            {caso.url && (
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                                  <ExternalLink className="h-4 w-4" />
                                  URL del Documento
                                </h4>
                                <a
                                  href={caso.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm break-all"
                                >
                                  {caso.url}
                                </a>
                              </div>
                            )}

                            {caso.observaciones && (
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                                  <FileText className="h-4 w-4" />
                                  Observaciones
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border">
                                  {caso.observaciones}
                                </p>
                              </div>
                            )}

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <p>Última actualización: {formatearFecha(caso.fecha_actualizacion)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {searchTerm ? "No se encontraron casos" : "No hay casos disponibles"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "Los casos aparecerán aquí cuando se creen"}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 