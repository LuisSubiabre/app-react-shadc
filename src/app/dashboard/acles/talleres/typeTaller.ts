export interface Taller {
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
