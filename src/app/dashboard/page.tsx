import Breadcrumbs from "@/components/ui/Breadcrumbs";
import MovimientosEstudiantes from "@/components/MovimientosEstudiantes";
import TablaEstudiantesOptimizada from "@/components/TablaEstudiantesOptimizada";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Verificar si el usuario tiene un email del liceo experimental
  const isLiceoExperimentalUser = user?.email?.endsWith('@liceoexperimental.cl') || false;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4">
          {/* Movimientos recientes y mensajes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <MovimientosEstudiantes />
            </div>
            
            {/* Mensajes de la plataforma */}
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm">Mensajes de la plataforma</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-muted-foreground">
                    No hay mensajes disponibles
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabla de estudiantes optimizada - Solo visible para usuarios del liceo experimental */}
          {isLiceoExperimentalUser && (
            <TablaEstudiantesOptimizada showAtrasosButtons={false} />
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
