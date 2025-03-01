"use client";

import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/button";

const PageAtrasos = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const puntaArenasTime = time.toLocaleString("es-CL", {
    timeZone: "America/Punta_Arenas",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const handleNewAtraso = () => {
    console.log("Nuevo Atraso: ", puntaArenasTime);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col items-center justify-center">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              Hora Local Punta Arenas
            </h1>
            <div className="text-4xl font-mono text-blue-600 dark:text-blue-400">
              {puntaArenasTime}
            </div>
            <p className="mt-2 text-gray-600 dark:text-white">UTC-3</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Button onClick={handleNewAtraso}>Nuevo Atraso</Button>
        </div>
      </div>
    </>
  );
};

export default PageAtrasos;
