// src/context/AuthContext.tsx
import { createContext } from "react";

// Definir la interfaz de Usuario
interface User {
  id: string;
  nombre: string;
  email: string;
  roles: number[];
  cursos: number[];
}

// Definir la interfaz para el contexto de autenticación
export interface AuthContextType {
  auth: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  authToken: string | null;
}

// Crear el contexto con un valor inicial de null
export const AuthContext = createContext<AuthContextType | null>(null);
