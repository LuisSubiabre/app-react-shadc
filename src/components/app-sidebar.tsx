import React from "react";
import { useLocation } from "react-router-dom"; // Importar useLocation para obtener la ruta actual

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
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

// Definición de datos
const data = {
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
          title: "Inicio",
          url: "/dashboard/academico/inicio",
        },
        {
          title: "Jefaturas",
          url: "#",
        },
        {
          title: "Asignaturas",
          url: "#",
        },
        {
          title: "Calificaciones",
          url: "#",
        },
        {
          title: "Libretas",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
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
      if (menu.title === "Models") {
        return user?.roles?.includes(2); // Mostrar "Models" solo si el usuario tiene el rol 2
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
        <NavMain items={filteredNavMain} /> {/* Usar el menú filtrado */}
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.nombre || "Invitado",
            email: user?.email || "N/A",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
