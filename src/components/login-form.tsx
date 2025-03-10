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
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import { API_BASE_URL } from "@/config/config";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState(""); // Cambié el nombre de `password` a `clave`
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const { login } = useAuth(); // Usamos directamente el hook useAuth
  console.log(authToken);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null); // Limpiar posibles errores previos

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          clave, // Enviamos 'clave' en lugar de 'password'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Al recibir respuesta exitosa, guardamos el token y los datos del usuario
        const { token, usuario } = data;

        localStorage.setItem("token", token); // Guardar token en localStorage
        login(token, {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          roles: usuario.roles,
          cursos: usuario.cursos,
        }); // Usamos el login del contexto para actualizar el estado
        // Redirigir a la página de dashboard
      } else {
        setError(data.message || "Error de autenticación"); // Mostrar mensaje de error
      }
    } catch (error) {
      setError("Error al hacer la solicitud al servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
                  onChange={(e) => setEmail(e.target.value)} // Actualizamos el estado del email
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="clave">Password</Label>{" "}
                  {/* Cambié 'password' a 'clave' */}
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="clave"
                  type="password"
                  value={clave} // Actualizamos el estado de 'clave'
                  onChange={(e) => setClave(e.target.value)} // Actualizamos el estado de 'clave'
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Cargando..." : "Login"}
              </Button>
              {error && (
                <div className="text-red-500 text-center mt-2">{error}</div>
              )}

              {/* <Button variant="outline" className="w-full">
                Login with Google
              </Button> */}
            </div>
            {/* <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
