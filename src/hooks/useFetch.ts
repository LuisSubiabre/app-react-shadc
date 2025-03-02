// import { useState, useEffect } from "react";

// export function useFetch(url: string, token: string) {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetch(`http://localhost:3100/${url}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Error al obtener información");
//         }
//         return response.json();
//       })
//       .then((data) => setData(data.data))
//       .catch((error) => console.error(error))
//       .finally(() => setLoading(false));
//   }, [url, token]);
//   return { data, loading, error, refetch: useFetch };
// } `${import.meta.env.VITE_URL_BASE}/${url}`,

import { useState, useEffect } from "react";

// Ahora useFetch acepta un tipo genérico T
export function useFetch<T>(url: string, token: string) {
  const [data, setData] = useState<T | null>(null); // El tipo de data es T o null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3100/${url}`, {
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
