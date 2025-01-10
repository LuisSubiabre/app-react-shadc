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

export interface AsignaturasResponse {
  info: {
    count: number;
    pages: number;
    currentPage: number;
    next: string | null;
    prev: string | null;
  };
  asignaturas: Asignatura[];
}
