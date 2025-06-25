import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { obtenerEstadisticasAsistencia } from "@/services/sesionesService";
import LoadingErrorHandler from "@/components/LoadingErrorHandler";

interface EstadisticasGenerales {
  total_sesiones: string;
  total_asistencias_registradas: string;
  total_asistencias: string;
  porcentaje_asistencia: string | null;
  primera_sesion: string | null;
  ultima_sesion: string | null;
}

interface EstadisticasPorMes {
  mes: number;
  anio: number;
  total_sesiones: number;
  total_asistencias_registradas: number;
  total_asistencias: number;
  porcentaje_asistencia: number;
}

interface TallerEstadisticas {
  taller_id: number;
  nombre_taller: string;
  estadisticas_generales: EstadisticasGenerales;
  estadisticas_por_mes: EstadisticasPorMes[];
}

interface EstadisticasResponse {
  total_talleres: number;
  total_sesiones: number;
  total_asistencias_registradas: number;
  total_asistencias: number;
  promedio_asistencia_general: number;
  talleres: TallerEstadisticas[];
}

interface ModalEstadisticasAsistenciaProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalEstadisticasAsistencia: React.FC<
  ModalEstadisticasAsistenciaProps
> = ({ isOpen, onClose }) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarEstadisticas();
    }
  }, [isOpen]);

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerEstadisticasAsistencia();
      setEstadisticas(response);
    } catch (error) {
      setError("Error al cargar las estadísticas");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin sesiones";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const obtenerColorPorcentaje = (porcentaje: number | null) => {
    if (porcentaje === null) return "bg-gray-100 text-gray-600";
    if (porcentaje >= 90) return "bg-green-100 text-green-800";
    if (porcentaje >= 80) return "bg-blue-100 text-blue-800";
    if (porcentaje >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const obtenerNombreMes = (mes: number) => {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return meses[mes - 1];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Estadísticas de Asistencia - Talleres ACLE
          </DialogTitle>
        </DialogHeader>

        <LoadingErrorHandler loading={loading} error={error}>
          {estadisticas && (
            <div className="space-y-6">
              {/* Resumen General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Resumen General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {estadisticas.total_talleres}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Talleres
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {estadisticas.total_sesiones}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Sesiones
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {estadisticas.total_asistencias_registradas}
                      </div>
                      <div className="text-sm text-gray-600">
                        Asistencias Registradas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {estadisticas.total_asistencias}
                      </div>
                      <div className="text-sm text-gray-600">
                        Asistencias Efectivas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {estadisticas.promedio_asistencia_general.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Promedio General
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas por Taller */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Estadísticas por Taller
                </h3>
                {estadisticas.talleres.map((taller) => (
                  <Card key={taller.taller_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {taller.nombre_taller}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Estadísticas Generales */}
                        <div>
                          <h4 className="font-semibold mb-3">
                            Estadísticas Generales
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Sesiones:</span>
                              <span className="font-medium">
                                {taller.estadisticas_generales.total_sesiones}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Asistencias Registradas:</span>
                              <span className="font-medium">
                                {
                                  taller.estadisticas_generales
                                    .total_asistencias_registradas
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Asistencias Efectivas:</span>
                              <span className="font-medium">
                                {
                                  taller.estadisticas_generales
                                    .total_asistencias
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Porcentaje Asistencia:</span>
                              <Badge
                                className={obtenerColorPorcentaje(
                                  taller.estadisticas_generales
                                    .porcentaje_asistencia
                                    ? parseFloat(
                                        taller.estadisticas_generales
                                          .porcentaje_asistencia
                                      )
                                    : null
                                )}
                              >
                                {taller.estadisticas_generales
                                  .porcentaje_asistencia
                                  ? `${parseFloat(
                                      taller.estadisticas_generales
                                        .porcentaje_asistencia
                                    ).toFixed(1)}%`
                                  : "Sin datos"}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Primera Sesión:</span>
                              <span className="font-medium">
                                {formatearFecha(
                                  taller.estadisticas_generales.primera_sesion
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Última Sesión:</span>
                              <span className="font-medium">
                                {formatearFecha(
                                  taller.estadisticas_generales.ultima_sesion
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Estadísticas por Mes */}
                        <div>
                          <h4 className="font-semibold mb-3">
                            Estadísticas por Mes
                          </h4>
                          {taller.estadisticas_por_mes.length > 0 ? (
                            <div className="space-y-3">
                              {taller.estadisticas_por_mes.map((mes, index) => (
                                <div
                                  key={index}
                                  className="border rounded-lg p-3"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">
                                      {obtenerNombreMes(mes.mes)} {mes.anio}
                                    </span>
                                    <Badge
                                      className={obtenerColorPorcentaje(
                                        mes.porcentaje_asistencia
                                      )}
                                    >
                                      {mes.porcentaje_asistencia.toFixed(1)}%
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-600">
                                        Sesiones:
                                      </span>
                                      <div className="font-medium">
                                        {mes.total_sesiones}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Registradas:
                                      </span>
                                      <div className="font-medium">
                                        {mes.total_asistencias_registradas}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Efectivas:
                                      </span>
                                      <div className="font-medium">
                                        {mes.total_asistencias}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 italic">
                              Sin sesiones registradas
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </LoadingErrorHandler>
      </DialogContent>
    </Dialog>
  );
};

export default ModalEstadisticasAsistencia;
