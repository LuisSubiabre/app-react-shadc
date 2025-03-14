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
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config/config";
import type { ServerResponse } from "@/types/auth";

export function PasswordResetRequestForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [rut, setRut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/password-reset/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, rut }),
      });

      const data = (await response.json()) as ServerResponse;

      if (response.ok) {
        setSuccess(
          "Se ha enviado un enlace de recuperación a tu correo electrónico"
        );
        // Limpiar el formulario
        setEmail("");
        setRut("");
      } else {
        switch (response.status) {
          case 404:
            setError("No se encontró ningún usuario con esas credenciales");
            break;
          case 400:
            setError("El correo electrónico y el RUT son obligatorios");
            break;
          case 500:
          default:
            setError("Error en el servidor. Por favor, intenta más tarde");
        }
      }
    } catch (err) {
      console.error("Error al solicitar recuperación:", err);
      setError(
        "Error al conectar con el servidor. Por favor, verifica tu conexión a internet."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y RUT para recuperar tu contraseña
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
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  type="text"
                  placeholder="12345678-9"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Recuperar Contraseña"}
              </Button>
              {error && (
                <div className="text-red-500 text-center mt-2">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-center mt-2">{success}</div>
              )}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Volver al login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
