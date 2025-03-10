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
  estudiante_id?: number;
  nombre: string;
  estudiante_nombre?: string;
  email: string;
  clave_email: string;
  rut?: string;
  curso_id: number;
  numlista: number;
  activo: boolean;
  fecha_actualizacion: string;
  clave?: string; // Agregamos password como opcional
  curso_nombre?: string; // Agregamos curso_nombre como opcional
  calificacion1?: number | null;
  calificacion2?: number | null;
  calificacion3?: number | null;
  calificacion4?: number | null;
  calificacion5?: number | null;
  calificacion6?: number | null;
  calificacion7?: number | null;
  calificacion8?: number | null;
  calificacion9?: number | null;
  calificacion10?: number | null;
  calificacion11?: number | null;
  calificacion12?: number | null;
  calificacion13?: number | null;
  calificacion14?: number | null;
  calificacion15?: number | null;
  calificacion16?: number | null;
  calificacion17?: number | null;
  calificacion18?: number | null;
  calificacion19?: number | null;
  calificacion20?: number | null;
  calificacion21?: number | null;
  calificacion22?: number | null;
  calificacion23?: number | null;
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

/* Asignaturas */
export interface Link {
  rel: string;
  href: string;
  method: string;
}

export interface AsignaturaType {
  asignatura_id: number;
  nombre: string;
  descripcion: string;
  indice: number;
  concepto: boolean;
  codigo_sige: number;
  nivel_educativo: number;
  es_comun: boolean;
}

export interface AsignaturaCursoUsuarioType {
  asignatura_id: number;
  curso_id: number;
  profesor_id: number;
}

export interface AsignacionPendienteType {
  curso_id: number;
  usuarios: number[];
}

export interface AsignaturaCursoResponseType {
  asignatura_id: number;
  curso_id: number;
  profesor_id: number;
  asignatura_nombre: string;
  curso_nombre: string;
  curso_descripcion: string;
  profesor_nombre: string;
  profesor_email: string;
}

export interface ApiResponse<T> {
  data: T[];
  links: Link[];
}

export interface AsignaturasResponseType {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  asignaturas: AsignaturaType[];
}

export interface TallerType {
  taller_id: number;
  taller_nombre: string;
  taller_descripcion: string;
  taller_horario: string;
  taller_nivel: string;
  taller_cantidad_cupos: number;
  taller_cantidad_inscritos?: number;
  taller_profesor_id: number;
  profesor_nombre?: string;
  curso_id?: number;
}
