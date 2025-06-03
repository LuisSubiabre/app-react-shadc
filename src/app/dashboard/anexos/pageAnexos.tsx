import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface Anexo {
  numero: string;
  lugar: string;
}

const anexos: Anexo[] = [
  { numero: "200", lugar: "Recepción" },
  { numero: "201", lugar: "Director" },
  { numero: "202", lugar: "Parvulos A" },
  { numero: "203", lugar: "Apoyo UTP BASICA" },
  { numero: "204", lugar: "Secretaria Dirección" },
  { numero: "205", lugar: "Parvulos B" },
  { numero: "206", lugar: "Sicologia" },
  { numero: "207", lugar: "Educadora Diferencial" },
  { numero: "208", lugar: "Inspectoria Basica" },
  { numero: "209", lugar: "Inspectora Media" },
  { numero: "210", lugar: "Asistente Social" },
  { numero: "211", lugar: "Jefe UTP Basica" },
  { numero: "212", lugar: "Orientacion Media" },
  { numero: "213", lugar: "Biblioteca CRA" },
  { numero: "214", lugar: "Central de Apúntes" },
  { numero: "215", lugar: "Apoyo UTP Media" },
  { numero: "216", lugar: "Vinculacion con el Medio" },
  { numero: "217", lugar: "Sala de Profesores" },
  { numero: "218", lugar: "Inspector General" },
  { numero: "219", lugar: "Apoyo UTP Básica" },
  { numero: "220", lugar: "Informática" },
  { numero: "221", lugar: "Sala de Musica" },
  { numero: "222", lugar: "Orientación Basica" },
  { numero: "223", lugar: "Lab Quimica" },
  { numero: "224", lugar: "Psicomotricidad" },
  { numero: "225", lugar: "Inspectoria Basica (subiendo escaleras)" },
  { numero: "226", lugar: "Encargado Logistica" },
  { numero: "227", lugar: "Enfermeria" },
  { numero: "229", lugar: "UTP Media" },
];

const PageAnexos = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAnexos = anexos.filter(
    (anexo) =>
      anexo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anexo.lugar.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Anexos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Directorio de anexos del establecimiento
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o lugar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Número</TableHead>
                <TableHead>Lugar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnexos.length > 0 ? (
                filteredAnexos.map((anexo) => (
                  <TableRow key={anexo.numero}>
                    <TableCell className="font-medium">
                      {anexo.numero}
                    </TableCell>
                    <TableCell>{anexo.lugar}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-muted-foreground"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      <p className="text-muted-foreground">
                        No se encontraron resultados
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default PageAnexos;
