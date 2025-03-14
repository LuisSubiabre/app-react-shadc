import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/config";

// Ahora useFetch acepta un tipo genérico T
export function useFetch<T>(url: string, token: string) {
  const [data, setData] = useState<T | null>(null); // El tipo de data es T o null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${url}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener información");
      }

      const result = await response.json();
      setData(result.data); // Aquí guardamos los datos en el estado
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, token]);

  // Devuelve los datos, el estado y la función para recargar
  return { data, loading, error, refetch: fetchData };
}
