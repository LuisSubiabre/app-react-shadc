import { getCursos } from "@/services/cursosService";
import { getFuncionarioCursos } from "@/services/funcionariosService";
import { CursoApiResponseType } from "@/types";
import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";

// Ahora, el componente recibe un prop `enabledButtons` que indica qué botones deben estar habilitados
interface CursosComponentProps {
  enabledButtons: string[]; // Lista de botones habilitados (por ejemplo: ['Pencil', 'Trash2'])
}

const CursosComponent = ({ enabledButtons }: CursosComponentProps) => {
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [funcionarioCursos, setFuncionarioCursos] = useState<
    CursoApiResponseType[]
  >([]);
  const [funcionarioError, setFuncionarioError] = useState<string | null>(null);

  useEffect(() => {
    getCursos()
      .then((response) => {
        if (response) {
          setCursos(response.data);
          fetchCursosFuncionario(response.data);
        } else {
          setError("No se pudo cargar la información de cursos.");
        }
      })
      .catch(() => {
        setError("No se pudo cargar la información de cursos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchCursosFuncionario = async (
    todosCursos: CursoApiResponseType[]
  ) => {
    try {
      const response = await getFuncionarioCursos(84);

      if (response && Array.isArray(response)) {
        const cursoIds = response.map((item) => item.curso_id);
        const cursosAsignados = todosCursos.filter((curso) =>
          cursoIds.includes(curso.id)
        );

        setFuncionarioCursos(cursosAsignados);
      } else {
        setFuncionarioError("La respuesta de los cursos no es válida.");
      }
    } catch (error) {
      setFuncionarioError("Ocurrió un error al obtener los cursos. " + error);
    }
  };

  return (
    <>
      <h1>Cursos</h1>
      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}
      <Table>
        <TableCaption>Lista de cursos</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Nombre</TableHead>
            <TableHead className="w-[50px]">Jefatura</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funcionarioCursos.length > 0 ? (
            funcionarioCursos.map((curso) => (
              <TableRow key={curso.id}>
                <TableCell>{curso.nombre}</TableCell>
                <TableCell>{curso.jefatura}</TableCell>
                <TableCell>
                  {/* Condicionalmente habilitar los botones */}
                  {enabledButtons.includes("Pencil") && (
                    <Button className="mr-2">
                      <Pencil />
                    </Button>
                  )}
                  {enabledButtons.includes("Trash2") && (
                    <Button className="mr-2">
                      <Trash2 />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <p>No hay cursos asignados al funcionario.</p>
          )}

          {funcionarioError && <p>{funcionarioError}</p>}
        </TableBody>
      </Table>
    </>
  );
};

export default CursosComponent;
