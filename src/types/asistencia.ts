export interface AsistenciaEstudiante {
  estudiante_id: number;
  mes: number;
  anio: number;
  dias_asistidos: number;
  total_dias: number;
}

export interface AsistenciaState {
  [key: string]: {
    dias_asistidos: number;
    total_dias: number;
  };
}

export const MESES = [
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];
