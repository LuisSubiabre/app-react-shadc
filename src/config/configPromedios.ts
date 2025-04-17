// configPromedios.js

const configPromedios = {
    // A. Promedio semestral por asignatura
    promedioSemestralAsignatura: {
      aproximar: true,
      precision: 1, // se aproxima a décimas
    },
  
    // B. Promedio anual por asignatura
    promedioAnualAsignatura: {
      aproximar: true,
      precision: 1,
      reglaAproximacion: {
        base: 0.05, // a partir de la centésima 0.05 se redondea
      },
    },
  
    // C. Promedio general semestral
    promedioGeneralSemestral: {
      aproximar: false, // sin aproximación
    },
  
    // D. Promedio general anual
    promedioGeneralAnual: {
      aproximar: true,
      precision: 1,
      reglaAproximacion: {
        base: 0.05,
      },
    },
  
    // E. Reglas de promoción
    promocionEscolar: {
      considerarLogroObjetivos: true,
      considerarAsistencia: true,
    },
  };
  
  export default configPromedios;
  