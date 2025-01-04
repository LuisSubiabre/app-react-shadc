// types.ts
export interface Curso {
  id: number;
  nombre: string;
  descripcion?: string;
  indice: number;
  profesor_jefe_id: number;
  codigo_ensenanza: number;
  jefatura?: string;
}
