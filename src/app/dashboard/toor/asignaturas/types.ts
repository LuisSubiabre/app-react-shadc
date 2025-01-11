export interface Link {
  rel: string;
  href: string;
  method: string;
}

export interface Asignatura {
  asignatura_id: number;
  nombre: string;
  descripcion: string;
  indice: number;
  concepto: boolean;
  codigo_sige: number;
  nivel_educativo: number;
  es_comun: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  links: Link[];
}

export interface AsignaturaCursoUsuario {
  asignatura_id: number;
  curso_id: number;
  profesor_id: number;
}

export interface AsignacionPendiente {
  curso_id: number;
  usuarios: number[];
}

export interface AsignaturaCursoResponse {
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

export interface AsignaturasResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  asignaturas: Asignatura[];
}
