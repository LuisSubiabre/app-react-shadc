import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/config/config";
import { Link, useNavigate } from "react-router-dom";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Intentando login con:", API_BASE_URL);

      // Primero verificamos que el servidor esté disponible
      const checkResponse = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!checkResponse.ok) {
        throw new Error("No se puede conectar con el servidor");
      }

      // Si el servidor está disponible, intentamos el login
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          clave,
        }),
      });

      // Manejamos las redirecciones manualmente si es necesario
      if (response.status === 301 || response.status === 302) {
        const newUrl = response.headers.get("Location");
        if (!newUrl) {
          throw new Error("Error de redirección del servidor");
        }
        // Intentamos nuevamente con la nueva URL
        const redirectResponse = await fetch(newUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            clave,
          }),
        });
        if (!redirectResponse.ok) {
          throw new Error("Error después de la redirección");
        }
        const data = await redirectResponse.json();
        return handleLoginSuccess(data);
      }

      // Si no hay redirección, procesamos la respuesta normal
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Credenciales inválidas");
        }
        if (response.status === 500) {
          throw new Error("Error en el servidor. Por favor, intenta más tarde");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error de autenticación");
      }

      const data = await response.json();
      return handleLoginSuccess(data);
    } catch (err) {
      console.error("Error durante el login:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Error al conectar con el servidor. Por favor, verifica tu conexión a internet."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (data: any) => {
    const { token, usuario } = data;

    if (!token || !usuario) {
      throw new Error("Respuesta del servidor inválida");
    }

    localStorage.setItem("token", token);
    login(token, {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      roles: usuario.roles,
      cursos: usuario.cursos,
    });

    navigate("/dashboard");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tucorreo@liceoexperimental.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="clave">Password</Label>
                  <Link
                    to="/recuperar-contrasena"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="clave"
                  type="password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Cargando..." : "Login"}
              </Button>
              {error && (
                <div className="text-red-500 text-center mt-2">{error}</div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
