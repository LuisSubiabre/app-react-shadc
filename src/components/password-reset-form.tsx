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
import { Link, useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/config";
import type { ServerResponse } from "@/types/auth";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export function PasswordResetForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validatePassword = (password: string): boolean => {
    return PASSWORD_REGEX.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token no válido o expirado");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/password-reset/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = (await response.json()) as ServerResponse;

      if (response.ok) {
        setSuccess("Contraseña actualizada correctamente");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        switch (response.status) {
          case 400:
            setError(data.message || "Token inválido o expirado");
            break;
          case 500:
          default:
            setError("Error en el servidor. Por favor, intenta más tarde");
        }
      }
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);
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
          <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  La contraseña debe tener al menos 8 caracteres, una mayúscula,
                  una minúscula y un número
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Actualizando..." : "Restablecer Contraseña"}
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
