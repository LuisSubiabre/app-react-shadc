import { EstudianteType } from "@/types";

// Configuración de impresora
export interface PrinterConfig {
  type: 'thermal' | 'laser' | 'inkjet' | 'auto';
  width: string;
  fontSize: string;
  lineHeight: string;
  margins: string;
}

// Configuración por defecto para impresoras térmicas
export const DEFAULT_THERMAL_CONFIG: PrinterConfig = {
  type: 'thermal',
  width: '80mm',
  fontSize: '8px',
  lineHeight: '1.0',
  margins: '2mm'
};

// Configuración por defecto para impresoras láser/inkjet
export const DEFAULT_STANDARD_CONFIG: PrinterConfig = {
  type: 'laser',
  width: '80mm',
  fontSize: '10px',
  lineHeight: '1.2',
  margins: '5mm'
};

// Función para obtener la configuración de impresora
export const getPrinterConfig = (): PrinterConfig => {
  try {
    const savedConfig = localStorage.getItem('printerConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.warn('No se pudo cargar configuración de impresora:', error);
  }
  
  // Intentar detectar automáticamente
  return detectPrinterType();
};

// Función para detectar automáticamente el tipo de impresora
export const detectPrinterType = (): PrinterConfig => {
  // Por defecto, asumir impresora térmica para mejor compatibilidad
  return DEFAULT_THERMAL_CONFIG;
};

// Función para guardar la configuración de impresora
export const savePrinterConfig = (config: PrinterConfig): void => {
  try {
    localStorage.setItem('printerConfig', JSON.stringify(config));
    console.log('Configuración de impresora guardada:', config);
  } catch (error) {
    console.error('Error al guardar configuración de impresora:', error);
  }
};

// Función para generar ticket en formato de texto plano (mejor para impresoras térmicas)
export const printAtrasoTextoPlano = async (
  estudiante: EstudianteType,
  hora: string,
  tipo: "llegada" | "jornada" = "llegada",
  config: PrinterConfig = DEFAULT_THERMAL_CONFIG
): Promise<boolean> => {
  try {
    console.log("Iniciando impresión de texto plano para:", estudiante.nombre);
    console.log("Configuración de impresora:", config);
    
    // Crear contenido de texto plano muy simple
    const fecha = new Date().toLocaleDateString('es-CL');
    const timestamp = new Date().toLocaleString('es-CL');
    
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket Atraso - Texto Plano</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: ${config.width} auto;
              margin: 0;
            }
            
            body {
              font-family: monospace;
              width: ${config.width};
              margin: 0;
              padding: ${config.margins};
              font-size: ${config.fontSize};
              line-height: ${config.lineHeight};
              background: white;
              color: black;
              white-space: pre;
            }
            
            .ticket {
              width: 100%;
              text-align: center;
              font-family: 'Courier New', monospace;
            }
            
            .centered {
              text-align: center;
            }
            
            .left {
              text-align: left;
            }
            
            .separator {
              text-align: center;
              margin: 1mm 0;
            }
            
            @media print {
              body {
                width: ${config.width} !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              
              .ticket {
                padding: 1mm !important;
              }
              
              .no-print {
                display: none !important;
              }
            }
            
            .no-print {
              text-align: center;
              margin-top: 3mm;
              padding: 2mm;
              background: #f5f5f5;
            }
            
            .no-print button {
              background: #007bff;
              color: white;
              border: none;
              padding: 1mm 2mm;
              border-radius: 1mm;
              cursor: pointer;
              font-size: 8px;
              margin: 0.5mm;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="centered">
              ========================================
              <br>
              <br>
              <strong>LICEO EXPERIMENTAL</strong>
              <br>
              <strong>TICKET DE ATRASO</strong>
              <br>
              <br>
              ========================================
              <br>
              <br>
              <div class="left">
                <strong>Estudiante:</strong> ${estudiante.nombre}
                <br>
                <strong>RUT:</strong> ${estudiante.rut || 'N/A'}
                <br>
                <strong>Curso:</strong> ${estudiante.curso_nombre || 'N/A'}
                <br>
                <strong>Fecha:</strong> ${fecha}
                <br>
                <strong>Hora:</strong> ${hora}
                <br>
                <br>
                ========================================
                <br>
                <br>
                <div class="centered">
                  <strong>${tipo === "llegada" ? "ATRASO EN LLEGADA" : "ATRASO EN JORNADA"}</strong>
                  <br>
                  <br>
                  Generado: ${timestamp}
                  <br>
                  <br>
                  ========================================
                </div>
              </div>
            </div>
          </div>

          <div class="no-print">
            <button onclick="imprimirTicket()">🖨️ Imprimir</button>
            <button onclick="window.close()" style="background: #6c757d;">❌ Cerrar</button>
          </div>

          <script>
            function imprimirTicket() {
              try {
                window.print();
                console.log('Impresión de texto plano ejecutada');
              } catch (error) {
                console.error('Error al imprimir:', error);
              }
            }
            
            // Auto-imprimir después de un delay
            setTimeout(() => {
              console.log('Auto-imprimiendo ticket de texto plano...');
              imprimirTicket();
            }, 800);
          </script>
        </body>
      </html>
    `;

    // Abrir ventana específica para texto plano
    const printWindow = window.open("", "_blank", "width=320,height=400,scrollbars=no,resizable=no,menubar=no,toolbar=no,location=no,status=no");
    if (printWindow) {
      console.log("Ventana de texto plano abierta");
      
      printWindow.document.write(content);
      printWindow.document.close();

      // Esperar a que se cargue y luego imprimir
      await new Promise<void>((resolve) => {
        const checkReady = () => {
          if (printWindow.document.readyState === 'complete') {
            console.log('Ventana de texto plano lista');
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });

      // Imprimir con delay
      setTimeout(() => {
        printWindow.print();
      }, 600);

      // Cerrar ventana después de un tiempo
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
      }, 8000);

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error en impresión de texto plano:", error);
    return false;
  }
};

export const printAtraso = async (
  estudiante: EstudianteType,
  hora: string,
  tipo: "llegada" | "jornada" = "llegada"
): Promise<boolean> => {
  try {
    console.log("Iniciando proceso de impresión para:", estudiante.nombre);
    
    // Obtener configuración de impresora
    const printerConfig = getPrinterConfig();
    console.log("Configuración de impresora:", printerConfig);
    
    // Si es impresora térmica, usar la versión optimizada
    if (printerConfig.type === 'thermal') {
      console.log("Usando impresión optimizada para impresora térmica");
      const textoPlanoResult = await printAtrasoTextoPlano(estudiante, hora, tipo, printerConfig);
      if (textoPlanoResult) {
        console.log("Impresión térmica exitosa");
        return true;
      }
    }
    
    // Si no es térmica o falló, usar método estándar
    console.log("Usando método de impresión estándar...");
    
    // Crear el contenido HTML para el ticket
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Atraso - ${estudiante.nombre}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: ${printerConfig.width} auto;
              margin: 0;
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Courier New', monospace;
              width: ${printerConfig.width};
              font-size: ${printerConfig.fontSize};
              line-height: ${printerConfig.lineHeight};
              background: white;
              color: black;
            }
            
            .ticket {
              width: 100%;
              padding: ${printerConfig.margins};
            }
            
            .header {
              text-align: center;
              border-bottom: 1px solid black;
              padding-bottom: 3mm;
              margin-bottom: 3mm;
            }
            
            .logo {
              width: 40mm;
              height: auto;
              margin: 0 auto 2mm;
              display: block;
            }
            
            .header h1 {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 1mm 0;
            }
            
            .header h2 {
              font-size: 12px;
              font-weight: bold;
              margin: 1mm 0;
            }
            
            .info {
              margin: 3mm 0;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
              padding: 1mm 0;
              border-bottom: 1px dotted #999;
            }
            
            .info-label {
              font-weight: bold;
              min-width: 25mm;
            }
            
            .info-value {
              text-align: right;
              flex: 1;
            }
            
            .footer {
              text-align: center;
              margin-top: 3mm;
              padding-top: 3mm;
              border-top: 1px solid black;
            }
            
            .tipo-atraso {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              color: black;
              margin: 2mm 0;
            }
            
            .timestamp {
              font-size: 8px;
              color: #666;
              margin-top: 2mm;
            }
            
            .separator {
              text-align: center;
              margin: 3mm 0;
              font-size: 8px;
              color: #999;
            }
            
            @media print {
              body {
                width: ${printerConfig.width} !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              
              .ticket {
                padding: 2mm !important;
              }
              
              .no-print {
                display: none !important;
              }
              
              /* Forzar colores para impresión */
              * {
                color: black !important;
                background: white !important;
              }
            }
            
            .no-print {
              text-align: center;
              margin-top: 10mm;
              padding: 3mm;
              background: #f5f5f5;
              border-radius: 2mm;
            }
            
            .no-print button {
              background: #007bff;
              color: white;
              border: none;
              padding: 2mm 4mm;
              border-radius: 1mm;
              cursor: pointer;
              font-size: 10px;
              margin: 1mm;
            }
            
            .no-print button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <img src="https://res.cloudinary.com/dx219dazh/image/upload/v1741693182/varios/e8ublpwdsj4j2kz0h8mp.png" alt="Logo Liceo Experimental" class="logo" />
              <h1>Liceo Experimental</h1>
              <h2>TICKET DE ATRASO</h2>
            </div>
            
            <div class="info">
              <div class="info-row">
                <span class="info-label">Estudiante:</span>
                <span class="info-value">${estudiante.nombre}</span>
              </div>
              <div class="info-row">
                <span class="info-label">RUT:</span>
                <span class="info-value">${estudiante.rut || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Curso:</span>
                <span class="info-value">${estudiante.curso_nombre || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Fecha:</span>
                <span class="info-value">${new Date().toLocaleDateString('es-CL')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Hora:</span>
                <span class="info-value">${hora}</span>
              </div>
            </div>

            <div class="separator">--------------------------------</div>

            <div class="footer">
              <div class="tipo-atraso">
                ${tipo === "llegada" ? "ATRASO EN LLEGADA" : "ATRASO EN JORNADA"}
              </div>
              <div class="timestamp">
                Generado: ${new Date().toLocaleString('es-CL')}
              </div>
            </div>
            
            <div class="separator">--------------------------------</div>
          </div>

          <div class="no-print">
            <button onclick="imprimirTicket()">🖨️ Imprimir Ticket</button>
            <button onclick="window.close()" style="background: #6c757d;">❌ Cerrar</button>
            <button onclick="descargarPDF()" style="background: #28a745;">📄 Descargar PDF</button>
          </div>

          <script>
            function imprimirTicket() {
              try {
                // Configurar opciones de impresión específicas
                const printOptions = {
                  silent: false,
                  printBackground: false,
                  color: false,
                  margin: {
                    marginType: 'none'
                  },
                  landscape: false,
                  pagesPerSheet: 1,
                  collate: false,
                  copies: 1
                };
                
                // Intentar usar la API de impresión moderna si está disponible
                if (window.print) {
                  window.print();
                  console.log('Comando de impresión ejecutado');
                } else {
                  console.error('API de impresión no disponible');
                }
              } catch (error) {
                console.error('Error al imprimir:', error);
              }
            }
            
            function descargarPDF() {
              try {
                const element = document.createElement('a');
                const htmlContent = document.documentElement.outerHTML;
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                
                element.href = url;
                element.download = 'ticket-atraso-${estudiante.nombre.replace(/[^a-zA-Z0-9]/g, '-')}.html';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                URL.revokeObjectURL(url);
                
                console.log('Descarga iniciada');
              } catch (error) {
                console.error('Error al descargar:', error);
              }
            }
            
            // Auto-imprimir después de un breve delay
            setTimeout(() => {
              console.log('Auto-imprimiendo ticket...');
              imprimirTicket();
            }, 1500);
            
            // Verificar si el documento está listo
            if (document.readyState === 'complete') {
              console.log('Documento completamente cargado');
            } else {
              document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM completamente cargado');
              });
            }
          </script>
        </body>
      </html>
    `;

    // Estrategia 1: Intentar abrir ventana nueva con configuración específica
    try {
      const printWindow = window.open("", "_blank", "width=400,height=600,scrollbars=no,resizable=no,menubar=no,toolbar=no");
      if (printWindow) {
        console.log("Ventana de impresión abierta exitosamente");
        
        // Escribir el contenido en la nueva ventana
        printWindow.document.write(content);
        printWindow.document.close();

        // Esperar a que se cargue el contenido completamente
        await new Promise<void>((resolve) => {
          const checkReady = () => {
            if (printWindow.document.readyState === 'complete') {
              console.log('Ventana de impresión lista');
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });

        // Ejecutar la impresión con delay adicional
        setTimeout(() => {
          console.log('Ejecutando impresión...');
          printWindow.print();
        }, 500);

        // Cerrar la ventana después de un tiempo
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        }, 8000);

        console.log('Proceso de impresión completado exitosamente');
        return true;
      }
    } catch (windowError) {
      console.warn("No se pudo abrir ventana nueva:", windowError);
    }

    // Estrategia 2: Crear un iframe oculto con configuración específica
    try {
      console.log("Intentando estrategia alternativa con iframe...");
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = printerConfig.width;
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();
        
        // Esperar a que se cargue
        await new Promise<void>((resolve) => {
          iframe.onload = () => resolve();
          setTimeout(() => resolve(), 1500);
        });
        
        // Imprimir desde el iframe con delay
        setTimeout(() => {
          iframe.contentWindow?.print();
        }, 500);
        
        // Remover el iframe después de un tiempo
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 8000);
        
        console.log('Impresión desde iframe completada');
        return true;
      }
    } catch (iframeError) {
      console.warn("Error con iframe:", iframeError);
    }

    // Si todas las estrategias fallan, mostrar el ticket en una nueva pestaña
    console.log("Todas las estrategias fallaron, abriendo en nueva pestaña...");
    
    try {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(content);
        newTab.document.close();
        
        // Mostrar mensaje en consola
        console.log("No se pudo imprimir automáticamente. Se abrió el ticket en una nueva pestaña. Usa Ctrl+P para imprimir manualmente.");
        
        return true;
      }
    } catch (finalError) {
      console.error("Error final:", finalError);
    }

    return false;

  } catch (error) {
    console.error("Error al imprimir el ticket:", error);
    return false;
  }
};
