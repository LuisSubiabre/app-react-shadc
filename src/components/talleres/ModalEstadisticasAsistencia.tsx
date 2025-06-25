import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { obtenerEstadisticasAsistencia } from "@/services/sesionesService";
import LoadingErrorHandler from "@/components/LoadingErrorHandler";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Download } from "lucide-react";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

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
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
    } catch (e) {
      setError("Error al cargar las estadísticas");
      console.error("Error:", e);
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

  const formatearFechaPDF = (fecha: string | null) => {
    if (!fecha) return "Sin sesiones";
    try {
      const fechaObj = new Date(fecha);
      return format(fechaObj, "dd-MM-yyyy");
    } catch (error) {
      return "Fecha inválida + " + error;
    }
  };

  const handleGenerarPDF = async () => {
    if (!estadisticas) return;

    setLoadingPdf(true);
    try {
      const doc = new jsPDF() as JsPDFWithAutoTable;

      // Título principal
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Estadísticas de Asistencia - Talleres ACLE", 14, 20);

      // Fecha de generación
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generado el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        14,
        30
      );

      // Línea horizontal
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 35, 196, 35);

      let startY = 45;
      let pageNumber = 1;

      // Resumen General
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumen General", 14, startY);
      startY += 8;

      // Tabla de resumen general
      const resumenData = [
        ["Total Talleres", estadisticas.total_talleres.toString()],
        ["Total Sesiones", estadisticas.total_sesiones.toString()],
        [
          "Asistencias Registradas",
          estadisticas.total_asistencias_registradas.toString(),
        ],
        ["Asistencias Efectivas", estadisticas.total_asistencias.toString()],
        [
          "Promedio General",
          `${estadisticas.promedio_asistencia_general.toFixed(1)}%`,
        ],
      ];

      autoTable(doc, {
        startY: startY,
        head: [["Métrica", "Valor"]],
        body: resumenData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: "bold" },
          1: { cellWidth: 60, halign: "center" },
        },
        didDrawPage: function (data) {
          doc.setFontSize(10);
          doc.text(
            `Página ${pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      startY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 15;

      // Estadísticas por Taller
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Estadísticas por Taller", 14, startY);
      startY += 8;

      // Generar tabla para cada taller
      estadisticas.talleres.forEach((taller, index) => {
        // Verificar si necesitamos nueva página
        if (startY > 250) {
          doc.addPage();
          startY = 20;
          pageNumber++;
        }

        // Título del taller
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Taller: ${taller.nombre_taller}`, 14, startY);
        startY += 6;

        // Estadísticas generales del taller
        const estadisticasGenerales = [
          ["Total Sesiones", taller.estadisticas_generales.total_sesiones],
          [
            "Asistencias Registradas",
            taller.estadisticas_generales.total_asistencias_registradas,
          ],
          [
            "Asistencias Efectivas",
            taller.estadisticas_generales.total_asistencias,
          ],
          [
            "Porcentaje Asistencia",
            taller.estadisticas_generales.porcentaje_asistencia
              ? `${parseFloat(
                  taller.estadisticas_generales.porcentaje_asistencia
                ).toFixed(1)}%`
              : "Sin datos",
          ],
          [
            "Primera Sesión",
            formatearFechaPDF(taller.estadisticas_generales.primera_sesion),
          ],
          [
            "Última Sesión",
            formatearFechaPDF(taller.estadisticas_generales.ultima_sesion),
          ],
        ];

        autoTable(doc, {
          startY: startY,
          head: [["Métrica", "Valor"]],
          body: estadisticasGenerales,
          theme: "grid",
          headStyles: { fillColor: [52, 73, 94] },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 70, fontStyle: "bold" },
            1: { cellWidth: 70 },
          },
        });

        startY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 5;

        // Estadísticas por mes si existen
        if (taller.estadisticas_por_mes.length > 0) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("Estadísticas por Mes:", 14, startY);
          startY += 5;

          const estadisticasPorMes = taller.estadisticas_por_mes.map((mes) => [
            `${obtenerNombreMes(mes.mes)} ${mes.anio}`,
            mes.total_sesiones.toString(),
            mes.total_asistencias_registradas.toString(),
            mes.total_asistencias.toString(),
            `${mes.porcentaje_asistencia.toFixed(1)}%`,
          ]);

          autoTable(doc, {
            startY: startY,
            head: [
              ["Período", "Sesiones", "Registradas", "Efectivas", "Porcentaje"],
            ],
            body: estadisticasPorMes,
            theme: "grid",
            headStyles: { fillColor: [155, 89, 182] },
            styles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 40 },
              1: { cellWidth: 25, halign: "center" },
              2: { cellWidth: 30, halign: "center" },
              3: { cellWidth: 25, halign: "center" },
              4: { cellWidth: 30, halign: "center" },
            },
          });

          startY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY + 10;
        } else {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.text("Sin sesiones registradas", 14, startY);
          startY += 8;
        }

        // Separador entre talleres
        if (index < estadisticas.talleres.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(14, startY, 196, startY);
          startY += 5;
        }
      });

      // Guardar el PDF
      doc.save(
        `estadisticas-asistencia-talleres-${format(
          new Date(),
          "dd-MM-yyyy"
        )}.pdf`
      );

      toast({
        title: "Éxito",
        description: "PDF generado correctamente",
      });
    } catch {
      console.error("Error al generar el PDF");
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el PDF",
        variant: "destructive",
      });
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Estadísticas de Asistencia - Talleres ACLE
          </DialogTitle>
          {estadisticas && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleGenerarPDF}
                disabled={loadingPdf}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                {loadingPdf ? "Generando PDF..." : "Exportar a PDF"}
              </Button>
            </div>
          )}
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
