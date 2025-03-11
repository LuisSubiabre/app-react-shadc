"use client";

import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CursoApiResponseType, EstudianteType, Atraso } from "@/types";
import { ModalAtrasos } from "@/components/atrasos/ModalAtrasos";

import { Clock } from "lucide-react";
import { getCursos } from "@/services/cursosService";
import {
  estudiantesCurso,
  getEstudiantes,
} from "@/services/estudiantesService";
import { getAtrasosByEstudiante } from "@/services/atrasosService";

const PageControlAtrasos = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteType[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEstudiante, setSelectedEstudiante] =
    useState<EstudianteType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [atrasos, setAtrasos] = useState<Atraso[]>([]);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await getCursos();
        if (response) {
          setCursos(response.data);
        }
      } catch (error) {
        console.error("Error al obtener cursos:", error);
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      setIsLoading(true);
      try {
        if (selectedCurso === "all") {
          const response = await getEstudiantes();
          setEstudiantes(Array.isArray(response.data) ? response.data : []);
          setIsLoading(false);
          return;
        }

        const response = await estudiantesCurso(parseInt(selectedCurso));

        if (response) {
          setEstudiantes(response);
        } else {
          setEstudiantes([]);
        }
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        setEstudiantes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEstudiantes();
  }, [selectedCurso]);

  const handleOpenModal = async (estudiante: EstudianteType) => {
    setSelectedEstudiante(estudiante);
    setIsModalOpen(true);
    try {
      const response = await getAtrasosByEstudiante(estudiante.id);
      setAtrasos(response);
    } catch (error) {
      console.error("Error al cargar atrasos:", error);
      setAtrasos([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEstudiante(null);
  };

  const handleAtrasosChange = async () => {
    if (selectedEstudiante) {
      try {
        const response = await getAtrasosByEstudiante(selectedEstudiante.id);
        setAtrasos(response);
      } catch (error) {
        console.error("Error al recargar atrasos:", error);
      }
    }
  };

  const normalizeString = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredEstudiantes = estudiantes.filter((estudiante) => {
    if (!searchTerm) return true;

    const searchTermNormalized = normalizeString(searchTerm.toLowerCase());
    const nombreNormalized = normalizeString(estudiante.nombre.toLowerCase());
    const rutNormalized = normalizeString(estudiante.rut?.toLowerCase() || "");
    const emailNormalized = normalizeString(
      estudiante.email?.toLowerCase() || ""
    );
    const cursoNormalized = normalizeString(
      estudiante.curso_nombre?.toLowerCase() || ""
    );

    return (
      nombreNormalized.includes(searchTermNormalized) ||
      rutNormalized.includes(searchTermNormalized) ||
      emailNormalized.includes(searchTermNormalized) ||
      cursoNormalized.includes(searchTermNormalized)
    );
  });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <Select value={selectedCurso} onValueChange={setSelectedCurso}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                {cursos?.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id.toString()}>
                    {curso.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">
                          Cargando estudiantes...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : estudiantes.length > 0 ? (
                  filteredEstudiantes.map((estudiante) => (
                    <TableRow key={estudiante.estudiante_id}>
                      <TableCell>{estudiante.estudiante_id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {estudiante.nombre}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {estudiante.rut}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{estudiante.email}</TableCell>
                      <TableCell>{estudiante.curso_nombre}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(estudiante)}
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          Gestionar Atrasos
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
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
                          No hay estudiantes disponibles.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <ModalAtrasos
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estudiante={selectedEstudiante}
        atrasos={atrasos}
        onAtrasosChange={handleAtrasosChange}
      />
    </>
  );
};

export default PageControlAtrasos;
