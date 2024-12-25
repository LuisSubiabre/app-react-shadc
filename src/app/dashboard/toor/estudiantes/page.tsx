import Breadcrumbs from "@/components/ui/Breadcrumbs";  // Importa el componente de breadcrumb

const Estudiantes = () => {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
       
          <Breadcrumbs /> {/* Usa el componente de breadcrumbs aquí */}
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Contenido de la página */}
        Estudiantes
      </div>
    </>
  );
};

export default Estudiantes;
