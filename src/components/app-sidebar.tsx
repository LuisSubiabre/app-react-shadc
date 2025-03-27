import React from "react";
import { useLocation } from "react-router-dom"; // Importar useLocation para obtener la ruta actual
import packageJson from "../../package.json";

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  PieChart,
  SquareTerminal,
  LandPlot,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
//import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";

// Definición de datos
const data = {
  projects: [
    {
      name: "Inicio",
      url: "/dashboard",
      icon: Frame,
    },
    {
      name: "Reglamentos",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Calendarios",
      url: "/calendarios",
      icon: Calendar,
    },
  ],
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Administrador",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      items: [
        {
          title: "Usuarios",
          url: "/dashboard/toor/usuarios",
        },
        {
          title: "Roles",
          url: "/dashboard/toor/roles",
        },
        {
          title: "Cursos",
          url: "/dashboard/toor/cursos",
        },
        {
          title: "Estudiantes",
          url: "/dashboard/toor/estudiantes",
        },
        {
          title: "Asignaturas",
          url: "/dashboard/toor/asignaturas",
        },
      ],
    },
    {
      title: "Académico",
      url: "#",
      icon: Bot,
      isActive: false,
      items: [
        {
          title: "Cursos",
          url: "/dashboard/academico/cursos",
        },
        {
          title: "Asignaturas",
          url: "/dashboard/academico/asignaturas",
        },
        {
          title: "Calificaciones",
          url: "/dashboard/academico/notas",
        },
      ],
    },
    {
      title: "Inspectoria",
      url: "#",
      icon: BookOpen,
      isActive: false,
      items: [
        {
          title: "Asistencia",
          url: "/dashboard/inspectoria/asistencia",
        },
        {
          title: "Atrasos",
          url: "/dashboard/inspectoria/atrasos",
        },
        {
          title: "Control de Atrasos",
          url: "/dashboard/inspectoria/controlatrasos",
        },
      ],
    },
    {
      title: "Acles",
      url: "#",
      icon: LandPlot,
      isActive: false,
      items: [
        {
          title: "Talleres",
          url: "/dashboard/acles/talleres",
        },
      ],
    },
    {
      title: "Monitor ACLE",
      url: "#",
      icon: AudioWaveform,
      isActive: false,
      items: [
        {
          title: "Mis Talleres",
          url: "/dashboard/monitor/mis-talleres",
        },
        {
          title: "Informes",
          url: "/dashboard/monitor/informes",
        }
      ],
    }

  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth() || {}; // Si es null, devuelve un objeto vacío
  const location = useLocation(); // Obtener la ruta actual

  // Filtrar elementos del menú basados en los roles del usuario
  //console.log(user);
  const filteredNavMain = React.useMemo(() => {
    return data.navMain.filter((menu) => {
      if (menu.items) {
        menu.items = menu.items.filter((item) => {
          if (item.url === location.pathname) {
            menu.isActive = true;
          }
          return true;
        });
      }
      if (menu.title === "Administrador") {
        return user?.roles?.includes(1); // Mostrar "Administrador" solo si el usuario tiene el rol 1
      }
      if (menu.title === "Académico") {
        return user?.roles?.includes(2); // Mostrar "Models" solo si el usuario tiene el rol 2
      }
      if (menu.title === "Inspectoria") {
        return user?.roles?.includes(3); // Mostrar "Models" solo si el usuario tiene el rol 2
      }
      if (menu.title === "Acles") {
        return user?.roles?.includes(4); // Mostrar "Models" solo si el usuario tiene el rol 2
      }
      if (menu.title == "Jefatura") {
        return !user?.roles?.includes(3); // No mostrar "Jefatura" si el usuario tiene el rol 3, Inspectoria
      }
      return true; // Mostrar otros menús sin restricciones
    });
  }, [location.pathname, user?.roles]);

  if (loading) {
    return <div>Loading...</div>; // O el componente de carga que prefieras
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{/* <TeamSwitcher teams={data.teams} /> */}</SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={filteredNavMain} /> {/* Usar el menú filtrado */}
        <ModeToggle />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground text-center">
            Versión {packageJson.version}
          </div>
          <NavUser
            user={{
              name: user?.nombre || "Invitado",
              email: user?.email || "N/A",
            }}
          />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
