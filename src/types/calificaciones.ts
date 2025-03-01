export interface Asignatura {
  asignatura_id: number;
  asignatura_nombre: string;
  asignatura_concepto: boolean;
}

export type CalificacionValue = number | null;

export interface CalificacionesRecord {
  [key: `calificacion${number}`]: CalificacionValue;
}

export interface EstudianteType extends CalificacionesRecord {
  id: number;
  nombre: string;
  email: string;
  clave_email: string;
  rut: string;
  curso_id: number;
  numlista: number;
  activo: boolean;
  curso_nombre: string;
  fecha_actualizacion: string;
}

export interface CalificacionesState {
  [key: string]: { [key: string]: number | string | null };
}

export const CONCEPT_MAP = {
  MB: 70,
  B: 50,
  S: 40,
  I: 30,
  Quitar: null,
} as const;
