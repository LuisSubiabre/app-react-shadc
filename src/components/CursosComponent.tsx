import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts"; // Asegúrate de importar el hook que creaste

const CursosComponent = () => {
  const funcionarioId = 84; // O cualquier ID de funcionario que quieras pasar
  const { error, loading, funcionarioCursos, funcionarioError } =
    useCursosFuncionarios(funcionarioId);

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
