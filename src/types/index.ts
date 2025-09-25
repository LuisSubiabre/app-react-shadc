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
  fecha_creacion?: Date;
  clave?: string; // Agregamos password como opcional
  curso_nombre?: string; // Agregamos curso_nombre como opcional
  acceso_encuesta_fd?: boolean; // Campo para controlar acceso a encuesta FD
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
  taller_ubicacion?: string;
  profesor_nombre?: string;
  curso_id?: number;
}

export interface Atraso {
  atraso_id: number;
  estudiante_id: number;
  fecha: string;
  hora: string;
  hora_registro: string;
  tipo: "llegada" | "jornada";
  justificado: boolean;
  observaciones: string;
  fecha_registro: string;
}

export interface TallerInscritoType {
  estudiante_id: number;
  estudiante_nombre: string;
  estudiante_email: string;
  curso_nombre: string;
  taller_id: number;
  taller_nombre: string;
  taller_descripcion: string;
  taller_horario: string;
  taller_nivel: string;
  cantidad_cupos: number;
  cantidad_inscritos: number;
  ubicacion: string;
  profesor_id: number;
  taller_fecha_creacion: string;
  taller_fecha_actualizacion: string;
}

export interface TalleresInscritosResponseType {
  message: string;
  talleres: TallerInscritoType[];
}

export interface FaltaType {
  falta_id: number;
  nombre: string;
  descripcion: string;
  color: string;
}

export interface CasoConvivenciaType {
  estudiante_nombre: string;
  curso_nombre: string;
  caso_id: number;
  estudiante_id: number;
  paso1: boolean;
  fecha_paso1: string | null;
  paso2: boolean;
  fecha_paso2: string | null;
  paso3: boolean;
  fecha_paso3: string | null;
  paso4: boolean;
  fecha_paso4: string | null;
  url: string | null;
  observaciones: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  falta_id: number;
  falta_nombre: string;
  falta_descripcion: string;
  falta_color: string;
}

export interface ComentarioConvivenciaType {
  comentario_id: number;
  caso_id: number;
  comentario: string;
  usuario_id: number;
  usuario_nombre?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AsignaturaEncuestaFDType {
  asignatura_encuesta_id: number;
  nombre: string;
  area: string;
  bloque: string;
  cupos_totales: number;
  cupos_actuales: number;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  asignatura_id: number | null;
  asignatura_nombre: string | null;
  horario: string | null;
  dia: string | null;
}

export interface PaginationType {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LinksType {
  self: string;
  next: string | null;
  previous: string | null;
}

export interface AsignaturasEncuestaFDResponseType {
  data: AsignaturaEncuestaFDType[];
  pagination: PaginationType;
  links: LinksType;
}

export interface InscritoAnteriorEncuestaFDType {
  estudiante_id: number;
  nombre_estudiante: string;
  rut: string;
  nombre_curso: string;
  nombre_asignatura_encuesta: string;
  nombre_asignatura: string;
}

// Tipos para getInscritosEncuestaFD
export interface EstudianteInscritoFDType {
  id: number;
  nombre: string;
  rut: string;
  curso: string;
}

export interface AsignaturaInscritoFDType {
  id: number;
  nombre: string;
  prioridad: number;
}

export interface InscritoFDType {
  eleccion_id: number;
  estudiante: EstudianteInscritoFDType;
  asignatura: AsignaturaInscritoFDType;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EstadisticasInscritosFDType {
  total_inscritos: number;
  por_prioridad: {
    prioridad_1: number;
    prioridad_2: number;
    prioridad_3: number;
  };
}

export interface InscritosEncuestaFDResponseType {
  asignatura_id: number;
  estadisticas: EstadisticasInscritosFDType;
  inscritos: InscritoFDType[];
}

// Tipos para inscribir estudiantes
export interface EleccionEncuestaFDType {
  asignatura_encuesta_id: number;
  prioridad: number;
}

export interface InscribirEstudianteEncuestaFDType {
  estudiante_id: number;
  elecciones: EleccionEncuestaFDType[];
}
