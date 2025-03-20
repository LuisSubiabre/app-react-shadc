import Breadcrumbs from "@/components/ui/Breadcrumbs";
import UltimosIncorporados from "@/components/UltimosIncorporados";
import TablaEstudiantes from "@/components/TablaEstudiantes";
import UltimosRetirados from "@/components/UltimosRetirados";
// import UltimosAtrasos from "@/components/UltimosAtrasos";
// import UltimosIncorporados from "@/components/UltimosIncorporados";

const Dashboard = () => {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <UltimosIncorporados />
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <UltimosRetirados />
            </div>
            </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <TablaEstudiantes showAtrasosButtons={false} />
          </div>
         
        </div>

        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default Dashboard;
