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

// types.ts
export interface EstudianteType {
  estudiante_id: number;
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
