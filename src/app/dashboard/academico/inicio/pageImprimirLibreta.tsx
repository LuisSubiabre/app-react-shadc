import React, { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts";
import { AlertCircle, Users, FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { Curso } from "./types";
import { User } from "@/app/dashboard/toor/usuarios/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CursoApiResponseType } from "@/types";
import { getFuncionarios } from "@/services/funcionariosService";
import { Estudiante } from "@/app/dashboard/toor/estudiantes/types.ts";
import { API_BASE_URL } from "@/config/config";
import { getLibretaEstudiante } from "@/services/academicoService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import configPromedios from "@/config/configPromedios";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface AsignaturaLibreta {
  asignatura_id: number;
  nombre: string;
  descripcion: string;
  indice: number;
  concepto: boolean;
  codigo_sige: number;
  nivel_educativo: number;
  es_comun: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_asignacion: string;
  calificacion1: number | null;
  calificacion2: number | null;
  calificacion3: number | null;
  calificacion4: number | null;
  calificacion5: number | null;
  calificacion6: number | null;
  calificacion7: number | null;
  calificacion8: number | null;
  calificacion9: number | null;
  calificacion10: number | null;
  calificacion11: number | null;
  calificacion12: number | null;
  calificacion13: number | null;
  calificacion14: number | null;
  calificacion15: number | null;
  calificacion16: number | null;
  calificacion17: number | null;
  calificacion18: number | null;
  calificacion19: number | null;
  calificacion20: number | null;
  calificacion21: number | null;
  calificacion22: number | null;
  calificacion23: number | null;
  nombre_estudiante: string;
  nombre_curso: string;
  nombre_profesor_jefe: string;
}

interface TableDataItem {
  nombre: string;
  calificaciones: string[];
  pf: number;
  pfs1: number;
  pfs2: number;
  esConcepto: boolean;
}

const AcademicoImprimirLibreta: React.FC = () => {
  const { error, loading, funcionarioCursos, setFuncionarioCursos } =
    useCursosFuncionarios();

  const [isModalEstudiantesOpen, setIsModalEstudiantesOpen] =
    useState<boolean>(false);
  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null);
  const [dataUsuarios, setDataUsuarios] = useState<User[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [dataEstudiantes, setDataEstudiantes] = useState<Estudiante[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true);
        const response = await getFuncionarios();
        setDataUsuarios(response.data);
      } catch (err) {
        setErrorUsuarios(
          err instanceof Error ? err.message : "Error al cargar usuarios"
        );
        console.error("Error al cargar usuarios:", err);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (funcionarioCursos && dataUsuarios.length > 0) {
      const cursosActualizados = funcionarioCursos.map((curso) => ({
        ...curso,
        jefatura:
          dataUsuarios.find((user) => user.id === curso.profesor_jefe_id)
            ?.nombre || "S/N",
      }));
      setFuncionarioCursos(cursosActualizados);
    }
  }, [funcionarioCursos, dataUsuarios]);

  const handleEstudiantesClick = async (curso: Curso) => {
    setIsModalEstudiantesOpen(true);
    setCurrentCurso(curso);
    setLoadingEstudiantes(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/cursos/estudiantes/${curso.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar estudiantes");
      }

      const data = await response.json();
      const estudiantes = Array.isArray(data)
        ? data.map((estudiante) => ({
            ...estudiante,
            id: estudiante.estudiante_id,
          }))
        : [];
      setDataEstudiantes(estudiantes);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const generarPDFEstudiante = async (estudiante: Estudiante, doc: JsPDFWithAutoTable, fecha: string) => {
    const response = await getLibretaEstudiante(estudiante.id);
    const libreta: AsignaturaLibreta[] = response.data;

    if (!libreta || libreta.length === 0) {
      throw new Error("No hay datos de calificaciones para este estudiante");
    }

    // Agregar logo
    const logoUrl = "https://res.cloudinary.com/dx219dazh/image/upload/v1744723831/varios/urcbzygzvfvzupglmwqy.png";
    const logoWidth = 50;
    const logoHeight = 15;
    doc.addImage(logoUrl, "PNG", 20, 10, logoWidth, logoHeight);

    // Establecer fuente y colores
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);

    // Nombre de la institución
    doc.setFontSize(12);
    doc.text("Liceo Experimental UMAG", 80, 20);

    // Título principal
    doc.setFontSize(16);
    doc.text("Libreta de Calificaciones", 105, 30, { align: "center" });

    // Línea decorativa superior
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Información del estudiante
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const infoY = 45;
    doc.text(`Estudiante: ${libreta[0].nombre_estudiante}`, 20, infoY + 7);
    doc.text(`Curso: ${libreta[0].nombre_curso}`, 20, infoY + 14);
    doc.text(`Profesor Jefe: ${libreta[0].nombre_profesor_jefe}`, 20, infoY + 21);

    // Preparar datos para la tabla y el gráfico
    const tableData: TableDataItem[] = libreta.map((asignatura: AsignaturaLibreta) => {
      const calificacionesPrimerSemestre = [];
      const calificacionesSegundoSemestre = [];

      // Primer semestre (C1-C10)
      for (let i = 1; i <= 10; i++) {
        const calificacion = asignatura[`calificacion${i}` as keyof AsignaturaLibreta];
        if (asignatura.concepto) {
          if (calificacion !== null && calificacion !== undefined) {
            const calificacionStr = calificacion.toString();
            const concepto = getConceptoFromNota(calificacionStr);
            calificacionesPrimerSemestre.push(getValorConcepto(concepto));
          } else {
            calificacionesPrimerSemestre.push("-");
          }
        } else {
          calificacionesPrimerSemestre.push(
            calificacion !== null ? calificacion.toString() : "-"
          );
        }
      }

      // Segundo semestre (C11-C20)
      for (let i = 11; i <= 20; i++) {
        const calificacion = asignatura[`calificacion${i}` as keyof AsignaturaLibreta];
        if (asignatura.concepto) {
          if (calificacion !== null && calificacion !== undefined) {
            const calificacionStr = calificacion.toString();
            const concepto = getConceptoFromNota(calificacionStr);
            calificacionesSegundoSemestre.push(getValorConcepto(concepto));
          } else {
            calificacionesSegundoSemestre.push("-");
          }
        } else {
          calificacionesSegundoSemestre.push(
            calificacion !== null ? calificacion.toString() : "-"
          );
        }
      }

      // Calcular PFS (Promedio Final Semestral)
      const pfs1 = calcularPromedio(calificacionesPrimerSemestre, asignatura.concepto);
      const pfs2 = calcularPromedio(calificacionesSegundoSemestre, asignatura.concepto);

      // Calcular PF (Promedio Final Anual)
      const pf = pfs2 === "-" ? pfs1 : calcularPromedioAnual(pfs1, pfs2, asignatura.concepto);

      return {
        nombre: asignatura.nombre,
        calificaciones: [
          asignatura.nombre,
          ...calificacionesPrimerSemestre,
          pfs1,
          ...calificacionesSegundoSemestre,
          pfs2,
          pf
        ],
        pf: pf === "-" ? 0 : parseFloat(pf),
        pfs1: pfs1 === "-" ? 0 : parseFloat(pfs1),
        pfs2: pfs2 === "-" ? 0 : parseFloat(pfs2),
        esConcepto: asignatura.concepto
      };
    });

    // Calcular promedio final del primer semestre (ignorando asignaturas conceptuales)
    const asignaturas1S = tableData.filter(item => !item.esConcepto && item.pfs1 > 0);
    const promedioFinal1S = asignaturas1S.length > 0 
      ? asignaturas1S.reduce((acc, item) => acc + item.pfs1, 0) / asignaturas1S.length 
      : null;

    // Calcular promedio final del segundo semestre (ignorando asignaturas conceptuales)
    const asignaturas2S = tableData.filter(item => !item.esConcepto && item.pfs2 > 0);
    const promedioFinal2S = asignaturas2S.length > 0 
      ? asignaturas2S.reduce((acc, item) => acc + item.pfs2, 0) / asignaturas2S.length 
      : null;

    // Encabezados de la tabla
    const headers = [
      "Asignatura",
      ...Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
      "1S",
      ...Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
      "2S",
      "PF"
    ];

    // Crear tabla
    autoTable(doc, {
      startY: 75,
      head: [headers],
      body: tableData.map((data) => data.calificaciones),
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 8,
        cellPadding: 1,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        minCellHeight: 5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 1,
        lineColor: [200, 200, 200],
        halign: "center",
        minCellHeight: 5,
      },
      columnStyles: {
        0: {
          cellWidth: 30,
          fontStyle: "bold",
          halign: "left",
        },
        ...Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [
            i + 1,
            {
              cellWidth: 7,
              halign: "center",
            },
          ])
        ),
        11: {
          cellWidth: 8,
          halign: "center",
          fontStyle: "bold",
        },
        ...Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [
            i + 12,
            {
              cellWidth: 7,
              halign: "center",
            },
          ])
        ),
        22: {
          cellWidth: 8,
          halign: "center",
          fontStyle: "bold",
        },
        23: {
          cellWidth: 8,
          halign: "center",
          fontStyle: "bold",
        }
      },
      margin: { left: 5, right: 5 },
      tableWidth: 198,
      didDrawPage: function () {
        doc.setFillColor(41, 128, 185);
        doc.rect(35, 70, 77, 5, "F");
        doc.rect(112, 70, 77, 5, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text("1er Semestre", 73.5, 73, { align: "center" });
        doc.text("2do Semestre", 150.5, 73, { align: "center" });

        doc.setTextColor(0, 0, 0);
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      }
    });

    // Obtener la posición final de la tabla
    const finalY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY || 75 + (tableData.length * 5) + 20;

    // Agregar sección de promedios finales
    const promediosY = finalY + 5;
    
    // Fondo para la sección de promedios
    doc.setFillColor(245, 245, 245);
    doc.rect(15, promediosY - 2, 180, 15, "F");
    
    // Borde de la sección
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(15, promediosY - 2, 180, 15);
    
    // Promedios en una sola línea
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    
    const promedio1S = promedioFinal1S !== null ? Math.round(promedioFinal1S) : "-";
    const promedio2S = promedioFinal2S !== null ? Math.round(promedioFinal2S) : "-";
    
    doc.text(`Promedio Final 1° Semestre: ${promedio1S}`, 20, promediosY + 3);
    doc.text(`Promedio Final 2° Semestre: ${promedio2S}`, 20, promediosY + 7);

    // Agregar gráfico después de la tabla
    const chartY = promediosY + 25;
    const chartWidth = 130;
    const chartHeight = 50;
    const pageWidth = 210;
    const chartX = (pageWidth - chartWidth) / 2;

    // Dibujar el gráfico
    doc.setFontSize(7);
    doc.text("Gráfico de Rendimiento Promedios Finales por Asignatura", pageWidth/2, chartY - 5, { align: "center" });

    // Crear un canvas para el gráfico con mayor resolución
    const scaleFactor = 4;
    const canvas = document.createElement('canvas');
    canvas.width = chartWidth * scaleFactor;
    canvas.height = chartHeight * scaleFactor;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Escalar el contexto para mejorar la calidad
      ctx.scale(scaleFactor, scaleFactor);

      // Dibujar el fondo con borde
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      ctx.fillRect(0, 0, chartWidth, chartHeight);
      ctx.strokeRect(0, 0, chartWidth, chartHeight);

      // Configuración del gráfico
      const maxValue = 70;
      const scale = (chartHeight - 20) / maxValue;
      const spacing = (chartWidth - 30) / (tableData.length - 1);
      const startX = 15;

      // Dibujar línea de referencia
      ctx.beginPath();
      ctx.strokeStyle = '#f0f0f0';
      ctx.setLineDash([1, 1]);
      ctx.moveTo(15, chartHeight - 10);
      ctx.lineTo(chartWidth - 15, chartHeight - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dibujar línea horizontal para el valor máximo
      ctx.beginPath();
      ctx.strokeStyle = '#f0f0f0';
      ctx.setLineDash([1, 1]);
      ctx.moveTo(15, 10);
      ctx.lineTo(chartWidth - 15, 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#666666';
      ctx.font = '3px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('', 5, 13);

      // Dibujar el área para el primer semestre
      ctx.beginPath();
      ctx.fillStyle = 'rgba(41, 121, 255, 0.1)';
      ctx.moveTo(startX, chartHeight - 10);

      let lastValidY: number | null = null;
      tableData.forEach((data, index) => {
        const x = startX + (index * spacing);
        if (data.pf > 0) {
          const y = chartHeight - 10 - (data.pf * scale);
          ctx.lineTo(x, y);
          lastValidY = y;
        } else {
          if (lastValidY !== null) {
            ctx.lineTo(x, lastValidY);
          }
        }
      });

      ctx.lineTo(chartWidth - 15, chartHeight - 10);
      ctx.closePath();
      ctx.fill();

      // Dibujar la línea del primer semestre
      ctx.beginPath();
      ctx.strokeStyle = '#2979ff';
      ctx.lineWidth = 1.5;

      lastValidY = null;
      tableData.forEach((data, index) => {
        const x = startX + (index * spacing);
        if (data.pf > 0) {
          const y = chartHeight - 10 - (data.pf * scale);
          if (lastValidY === null) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          lastValidY = y;
        } else {
          ctx.stroke();
          ctx.beginPath();
          lastValidY = null;
        }
      });

      ctx.stroke();

      // Dibujar los puntos y textos
      tableData.forEach((data, index) => {
        const x = startX + (index * spacing);
        const y1s = data.pf > 0 ? chartHeight - 10 - (data.pf * scale) : null;

        // Dibujar puntos
        if (y1s !== null) {
          ctx.beginPath();
          ctx.fillStyle = '#2979ff';
          ctx.arc(x, y1s, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dibujar solo el valor del promedio final (PF) como encabezado
        if (y1s !== null) {
          ctx.fillStyle = '#2979ff';
          ctx.font = '3px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(data.pf.toString(), x, 5);
        }

        // Nombres de asignaturas en la parte inferior
        ctx.save();
        ctx.translate(x, chartHeight - 5);
        ctx.rotate(-Math.PI/2);
        ctx.font = '2.5px Arial';
        ctx.textAlign = 'left';
        const nombreCorto = data.nombre.length > 10 ? data.nombre.substring(0, 8) + '...' : data.nombre;
        ctx.fillText(nombreCorto, 0, 0);
        ctx.restore();
      });

      // Agregar el gráfico al PDF con alta calidad
      doc.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', chartX, chartY, chartWidth, chartHeight);

      // Espacio para firmas y timbres
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);

      // Línea izquierda (Profesor Jefe)
      doc.line(20, 250, 100, 250);
      doc.setFontSize(8);
      const nombreProfesor = libreta[0].nombre_profesor_jefe;
      const anchoProfesor = doc.getTextWidth(nombreProfesor);
      const xProfesor = 20 + (80 - anchoProfesor) / 2;
      doc.text(nombreProfesor, xProfesor, 255);
      
      doc.setFontSize(7);
      const textoProfesor = "PROFESOR JEFE";
      const anchoTextoProfesor = doc.getTextWidth(textoProfesor);
      const xTextoProfesor = 20 + (80 - anchoTextoProfesor) / 2;
      doc.text(textoProfesor, xTextoProfesor, 260);

      // Línea derecha (Director)
      doc.line(110, 250, 190, 250);
      
      // Agregar imagen de firma
      const firmaUrl = "https://res.cloudinary.com/dx219dazh/image/upload/v1745947577/varios/wnt3zcbohrtgnnkpefi4.png";
      const firmaWidth = 65;
      const firmaHeight = 20;
      doc.addImage(firmaUrl, "PNG", 120, 225, firmaWidth, firmaHeight);
      
      doc.setFontSize(8);
      const nombreDirector = "BRAVO JORQUERA PATRICIO BRAVO";
      const anchoDirector = doc.getTextWidth(nombreDirector);
      const xDirector = 110 + (80 - anchoDirector) / 2;
      doc.text(nombreDirector, xDirector, 265);
      
      doc.setFontSize(7);
      const textoDirector = "DIRECTOR";
      const anchoTextoDirector = doc.getTextWidth(textoDirector);
      const xTextoDirector = 110 + (80 - anchoTextoDirector) / 2;
      doc.text(textoDirector, xTextoDirector, 270);

      // Pie de página con leyendas
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text("1S | 2S: Promedio Final Semestral", 20, 270);
      doc.text("PF: Promedio Final Anual", 20, 275);
      doc.text(`Impreso el: ${fecha}`, 20, 280);
    }

    return libreta[0].nombre_estudiante;
  };

  const generarPDFLibreta = async (estudiante: Estudiante) => {
    try {
      setLoadingPDF(true);
      const doc = new jsPDF() as JsPDFWithAutoTable;
      const fecha = new Date().toLocaleDateString();
      
      const nombreEstudiante = await generarPDFEstudiante(estudiante, doc, fecha);
      doc.save(`libreta_${nombreEstudiante}_${fecha}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setLoadingPDF(false);
    }
  };

  const generarPDFConsolidado = async () => {
    if (!currentCurso || dataEstudiantes.length === 0) return;

    try {
      setLoadingPDF(true);
      const doc = new jsPDF() as JsPDFWithAutoTable;
      const fecha = new Date().toLocaleDateString();

      // Generar PDF para cada estudiante
      for (let i = 0; i < dataEstudiantes.length; i++) {
        const estudiante = dataEstudiantes[i];
        if (i > 0) {
          doc.addPage();
        }
        await generarPDFEstudiante(estudiante, doc, fecha);
      }

      // Guardar el PDF consolidado
      doc.save(`libretas_${currentCurso.nombre}_${fecha}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF consolidado:", error);
    } finally {
      setLoadingPDF(false);
    }
  };

  // Función para convertir nota numérica a concepto
  const getConceptoFromNota = (nota: number | string): string => {
    const notaNum = typeof nota === 'string' ? parseFloat(nota) : nota;
    if (isNaN(notaNum)) return "-";
    
    if (notaNum >= 70) return "MB";
    if (notaNum >= 50) return "B";
    if (notaNum >= 40) return "S";
    if (notaNum >= 30) return "I";
    return "-";
  };

  // Función para obtener el valor del concepto
  const getValorConcepto = (concept: string): string => {
    switch (concept) {
      case "MB":
        return "MB";
      case "B":
        return "B";
      case "S":
        return "S";
      case "I":
        return "I";
      default:
        return "-";
    }
  };

  // Función para extraer el valor numérico de un concepto
  const getValorNumericoConcepto = (concept: string): number | null => {
    switch (concept) {
      case "MB":
        return 70;
      case "B":
        return 50;
      case "S":
        return 40;
      case "I":
        return 30;
      default:
        return null;
    }
  };

  // Función auxiliar para calcular promedios
  const calcularPromedio = (calificaciones: (string | number)[], esConcepto: boolean = false): string => {
    if (esConcepto) {
      // Para asignaturas con concepto, usamos el valor numérico del concepto
      const valores = calificaciones
        .map((c) => {
          if (typeof c === "string") {
            return getValorNumericoConcepto(c);
          }
          return null;
        })
        .filter((c) => c !== null);

      if (valores.length === 0) return "-";

      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      return getConceptoFromNota(promedio);
    }

    const numeros = calificaciones
      .map((c) => (typeof c === "string" ? parseFloat(c) : c))
      .filter((c) => !isNaN(c));

    if (numeros.length === 0) return "-";

    const promedio = numeros.reduce((a, b) => a + b, 0) / numeros.length;
    return Math.round(promedio).toString();
  };

  // Función para calcular promedio anual
  const calcularPromedioAnual = (pfs1: string, pfs2: string, esConcepto: boolean = false): string => {
    if (esConcepto) {
      const num1 = getValorNumericoConcepto(pfs1);
      const num2 = getValorNumericoConcepto(pfs2);
      
      if (num1 === null || num2 === null) return "-";
      
      const promedio = (num1 + num2) / 2;
      return getConceptoFromNota(promedio);
    }

    const num1 = parseFloat(pfs1);
    const num2 = parseFloat(pfs2);
    
    if (isNaN(num1) || isNaN(num2)) return "-";
    
    const promedio = (num1 + num2) / 2;
    const config = configPromedios.promedioAnualAsignatura;
    
    if (config.aproximar) {
      const base = config.reglaAproximacion?.base || 0.05;
      
      // Aplicar regla de aproximación
      const parteDecimal = promedio - Math.floor(promedio);
      if (parteDecimal >= base) {
        return Math.ceil(promedio).toString();
      }
      return Math.floor(promedio).toString();
    }
    
    return Math.round(promedio).toString();
  };

  if (loading || loadingUsuarios)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    );

  if (error || errorUsuarios)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || errorUsuarios}</AlertDescription>
        </Alert>
      </div>
    );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <Toaster />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Imprimir Libretas
          </h1>
          <p className="text-muted-foreground">
            Imprime las libretas de los estudiantes
          </p>
        </div>

        <div className="rounded-lg border bg-card">
        <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atención</AlertTitle>
      <AlertDescription>
        Esta funcionalidad está en desarrollo y puede no funcionar correctamente.
      </AlertDescription>
    </Alert>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-[200px] font-semibold">
                  Nombre
                </TableHead>
                <TableHead className="w-[200px] font-semibold">
                  Jefatura
                </TableHead>
                <TableHead className="w-[150px] font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarioCursos.length > 0 ? (
                funcionarioCursos.map((c: CursoApiResponseType) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.jefatura}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEstudiantesClick(c)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Users className="size-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-muted-foreground"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <p className="text-muted-foreground">
                        No hay cursos disponibles
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={isModalEstudiantesOpen}
        onOpenChange={setIsModalEstudiantesOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Estudiantes - {currentCurso?.nombre}
            </DialogTitle>
          </DialogHeader>
          {loadingEstudiantes ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-hidden">
              <div className="rounded-lg border overflow-hidden">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atención</AlertTitle>
                  <AlertDescription>
                    Esta funcionalidad está en desarrollo y puede no funcionar correctamente.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generarPDFConsolidado}
                    className="flex items-center gap-2"
                    disabled={loadingPDF}
                  >
                    {loadingPDF ? (
                      <>
                        <Spinner />
                        Generando PDF...
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        Descargar PDF Consolidado
                      </>
                    )}
                  </Button>
                </div>
                <div className="overflow-auto max-h-[50vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>RUT</TableHead>
                        <TableHead>N° Lista</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataEstudiantes.length > 0 ? (
                        dataEstudiantes.map((estudiante) => (
                          <TableRow key={estudiante.id}>
                            <TableCell>{estudiante.nombre}</TableCell>
                            <TableCell>{estudiante.rut}</TableCell>
                            <TableCell>{estudiante.numlista}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-primary/10 hover:text-primary"
                                onClick={() => generarPDFLibreta(estudiante)}
                                disabled={loadingPDF}
                              >
                                {loadingPDF ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex justify-center">
                                      <Spinner />
                                    </div>
                                    <span>Generando PDF...</span>
                                  </div>
                                ) : (
                                  "Imprimir Libreta"
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No hay estudiantes en este curso
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalEstudiantesOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicoImprimirLibreta;
