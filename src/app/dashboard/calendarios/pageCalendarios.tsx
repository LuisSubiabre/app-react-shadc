import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Building2, Laptop, Laptop2, GraduationCap } from "lucide-react";

const Calendarios = () => {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Calendario Escolar
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Visualiza los eventos y actividades del establecimiento
            </p>
          </div>
        </div>

        <Tabs defaultValue="institucional" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="institucional" className="flex items-center gap-2 text-xs md:text-sm">
              <Building2 className="h-3 w-3 md:h-4 md:w-4" />
              Institucional
            </TabsTrigger>
            <TabsTrigger value="computacion" className="flex items-center gap-2 text-xs md:text-sm">
              <Laptop className="h-3 w-3 md:h-4 md:w-4" />
              Computación
            </TabsTrigger>
            <TabsTrigger value="movil" className="flex items-center gap-2 text-xs md:text-sm">
              <Laptop2 className="h-3 w-3 md:h-4 md:w-4" />
              Móvil
            </TabsTrigger>
            <TabsTrigger value="aula-magna" className="flex items-center gap-2 text-xs md:text-sm">
              <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
              Aula Magna
            </TabsTrigger>
          </TabsList>

          <TabsContent value="institucional" className="mt-4">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-2 md:p-4">
                <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  Calendario Institucional
                </h2>
                <div className="aspect-[4/3] md:aspect-video w-full">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=liceoexperimental.cl_v1vo40hg7ljnh1avc8tmlcnmf0%40group.calendar.google.com&ctz=America%2FPunta_Arenas"
                    style={{ border: 0 }}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="computacion" className="mt-4">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-2 md:p-4">
                <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 flex items-center gap-2">
                  <Laptop className="h-4 w-4 md:h-5 md:w-5" />
                  Calendario Laboratorio de Computación
                </h2>
                <div className="aspect-[4/3] md:aspect-video w-full">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=liceoexperimental.cl_fg6soror9dgpdr758c84sh8oo4%40group.calendar.google.com&ctz=America%2FPunta_Arenas"
                    style={{ border: 0 }}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="movil" className="mt-4">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-2 md:p-4">
                <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 flex items-center gap-2">
                  <Laptop2 className="h-4 w-4 md:h-5 md:w-5" />
                  Calendario Laboratorio Móvil
                </h2>
                <div className="aspect-[4/3] md:aspect-video w-full">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=liceoexperimental.cl_4jhrja733u2ca095o3ki4uuhrs%40group.calendar.google.com&ctz=America%2FPunta_Arenas"
                    style={{ border: 0 }}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="aula-magna" className="mt-4">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-2 md:p-4">
                <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
                  Calendario Aula Magna
                </h2>
                <div className="aspect-[4/3] md:aspect-video w-full">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?src=liceoexperimental.cl_qd17rpbspoj117oba8lu30rknk%40group.calendar.google.com&ctz=America%2FPunta_Arenas"
                    style={{ border: 0 }}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Calendarios; 