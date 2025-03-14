import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts"; // Asegúrate de importar el hook que creaste

const CursosComponent = () => {
  const { error, loading, funcionarioCursos, funcionarioError } =
    useCursosFuncionarios();

  if (loading) {
    return <div>Cargando cursos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (funcionarioError) {
    return <div>{funcionarioError}</div>;
  }

  return (
    <div>
      <h2>Cursos Asignados al Funcionario</h2>
      <ul>
        {funcionarioCursos.map((curso) => (
          <li key={curso.id}>{curso.nombre}</li>
        ))}
      </ul>
    </div>
  );
};

export default CursosComponent;
