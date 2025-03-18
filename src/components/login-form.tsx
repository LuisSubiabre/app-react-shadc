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
import type { LoginResponse } from "@/types/auth";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null
  );
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
        throw new Error("CONN_ERROR");
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
          throw new Error("REDIRECT_ERROR");
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
          throw new Error("REDIRECT_FAILED");
        }
        const data = await redirectResponse.json();
        return handleLoginSuccess(data);
      }

      // Si no hay redirección, procesamos la respuesta normal
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("INVALID_CREDENTIALS");
        }
        if (response.status === 500) {
          throw new Error("SERVER_ERROR");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "AUTH_ERROR");
      }

      const data = await response.json();
      return handleLoginSuccess(data);
    } catch (err) {
      console.error("Error durante el login:", err);
      if (err instanceof Error) {
        switch (err.message) {
          case "CONN_ERROR":
            setError({
              title: "Error de Conexión",
              message:
                "No se pudo establecer conexión con el servidor. Por favor, verifica tu conexión a internet y vuelve a intentarlo.",
            });
            break;
          case "INVALID_CREDENTIALS":
            setError({
              title: "Credenciales Incorrectas",
              message:
                "El email o la contraseña ingresados no son correctos. Por favor, verifica tus datos e intenta nuevamente.",
            });
            break;
          case "SERVER_ERROR":
            setError({
              title: "Credenciales Incorrectas",
              message:
                "El email o la contraseña ingresados no son correctos o el usuario no se encuentra ativo. Por favor, contacte con el administrador del sistemaa.",
            });
            break;
          case "REDIRECT_ERROR":
          case "REDIRECT_FAILED":
            setError({
              title: "Error de Redirección",
              message:
                "Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.",
            });
            break;
          default:
            setError({
              title: "Error de Autenticación",
              message:
                "Ocurrió un error durante el proceso de login. Por favor, intenta nuevamente.",
            });
        }
      } else {
        setError({
          title: "Error Inesperado",
          message:
            "Ocurrió un error inesperado. Por favor, verifica tu conexión e intenta nuevamente.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (data: LoginResponse) => {
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
                  className={cn(
                    error && "border-red-500 focus-visible:ring-red-500"
                  )}
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
                  className={cn(
                    error && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
