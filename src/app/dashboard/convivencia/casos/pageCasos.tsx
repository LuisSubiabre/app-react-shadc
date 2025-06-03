import Breadcrumbs from "@/components/ui/Breadcrumbs";

const pageCasos = () => {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestión de Casos
            </h1>
            <p className="text-muted-foreground">
              Administra los casos de convivencia escolar
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Aquí puedes agregar botones o acciones adicionales */}
          </div>
        </div>
        <div className="flex-1">
          {/* Aquí puedes agregar el contenido principal de la página */}
          <p>Contenido de gestión de casos de convivencia escolar</p>
        </div>
      </div>
    </>
  );
};

export default pageCasos;
