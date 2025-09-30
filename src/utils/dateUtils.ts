/**
 * Utilidades para el manejo consistente de fechas en zona horaria de Magallanes (UTC-3)
 */

/**
 * Formatea una fecha ISO string a formato dd/MM/yyyy
 * @param fechaStr - Fecha en formato ISO string (UTC)
 * @returns Fecha formateada como dd/MM/yyyy
 */
export const formatearFechaMagallanes = (fechaStr: string): string => {
  try {
    // Crear una fecha desde el string ISO
    const fecha = new Date(fechaStr);
    
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      console.error('Fecha inválida:', fechaStr);
      return 'Fecha inválida';
    }
    
    // Para fechas en UTC con hora 00:00:00, extraer directamente la fecha UTC
    // ya que representan el día completo sin necesidad de conversión de zona horaria
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getUTCFullYear();
    
    return `${dia}/${mes}/${año}`;
  } catch (error) {
    console.error('Error al formatear fecha:', fechaStr, error);
    return 'Error en fecha';
  }
};

/**
 * Formatea una fecha ISO string a formato localizado
 * @param fechaStr - Fecha en formato ISO string (UTC)
 * @returns Fecha formateada según configuración local
 */
export const formatearFechaLocalizadaMagallanes = (fechaStr: string): string => {
  try {
    // Crear una fecha desde el string ISO
    const fecha = new Date(fechaStr);
    
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
      console.error('Fecha inválida:', fechaStr);
      return 'Fecha inválida';
    }
    
    // Para fechas en UTC con hora 00:00:00, usar directamente la fecha UTC
    // ya que representan el día completo sin necesidad de conversión de zona horaria
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC' // Forzar uso de UTC para evitar conversiones de zona horaria
    });
  } catch (error) {
    console.error('Error al formatear fecha localizada:', fechaStr, error);
    return 'Error en fecha';
  }
};

/**
 * Obtiene la fecha actual en zona horaria de Magallanes
 * @returns Fecha actual formateada como dd/MM/yyyy en zona horaria de Magallanes
 */
export const obtenerFechaActualMagallanes = (): string => {
  const ahora = new Date();
  const fechaMagallanes = new Date(ahora.getTime() - (3 * 60 * 60 * 1000));
  
  const dia = fechaMagallanes.getUTCDate().toString().padStart(2, '0');
  const mes = (fechaMagallanes.getUTCMonth() + 1).toString().padStart(2, '0');
  const año = fechaMagallanes.getUTCFullYear();
  
  return `${dia}/${mes}/${año}`;
};

/**
 * Crea una fecha UTC a partir de componentes de fecha y hora en zona horaria de Magallanes
 * @param year - Año
 * @param month - Mes (1-12)
 * @param day - Día
 * @param hours - Hora (0-23)
 * @param minutes - Minutos (0-59)
 * @returns Fecha en formato ISO string (UTC)
 */
export const crearFechaUTCMagallanes = (
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0
): string => {
  // Crear fecha en UTC directamente con los componentes
  const fechaUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  return fechaUTC.toISOString();
};
