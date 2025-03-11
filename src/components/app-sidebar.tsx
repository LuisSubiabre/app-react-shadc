import React from "react";
import { useLocation } from "react-router-dom"; // Importar useLocation para obtener la ruta actual

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  SquareTerminal,
  BookDashed,
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
          title: "Inicio",
          url: "/dashboard/academico/inicio",
        },
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
        // {
        //   title: "Libretas",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Inspectoria",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Asistencia",
          url: "/dashboard/inspectoria/asistencia",
        },
        {
          title: "Atrasos",
          url: "/dashboard/inspectoria/atrasos",
        },
      ],
    },
    {
      title: "Jefatura",
      url: "#",
      icon: BookDashed,
      items: [
        {
          title: "Mi Curso",
          url: "/dashboard/jefatura",
        },
      ],
    },

    {
      title: "Acles",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Talleres",
          url: "/dashboard/acles/talleres",
        },
      ],
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
      if (menu.title === "Académico") {
        return user?.roles?.includes(2); // Mostrar "Models" solo si el usuario tiene el rol 2
      }
      if (menu.title === "Inspectoria") {
        return user?.roles?.includes(3); // Mostrar "Models" solo si el usuario tiene el rol 2
      }
      if (menu.title === "Acles") {
        return user?.roles?.includes(1); // Mostrar "Models" solo si el usuario tiene el rol 2
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
