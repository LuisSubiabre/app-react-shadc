
import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getAsignaturasEncuestaFD, postAsignaturaEncuestaFD, CreateAsignaturaEncuestaFDType } from "@/services/encuestaFDService";
import { getAsignaturas } from "@/services/asignaturasService";
import { AsignaturaEncuestaFDType, AsignaturaType } from "@/types";

const PageFD = () => {
  const [asignaturas, setAsignaturas] = useState<AsignaturaEncuestaFDType[]>([]);
  const [asignaturasExistentes, setAsignaturasExistentes] = useState<AsignaturaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateAsignaturaEncuestaFDType>({
    nombre: "",
    area: "",
    bloque: "Bloque 1",
    cupos_totales: 0,
    cupos_actuales: 0,
    estado: "visible",
    asignatura_id: null
  });

  const fetchAsignaturas = async () => {
    try {
      setLoading(true);
      const response = await getAsignaturasEncuestaFD();
      setAsignaturas(response.data);
    } catch (err) {
      setError("Error al cargar las asignaturas");
      console.error("Error fetching asignaturas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAsignaturasExistentes = async () => {
    try {
      const response = await getAsignaturas();
      setAsignaturasExistentes(response.data || response);
    } catch (err) {
      console.error("Error fetching asignaturas existentes:", err);
    }
  };

  useEffect(() => {
    fetchAsignaturas();
    fetchAsignaturasExistentes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('cupos') ? parseInt(value) || 0 : 
              name === 'asignatura_id' ? (value === '' ? null : parseInt(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Solo enviar asignatura_id si no es null
      const dataToSend = { ...formData };
      if (dataToSend.asignatura_id === null) {
        delete dataToSend.asignatura_id;
      }
      
      await postAsignaturaEncuestaFD(dataToSend);
      setShowModal(false);
      setFormData({
        nombre: "",
        area: "",
        bloque: "Bloque 1",
        cupos_totales: 0,
        cupos_actuales: 0,
        estado: "visible",
        asignatura_id: null
      });
      // Recargar la lista de asignaturas
      await fetchAsignaturas();
    } catch (err) {
      console.error("Error creating asignatura:", err);
      alert("Error al crear la asignatura");
    } finally {
      setSubmitting(false);
    }
  };

  // Función para agrupar asignaturas por bloque
  const agruparPorBloque = (asignaturas: AsignaturaEncuestaFDType[]) => {
    const grupos = {
      "Bloque 1": [] as AsignaturaEncuestaFDType[],
      "Bloque 2": [] as AsignaturaEncuestaFDType[],
      "Bloque 3": [] as AsignaturaEncuestaFDType[],
    };

    asignaturas.forEach((asignatura) => {
      if (grupos[asignatura.bloque as keyof typeof grupos]) {
        grupos[asignatura.bloque as keyof typeof grupos].push(asignatura);
      }
    });

    return grupos;
  };

  const gruposAsignaturas = agruparPorBloque(asignaturas);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumbs />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando asignaturas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumbs />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Asignaturas Encuesta FD
            </h1>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona las asignaturas disponibles para la encuesta FD
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Asignatura
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {Object.entries(gruposAsignaturas).map(([bloque, asignaturasBloque]) => (
              <div
                key={bloque}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="bg-blue-600 dark:bg-blue-700 px-4 py-3">
                  <h2 className="text-lg font-semibold text-white">{bloque}</h2>
                  <p className="text-blue-100 text-sm">
                    {asignaturasBloque.length} asignatura{asignaturasBloque.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="p-4">
                  {asignaturasBloque.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No hay asignaturas en este bloque
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {asignaturasBloque.map((asignatura) => (
                        <div
                          key={asignatura.asignatura_encuesta_id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {asignatura.nombre}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {asignatura.area}
                          </p>
                          {asignatura.asignatura_nombre && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                              Vinculada a: {asignatura.asignatura_nombre}
                            </p>
                          )}
                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              Cupos: {asignatura.cupos_actuales}/{asignatura.cupos_totales}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              asignatura.estado === 'visible' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {asignatura.estado}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal para agregar asignatura */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Agregar Nueva Asignatura
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Matemáticas Avanzadas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Área
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecciona un área</option>
                  <option value="A">Área A</option>
                  <option value="B">Área B</option>
                  <option value="C">Área C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bloque
                </label>
                <select
                  name="bloque"
                  value={formData.bloque}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Bloque 1">Bloque 1</option>
                  <option value="Bloque 2">Bloque 2</option>
                  <option value="Bloque 3">Bloque 3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cupos Totales
                  </label>
                  <input
                    type="number"
                    name="cupos_totales"
                    value={formData.cupos_totales}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cupos Actuales
                  </label>
                  <input
                    type="number"
                    name="cupos_actuales"
                    value={formData.cupos_actuales}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="visible">Visible</option>
                  <option value="oculto">Oculto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vincular con Asignatura Existente (Opcional)
                </label>
                <select
                  name="asignatura_id"
                  value={formData.asignatura_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Sin vincular</option>
                  {asignaturasExistentes.map((asignatura) => (
                    <option key={asignatura.asignatura_id} value={asignatura.asignatura_id}>
                      {asignatura.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecciona una asignatura existente para vincular esta encuesta FD
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageFD;
