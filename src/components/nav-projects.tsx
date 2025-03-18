import {
  type LucideIcon,
} from "lucide-react";


import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  //useSidebar,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  //const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Leumag</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>

          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>

        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
