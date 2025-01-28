import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Toaster } from "@/components/ui/toaster";

const AclesInscritos = () => {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <Toaster />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Talleres ACLE</h1>
      </div>
    </>
  );
};

export default AclesInscritos;
