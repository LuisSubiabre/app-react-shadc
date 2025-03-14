import { getCursos } from "@/services/cursosService";
import { getFuncionarioCursos } from "@/services/funcionariosService";
import { CursoApiResponseType } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export const useCursosFuncionarios = () => {
  const [cursos, setCursos] = useState<CursoApiResponseType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [funcionarioCursos, setFuncionarioCursos] = useState<
    CursoApiResponseType[]
  >([]);
  const [funcionarioError, setFuncionarioError] = useState<string | null>(null);
  const { user } = useAuth();
  const funcionarioId = user?.id ? parseInt(user.id) : 0;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCursos();
        if (response) {
          setCursos(response.data);
          fetchCursosFuncionario(response.data);
        } else {
          setError("No se pudo cargar la información de cursos.");
        }
      } catch {
        setError("No se pudo cargar la información de cursos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchCursosFuncionario = async (
    todosCursos: CursoApiResponseType[]
  ) => {
    try {
      const response = await getFuncionarioCursos(funcionarioId);
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

  return {
    cursos,
    error,
    loading,
    funcionarioCursos,
    funcionarioError,
    setFuncionarioCursos, // Devuelve setFuncionarioCursos
  };
};
