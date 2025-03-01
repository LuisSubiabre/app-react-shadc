// components/ErrorComponent.tsx
import React from "react";

const ErrorComponent: React.FC = () => {
  // Simula un error lanzando una excepción
  throw new Error("Este es un error simulado para probar el ErrorBoundary");
};

export default ErrorComponent;
