import React, { useEffect, useState } from "react";
import { getTalleresByMonitor } from "@/services/talleresService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Taller {
  taller_id: number;
  taller_nombre: string;
  taller_descripcion: string;
  taller_horario: string;
  taller_nivel: string;
  taller_cantidad_cupos: number;
  taller_cantidad_inscritos: number;
  taller_ubicacion: string;
  profesor_nombre: string;
}

interface TalleresResponse {
  message: string;
  talleres: Taller[];
}

const MisTalleres: React.FC = () => {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTalleres = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const userId = payload.id;
          const response: TalleresResponse = await getTalleresByMonitor(userId);
          setTalleres(response.talleres);
        }
      } catch (error) {
        console.error("Error al obtener talleres:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTalleres();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-6">Cargando talleres...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Talleres</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talleres.map((taller) => (
          <Card
            key={taller.taller_id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle>{taller.taller_nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{taller.taller_descripcion}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500">
                  Horario: {taller.taller_horario}
                </p>
                <p className="text-sm text-gray-500">
                  Nivel: {taller.taller_nivel}
                </p>
                <p className="text-sm text-gray-500">
                  Ubicación: {taller.taller_ubicacion}
                </p>
                <p className="text-sm text-gray-500">
                  Cupos: {taller.taller_cantidad_inscritos}/
                  {taller.taller_cantidad_cupos}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MisTalleres;
