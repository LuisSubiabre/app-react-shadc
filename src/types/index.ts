export interface CursoType {
  curso_id: number;
  curso_nombre: string;
  curso_descripcion: string;
  curso_indice: number;
  curso_codigo_ensenanza: number;
  curso_fecha_creacion: string;
  curso_fecha_actualizacion: string;
  curso_profesor_jefe_id: number;
  usuario_id: number;
  usuario_nombre: string;
}
export interface CursoApiResponseType {
  id: number;
  nombre: string;
  jefatura: string;
  email_jefatura: string;
  indice: number;
  profesor_jefe_id: number;
  descripcion: string;
  codigo_ensenanza: number;
}

// types.ts
export interface EstudianteType {
  id: number;
  nombre: string;
  email: string;
  clave_email: string;
  rut?: string;
  curso_id: number;
  numlista: number;
  activo: boolean;
  fecha_actualizacion: string;
  clave?: string; // Agregamos password como opcional
  curso_nombre?: string; // Agregamos curso_nombre como opcional
}

export interface RolType {
  id: number;
  nombre: string;
  descripcion?: string;
}
export interface FuncionarioType {
  id: number;
  nombre: string;
  email: string;
  rut?: string;
  activo: boolean;
  fecha_actualizacion: string;
  clave?: string; // Agregamos password como opcional
}
