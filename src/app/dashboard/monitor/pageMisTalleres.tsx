import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthContext } from "@/context/AuthContext";

interface Taller {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activo' | 'inactivo';
}

const MisTalleres: React.FC = () => {
  const { user } = React.useContext(AuthContext);
  const [talleres, setTalleres] = React.useState<Taller[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const cargarTalleres = async () => {
      try {
        // TODO: Implementar la llamada a la API
        // Por ahora, agregamos datos de ejemplo
        setTalleres([
          {
            id: 1,
            nombre: "Taller de Programación",
            descripcion: "Taller básico de programación",
            fechaInicio: "2024-03-01",
            fechaFin: "2024-06-30",
            estado: "activo"
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar los talleres:', error);
        setLoading(false);
      }
    };

    if (user) {
      cargarTalleres();
    }
  }, [user]);

  if (loading) {
    return <div>Cargando talleres...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Talleres</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talleres.map((taller) => (
          <Card key={taller.id}>
            <CardHeader>
              <CardTitle>{taller.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{taller.descripcion}</p>
              <div className="mt-4">
                <p className="text-sm">
                  <span className="font-semibold">Inicio:</span> {taller.fechaInicio}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Fin:</span> {taller.fechaFin}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Estado:</span>{' '}
                  <span className={`capitalize ${
                    taller.estado === 'activo' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {taller.estado}
                  </span>
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