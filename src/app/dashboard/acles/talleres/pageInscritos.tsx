import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, Copy, Check } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TallerType } from "@/types";
import {
  desinscribirEstudianteTaller,
  getEstudiantesInscritos,
  getTallerById,
  inscribirEstudianteTaller,
} from "@/services/talleresService";
import { getEstudiantes } from "@/services/estudiantesService";
import { Badge } from "@/components/ui/badge";

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

const AclesInscritos = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [taller, setTaller] = useState<TallerType | null>(null);
  const [copiado, setCopiado] = useState(false);

  const [estudiantes, setEstudiantes] = useState<
    {
      id: number;
      nombre: string;
      curso_nombre: string;
      estudiante_email: string;
    }[]
  >([]);

  const [estudiantesInscritos, setEstudiantesInscritos] = useState<
    {
      estudiante_id: number;
      estudiante_nombre: string;
      curso_nombre: string;
      estudiante_email: string;
    }[]
  >([]);

  const [totalInscritos, setTotalInscritos] = useState(0);

  const [query, setQuery] = useState("");
  const { id } = useParams();

  useEffect(() => {
    getTallerById(Number(id)).then((data) => {
      setTaller(data);
      console.log(data);
      fetchEstudiantesInscritos(Number(id));
      fetchEstudiantes();
      setTotalInscritos(data.taller_cantidad_inscritos);
    });
    if (!id) {
      setErrorMessage("No se encontró el ID del taller");
    }
  }, [id]);

  const fetchEstudiantes = async () => {
    await getEstudiantes().then((data) => {
      setEstudiantes(data.data);
    });
  };

  const fetchEstudiantesInscritos = async (id_taller: number) => {
    try {
      const data = await getEstudiantesInscritos(id_taller);
      setEstudiantesInscritos(data.estudiantes || []);
    } catch (error) {
      console.error("Error fetching estudiantes inscritos:", error);
      setEstudiantesInscritos([]);
    }
  };

  const inscribirEstudiante = async (
    taller_id: number,
    estudiante_id: number
  ) => {
    try {
      await inscribirEstudianteTaller(taller_id, estudiante_id);
      fetchEstudiantesInscritos(taller_id);
      setTotalInscritos(totalInscritos + 1);
    } catch (error) {
      console.error("Error inscribiendo estudiante:", error);
    }
  };

  // Función para desinscribir un estudiante de un taller
  const desinscribirEstudiante = async (
    taller_id: number,
    estudiante_id: number
  ) => {
    await desinscribirEstudianteTaller(taller_id, estudiante_id);

    // Actualiza la lista de estudiantes inscritos
    fetchEstudiantesInscritos(taller_id);
    setTotalInscritos(totalInscritos - 1);
  };
  // Función para normalizar textos y eliminar tildes
  const normalizarTexto = (texto: string) => {
    return texto
      .normalize("NFD") // Descompone los caracteres acentuados en sus partes
      .replace(/[\u0300-\u036f]/g, "") // Elimina los caracteres de acento
      .toLowerCase(); // Convierte todo a minúsculas
  };
  const estudiantesDisponibles = estudiantes.filter((estudiante) => {
    if (estudiantesInscritos.length === 0 || !estudiantesInscritos) {
      return true;
    }
    return !estudiantesInscritos.some(
      (inscrito) => inscrito.estudiante_id === estudiante.id
    );
  });
  const estudiantesDisponiblesFiltrados = estudiantesDisponibles.filter(
    (estudiante) =>
      normalizarTexto(estudiante.nombre).includes(normalizarTexto(query))
  );

  const exportarPDF = () => {
    if (!taller || !estudiantesInscritos || estudiantesInscritos.length === 0)
      return;

    const doc = new jsPDF() as JsPDFWithAutoTable;

    // Título
    doc.setFontSize(16);
    doc.text("Lista de Estudiantes Inscritos", 14, 15);
    doc.setFontSize(12);
    doc.text(`Taller: ${taller.taller_nombre}`, 14, 25);
    doc.text(`Horario: ${taller.taller_horario}`, 14, 32);
    doc.text(`Lugar: ${taller.taller_ubicacion}`, 14, 39);
    doc.text(`Total Inscritos: ${totalInscritos}`, 14, 46);

    // Tabla
    const tableData = estudiantesInscritos.map((estudiante) => [
      estudiante.estudiante_nombre,
      estudiante.curso_nombre,
    ]);

    autoTable(doc, {
      startY: 51,
      head: [["Estudiante", "Curso"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 80 },
      },
    });

    // Guardar el PDF
    doc.save(
      `estudiantes-inscritos-${taller.taller_nombre
        .toLowerCase()
        .replace(/\s+/g, "-")}.pdf`
    );
  };

  const copiarEmails = () => {
    if (!estudiantesInscritos || estudiantesInscritos.length === 0) return;

    const emails = estudiantesInscritos
      .map((estudiante) => estudiante.estudiante_email)
      .join(", ");

    navigator.clipboard
      .writeText(emails)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      })
      .catch((err) => {
        console.error("Error al copiar al portapapeles:", err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 shrink-0 items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <Toaster />

      <main className="container mx-auto py-6 px-4">
        {errorMessage ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {errorMessage}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Talleres ACLE
              </h1>
            </div>

            {taller && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {taller.taller_nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="h-8 px-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {taller.taller_horario}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="h-8 px-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {totalInscritos || "No hay inscritos"} inscritos
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="h-8 px-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {taller.taller_ubicacion}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Estudiantes Inscritos</CardTitle>
                  {estudiantesInscritos && estudiantesInscritos.length > 0 && (
                    <div className="flex space-x-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copiarEmails}
                        className="flex items-center"
                        title="Copiar todos los correos electrónicos"
                      >
                        {copiado ? (
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        {copiado ? "Copiado" : "Copiar Emails"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportarPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar PDF
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Estudiante</TableHead>
                          <TableHead>Curso</TableHead>
                          <TableHead className="w-[100px]">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!estudiantesInscritos ||
                        estudiantesInscritos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8">
                              <div className="text-muted-foreground">
                                No hay estudiantes inscritos en este taller.
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          estudiantesInscritos.map((estudiante) => (
                            <TableRow key={estudiante.estudiante_id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {estudiante.estudiante_nombre}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {estudiante.estudiante_email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{estudiante.curso_nombre}</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    desinscribirEstudiante(
                                      Number(id),
                                      estudiante.estudiante_id
                                    )
                                  }
                                >
                                  Desinscribir
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Inscribir Estudiantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar estudiante..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="rounded-lg border">
                    <div className="max-h-[600px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead>Estudiante</TableHead>
                            <TableHead className="w-[100px]">Acción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {estudiantesDisponiblesFiltrados.map((estudiante) => (
                            <TableRow key={estudiante.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {estudiante.nombre}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {estudiante.curso_nombre}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    inscribirEstudiante(
                                      Number(id),
                                      estudiante.id
                                    )
                                  }
                                >
                                  Inscribir
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AclesInscritos;
