import React from "react";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const getBreadcrumbName = (segment: string) => {
    switch (segment) {
      case "dashboard":
        return "Dashboard";
      case "usuarios":
        return "Usuarios";
      case "crear":
        return "Crear Usuario";
      default:
        return segment.charAt(0).toUpperCase() + segment.slice(1); // Capitaliza el primer carácter
    }
  };

  return (
    <>
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  {index < pathSegments.length - 1 ? (
                    <BreadcrumbLink>
                      {getBreadcrumbName(segment)}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>
                      {getBreadcrumbName(segment)}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {/* Mostrar el separador solo si no es el último item */}
                {index < pathSegments.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};

export default Breadcrumbs;
