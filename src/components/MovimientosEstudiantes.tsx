import { useState, useEffect } from "react";
import { getUltimosInscritos, getUltimosRetirados } from "@/services/infoService";
import { EstudianteType } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserPlus, UserMinus } from "lucide-react";

const ITEMS_PER_PAGE = 3;

const MovimientosEstudiantes = () => {
  const [incorporados, setIncorporados] = useState<EstudianteType[]>([]);
  const [retirados, setRetirados] = useState<EstudianteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incorporadosRes, retiradosRes] = await Promise.all([
          getUltimosInscritos(),
          getUltimosRetirados()
        ]);

        // Procesar incorporados
        if (Array.isArray(incorporadosRes)) {
          setIncorporados(incorporadosRes);
        } else if (incorporadosRes && Array.isArray(incorporadosRes.data)) {
          setIncorporados(incorporadosRes.data);
        }

        // Procesar retirados
        if (Array.isArray(retiradosRes)) {
          setRetirados(retiradosRes);
        } else if (retiradosRes && Array.isArray(retiradosRes.data)) {
          setRetirados(retiradosRes.data);
        }
      } catch (err) {
        console.error("Error al cargar movimientos:", err);
        setError("No se pudo cargar la información");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: Date | string | undefined) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = typeof dateString === "string" ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return "Fecha inválida";
      return format(date, "dd/MM/yyyy", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const EstudianteItem = ({ 
    estudiante, 
    tipo 
  }: { 
    estudiante: EstudianteType; 
    tipo: "incorporado" | "retirado" 
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {estudiante.estudiante_nombre || estudiante.nombre}
          </span>
          <Badge 
            variant="secondary" 
            className="text-xs px-2 py-0.5"
          >
            {estudiante.curso_nombre || "Sin asignar"}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {tipo === "incorporado" 
            ? `Ingreso: ${formatDate(estudiante.fecha_creacion)}`
            : `Retiro: ${formatDate(estudiante.fecha_actualizacion)}`
          }
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${
        tipo === "incorporado" ? "bg-green-500" : "bg-red-500"
      }`} />
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando movimientos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Movimientos Recientes</h3>
      </div>
      
      <Tabs defaultValue="incorporados" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="incorporados" className="text-xs">
            <UserPlus className="w-3 h-3 mr-1" />
            Incorporados ({incorporados.length})
          </TabsTrigger>
          <TabsTrigger value="retirados" className="text-xs">
            <UserMinus className="w-3 h-3 mr-1" />
            Retirados ({retirados.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incorporados" className="p-4 m-0">
          {incorporados.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No hay incorporaciones recientes
            </div>
          ) : (
            <div className="space-y-1">
              {incorporados.slice(0, ITEMS_PER_PAGE).map((estudiante) => (
                <EstudianteItem 
                  key={estudiante.estudiante_id || estudiante.id} 
                  estudiante={estudiante} 
                  tipo="incorporado" 
                />
              ))}
              {incorporados.length > ITEMS_PER_PAGE && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  +{incorporados.length - ITEMS_PER_PAGE} más
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="retirados" className="p-4 m-0">
          {retirados.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No hay retiros recientes
            </div>
          ) : (
            <div className="space-y-1">
              {retirados.slice(0, ITEMS_PER_PAGE).map((estudiante) => (
                <EstudianteItem 
                  key={estudiante.estudiante_id || estudiante.id} 
                  estudiante={estudiante} 
                  tipo="retirado" 
                />
              ))}
              {retirados.length > ITEMS_PER_PAGE && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  +{retirados.length - ITEMS_PER_PAGE} más
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MovimientosEstudiantes;
