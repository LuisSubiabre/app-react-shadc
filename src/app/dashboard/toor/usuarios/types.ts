// types.ts
export interface User {
  id: number;
  nombre: string;
  email: string;
  rut?: string;
  activo: boolean;
  fecha_actualizacion: string;
  clave?: string; // Agregamos password como opcional
}
