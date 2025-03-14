import React from "react";
import Spinner from "./Spinner"; // Asegúrate de importar tu componente Spinner
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"; // Asegúrate de importar los componentes de Alert
import { AlertCircle } from "lucide-react"; // Asegúrate de importar el ícono AlertCircle

interface LoadingErrorHandlerProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode; // Añade children como prop
}

const LoadingErrorHandler: React.FC<LoadingErrorHandlerProps> = ({
  loading,
  error,
  children,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si no hay ni loading ni error, renderiza el contenido principal (children)
  return <>{children}</>;
};

export default LoadingErrorHandler;
