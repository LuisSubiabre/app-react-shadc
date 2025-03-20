import Breadcrumbs from "@/components/ui/Breadcrumbs";

const Calendarios = () => {
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
              Calendario Escolar
            </h1>
            <p className="text-muted-foreground">
              Visualiza los eventos y actividades del establecimiento
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-4">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=liceoexperimental.cl_v1vo40hg7ljnh1avc8tmlcnmf0%40group.calendar.google.com&ctz=America%2FPunta_Arenas"
              style={{ border: 0 }}
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="no"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
};

export default Calendarios; 