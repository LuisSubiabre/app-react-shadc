"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, TrendingUp, Users, Clock, BarChart3, PieChart, Download } from "lucide-react";
import { getAtrasosRangoFecha } from "@/services/atrasosService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";

// Tipo para los atrasos del reporte
type AtrasoReporteType = {
  atraso_id: number;
  fecha: string;
  hora: string;
  tipo: string;
  justificado: boolean;
  observaciones: string;
  fecha_registro: string;
  estudiante_id: number;
  nombre_estudiante: string;
  nombre_curso: string;
};

// Tipo para estadísticas por mes
type EstadisticasMes = {
  mes: string;
  atrasos: number;
  llegadas: number;
  jornadas: number;
};

// Tipo para estadísticas por día
type EstadisticasDia = {
  fecha: string;
  atrasos: number;
  llegadas: number;
  jornadas: number;
};

// Tipo para estadísticas por curso
type EstadisticasCurso = {
  curso: string;
  atrasos: number;
  llegadas: number;
  jornadas: number;
};

// Tipo para estadísticas por hora
type EstadisticasHora = {
  hora: string;
  atrasos: number;
};

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

const AtrasosEstadisticas = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [atrasos, setAtrasos] = useState<AtrasoReporteType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalAtrasos: 0,
    totalLlegadas: 0,
    totalJornadas: 0,
    promedioDiario: 0,
    diaConMasAtrasos: { fecha: "", cantidad: 0 },
    cursoConMasAtrasos: { curso: "", cantidad: 0 },
    horaConMasAtrasos: { hora: "", cantidad: 0 },
    porcentajeJustificados: 0
  });

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Función para cargar datos
  const cargarDatos = async () => {
    if (!fechaInicio || !fechaFin) {
      return;
    }

    setIsLoading(true);
    try {
      const fechaInicioFormateada = new Date(fechaInicio).toISOString().split('T')[0];
      const fechaFinFormateada = new Date(fechaFin).toISOString().split('T')[0];

      const response = await getAtrasosRangoFecha(fechaInicioFormateada, fechaFinFormateada);
      const datosAtrasos = response && response.data ? response.data : response;
      
      if (datosAtrasos && datosAtrasos.length > 0) {
        setAtrasos(datosAtrasos);
        calcularEstadisticas(datosAtrasos);
      } else {
        setAtrasos([]);
        setEstadisticas({
          totalAtrasos: 0,
          totalLlegadas: 0,
          totalJornadas: 0,
          promedioDiario: 0,
          diaConMasAtrasos: { fecha: "", cantidad: 0 },
          cursoConMasAtrasos: { curso: "", cantidad: 0 },
          horaConMasAtrasos: { hora: "", cantidad: 0 },
          porcentajeJustificados: 0
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para calcular estadísticas
  const calcularEstadisticas = (datos: AtrasoReporteType[]) => {
    const totalAtrasos = datos.length;
    const totalLlegadas = datos.filter(a => a.tipo === 'llegada').length;
    const totalJornadas = datos.filter(a => a.tipo === 'jornada').length;
    const totalJustificados = datos.filter(a => a.justificado).length;

    // Calcular promedio diario
    const fechasUnicas = new Set(datos.map(a => a.fecha.split('T')[0]));
    const promedioDiario = fechasUnicas.size > 0 ? totalAtrasos / fechasUnicas.size : 0;

    // Día con más atrasos
    const atrasosPorDia = datos.reduce((acc, atraso) => {
      const fecha = atraso.fecha.split('T')[0];
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const diaConMasAtrasos = Object.entries(atrasosPorDia).reduce(
      (max, [fecha, cantidad]) => cantidad > max.cantidad ? { fecha, cantidad } : max,
      { fecha: "", cantidad: 0 }
    );

    // Curso con más atrasos
    const atrasosPorCurso = datos.reduce((acc, atraso) => {
      acc[atraso.nombre_curso] = (acc[atraso.nombre_curso] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const cursoConMasAtrasos = Object.entries(atrasosPorCurso).reduce(
      (max, [curso, cantidad]) => cantidad > max.cantidad ? { curso, cantidad } : max,
      { curso: "", cantidad: 0 }
    );

    // Hora con más atrasos
    const atrasosPorHora = datos.reduce((acc, atraso) => {
      const hora = atraso.hora.split(':')[0] + ':00';
      acc[hora] = (acc[hora] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const horaConMasAtrasos = Object.entries(atrasosPorHora).reduce(
      (max, [hora, cantidad]) => cantidad > max.cantidad ? { hora, cantidad } : max,
      { hora: "", cantidad: 0 }
    );

    // Porcentaje de justificados
    const porcentajeJustificados = totalAtrasos > 0 ? (totalJustificados / totalAtrasos) * 100 : 0;

    setEstadisticas({
      totalAtrasos,
      totalLlegadas,
      totalJornadas,
      promedioDiario: Math.round(promedioDiario * 100) / 100,
      diaConMasAtrasos,
      cursoConMasAtrasos,
      horaConMasAtrasos,
      porcentajeJustificados: Math.round(porcentajeJustificados * 100) / 100
    });
  };

  // Función para generar datos por mes
  const generarDatosPorMes = (): EstadisticasMes[] => {
    const datosPorMes: Record<string, { atrasos: number; llegadas: number; jornadas: number }> = {};

    atrasos.forEach(atraso => {
      const fecha = new Date(atraso.fecha);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      if (!datosPorMes[mes]) {
        datosPorMes[mes] = { atrasos: 0, llegadas: 0, jornadas: 0 };
      }

      datosPorMes[mes].atrasos++;
      if (atraso.tipo === 'llegada') {
        datosPorMes[mes].llegadas++;
      } else {
        datosPorMes[mes].jornadas++;
      }
    });

    return Object.entries(datosPorMes)
      .map(([mes, datos]) => ({
        mes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        ...datos
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  };

  // Función para generar datos por día
  const generarDatosPorDia = (): EstadisticasDia[] => {
    const datosPorDia: Record<string, { atrasos: number; llegadas: number; jornadas: number }> = {};

    atrasos.forEach(atraso => {
      const fecha = atraso.fecha.split('T')[0];
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });

      if (!datosPorDia[fecha]) {
        datosPorDia[fecha] = { atrasos: 0, llegadas: 0, jornadas: 0 };
      }

      datosPorDia[fecha].atrasos++;
      if (atraso.tipo === 'llegada') {
        datosPorDia[fecha].llegadas++;
      } else {
        datosPorDia[fecha].jornadas++;
      }
    });

    return Object.entries(datosPorDia)
      .map(([fecha, datos]) => ({
        fecha: new Date(fecha).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        ...datos
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  };

  // Función para generar datos por curso
  const generarDatosPorCurso = (): EstadisticasCurso[] => {
    const datosPorCurso: Record<string, { atrasos: number; llegadas: number; jornadas: number }> = {};

    atrasos.forEach(atraso => {
      if (!datosPorCurso[atraso.nombre_curso]) {
        datosPorCurso[atraso.nombre_curso] = { atrasos: 0, llegadas: 0, jornadas: 0 };
      }

      datosPorCurso[atraso.nombre_curso].atrasos++;
      if (atraso.tipo === 'llegada') {
        datosPorCurso[atraso.nombre_curso].llegadas++;
      } else {
        datosPorCurso[atraso.nombre_curso].jornadas++;
      }
    });

    return Object.entries(datosPorCurso)
      .map(([curso, datos]) => ({ curso, ...datos }))
      .sort((a, b) => b.atrasos - a.atrasos);
  };

  // Función para generar datos por hora
  const generarDatosPorHora = (): EstadisticasHora[] => {
    const datosPorHora: Record<string, number> = {};

    atrasos.forEach(atraso => {
      const hora = atraso.hora.split(':')[0] + ':00';
      datosPorHora[hora] = (datosPorHora[hora] || 0) + 1;
    });

    return Object.entries(datosPorHora)
      .map(([hora, atrasos]) => ({ hora, atrasos }))
      .sort((a, b) => a.hora.localeCompare(b.hora));
  };

  // Función para exportar estadísticas a PDF
  const exportarEstadisticas = () => {
    if (atrasos.length === 0) {
      return;
    }

    const doc = new jsPDF() as JsPDFWithAutoTable;

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Estadísticas de Atrasos", 14, 15);
    doc.setFontSize(12);

    // Información del período
    const fechaInicioFormatted = new Date(fechaInicio).toLocaleDateString('es-ES');
    const fechaFinFormatted = new Date(fechaFin).toLocaleDateString('es-ES');
    
    doc.text(`Período: ${fechaInicioFormatted} - ${fechaFinFormatted}`, 14, 25);
    doc.text(`Total de atrasos: ${estadisticas.totalAtrasos}`, 14, 32);
    doc.text(`Atrasos por llegada: ${estadisticas.totalLlegadas}`, 14, 39);
    doc.text(`Atrasos por jornada: ${estadisticas.totalJornadas}`, 14, 46);
    doc.text(`Promedio diario: ${estadisticas.promedioDiario}`, 14, 53);
    doc.text(`Porcentaje justificados: ${estadisticas.porcentajeJustificados}%`, 14, 60);

    // Estadísticas destacadas
    doc.setFontSize(14);
    doc.text("Estadísticas Destacadas", 14, 75);
    doc.setFontSize(12);
    
    doc.text(`Día con más atrasos: ${estadisticas.diaConMasAtrasos.fecha ? 
      new Date(estadisticas.diaConMasAtrasos.fecha).toLocaleDateString('es-ES') : 'Sin datos'} (${estadisticas.diaConMasAtrasos.cantidad} atrasos)`, 14, 85);
    doc.text(`Curso con más atrasos: ${estadisticas.cursoConMasAtrasos.curso || 'Sin datos'} (${estadisticas.cursoConMasAtrasos.cantidad} atrasos)`, 14, 92);
    doc.text(`Hora con más atrasos: ${estadisticas.horaConMasAtrasos.hora || 'Sin datos'} (${estadisticas.horaConMasAtrasos.cantidad} atrasos)`, 14, 99);

    // Tabla de estadísticas por mes
    if (datosPorMes.length > 0) {
      doc.setFontSize(14);
      doc.text("Estadísticas por Mes", 14, 115);
      doc.setFontSize(12);
      
      const datosTablaMes = datosPorMes.map(dato => [
        dato.mes,
        dato.atrasos.toString(),
        dato.llegadas.toString(),
        dato.jornadas.toString()
      ]);

      autoTable(doc, {
        startY: 120,
        head: [["Mes", "Total Atrasos", "Llegadas", "Jornadas"]],
        body: datosTablaMes,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
      });
    }

    // Tabla de estadísticas por curso
    if (datosPorCurso.length > 0) {
      const lastY = (doc as JsPDFWithAutoTable & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 120;
      
      doc.setFontSize(14);
      doc.text("Estadísticas por Curso", 14, lastY + 20);
      doc.setFontSize(12);
      
      const datosTablaCurso = datosPorCurso.map(dato => [
        dato.curso,
        dato.atrasos.toString(),
        dato.llegadas.toString(),
        dato.jornadas.toString()
      ]);

      autoTable(doc, {
        startY: lastY + 25,
        head: [["Curso", "Total Atrasos", "Llegadas", "Jornadas"]],
        body: datosTablaCurso,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
      });
    }

    // Guardar el PDF
    doc.save(`estadisticas-atrasos-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      cargarDatos();
    }
  }, [fechaInicio, fechaFin]);

  const datosPorMes = generarDatosPorMes();
  const datosPorDia = generarDatosPorDia();
  const datosPorCurso = generarDatosPorCurso();
  const datosPorHora = generarDatosPorHora();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Estadísticas
          </CardTitle>
          <CardDescription>
            Selecciona el rango de fechas para generar las estadísticas de atrasos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Inicio
              </label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Fecha Fin
              </label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Button 
                onClick={cargarDatos}
                disabled={isLoading || !fechaInicio || !fechaFin}
                className="w-full"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Generar Estadísticas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Atrasos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalAtrasos}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.totalLlegadas} llegadas, {estadisticas.totalJornadas} jornadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.promedioDiario}</div>
            <p className="text-xs text-muted-foreground">
              atrasos por día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Día con Más Atrasos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.diaConMasAtrasos.cantidad}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.diaConMasAtrasos.fecha ? 
                new Date(estadisticas.diaConMasAtrasos.fecha).toLocaleDateString('es-ES') : 
                'Sin datos'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curso con Más Atrasos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.cursoConMasAtrasos.cantidad}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.cursoConMasAtrasos.curso || 'Sin datos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      {atrasos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hora con Más Atrasos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.horaConMasAtrasos.cantidad}</div>
              <p className="text-xs text-muted-foreground">
                {estadisticas.horaConMasAtrasos.hora || 'Sin datos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasos Justificados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.porcentajeJustificados}%</div>
              <p className="text-xs text-muted-foreground">
                del total de atrasos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Días con Atrasos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(atrasos.map(a => a.fecha.split('T')[0])).size}
              </div>
              <p className="text-xs text-muted-foreground">
                días únicos con atrasos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {atrasos.length > 0 && (
        <>
          {/* Gráfico de atrasos por mes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Atrasos por Mes
              </CardTitle>
              <CardDescription>
                Distribución de atrasos por tipo durante el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="llegadas" fill="#8884d8" name="Llegadas" />
                  <Bar dataKey="jornadas" fill="#82ca9d" name="Jornadas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de atrasos por día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Atrasos por Día
              </CardTitle>
              <CardDescription>
                Evolución diaria de atrasos durante el período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={datosPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="atrasos" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total Atrasos" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de atrasos por curso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Atrasos por Curso
              </CardTitle>
              <CardDescription>
                Distribución de atrasos por curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={datosPorCurso}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ curso, atrasos }) => `${curso}: ${atrasos}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="atrasos"
                  >
                    {datosPorCurso.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de atrasos por hora */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atrasos por Hora
              </CardTitle>
              <CardDescription>
                Distribución de atrasos por hora del día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datosPorHora}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="atrasos" stroke="#8884d8" strokeWidth={2} name="Atrasos" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Botón de exportación */}
      {atrasos.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={exportarEstadisticas} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar Estadísticas a PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AtrasosEstadisticas;
