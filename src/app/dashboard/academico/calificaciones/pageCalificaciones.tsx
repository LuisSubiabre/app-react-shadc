import { useParams, useNavigate } from "react-router-dom";

import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";

const Calificaciones = () => {
  const { user } = useAuth() || {}; // Si es null, devuelve un objeto vacío
  const { id } = useParams();
  const navigate = useNavigate();

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  //const token = getTokenFromContext.authToken;

  if (id) {
    const cursoId = parseInt(id, 10); // Convertir a número
    const existeCurso = user?.cursos.includes(cursoId);

    if (existeCurso) {
      console.log("Existe, acceso autorizado");
    } else {
      console.log("No existe el curso, no tiene acceso");
      navigate("/unauthorized"); // Redirige al componente de "No autorizado"
    }
  } else {
    console.log("No se proporcionó un ID de curso válido.");
    navigate("/unauthorized"); // Redirige al componente de "No autorizado"
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        pageCalificaciones {id}
      </div>
    </>
  );
};

export default Calificaciones;
