import { EstudianteType } from "@/types";

export const printAtraso = async (
  estudiante: EstudianteType,
  hora: string,
  tipo: "llegada" | "jornada" = "llegada"
): Promise<boolean> => {
  try {
    console.log("Iniciando proceso de impresión para:", estudiante.nombre);
    
    // Crear el contenido HTML para el ticket
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Atraso - ${estudiante.nombre}</title>
          <meta charset="utf-8">
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 15px;
              width: 80mm;
              font-size: 12px;
              line-height: 1.4;
            }
            .ticket {
              border: 2px solid #000;
              padding: 10px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .logo {
              width: 50mm;
              height: auto;
              margin: 0 auto 10px;
              display: block;
            }
            .header h1 {
              margin: 0;
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .header h2 {
              margin: 5px 0;
              font-size: 14px;
              font-weight: bold;
            }
            .info {
              margin: 15px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              border-bottom: 1px dotted #ccc;
              padding-bottom: 3px;
            }
            .info-label {
              font-weight: bold;
              min-width: 80px;
            }
            .info-value {
              text-align: right;
              flex: 1;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 2px solid #000;
            }
            .tipo-atraso {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              color: #d32f2f;
            }
            .timestamp {
              font-size: 10px;
              color: #666;
              margin-top: 10px;
            }
            @media print {
              body {
                width: 80mm;
                padding: 0;
                margin: 0;
              }
              .ticket {
                border: none;
                padding: 5px;
              }
              .no-print {
                display: none !important;
              }
            }
            .no-print {
              text-align: center;
              margin-top: 20px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .no-print button {
              background: #007bff;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              margin: 5px;
            }
            .no-print button:hover {
              background: #0056b3;
            }
            .error-message {
              color: #d32f2f;
              font-weight: bold;
              text-align: center;
              margin: 10px 0;
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

            <div class="footer">
              <div class="tipo-atraso">
                ${tipo === "llegada" ? "ATRASO EN LLEGADA" : "ATRASO EN JORNADA"}
              </div>
              <div class="timestamp">
                Generado: ${new Date().toLocaleString('es-CL')}
              </div>
            </div>
          </div>

          <div class="no-print">
            <button onclick="imprimirTicket()">🖨️ Imprimir Ticket</button>
            <button onclick="window.close()" style="background: #6c757d;">❌ Cerrar</button>
            <button onclick="descargarPDF()" style="background: #28a745;">📄 Descargar PDF</button>
          </div>

          <script>
            function imprimirTicket() {
              try {
                window.print();
                console.log('Comando de impresión ejecutado');
              } catch (error) {
                console.error('Error al imprimir:', error);
                console.error('Error al imprimir:', error.message);
              }
            }
            
            function descargarPDF() {
              try {
                // Crear un enlace de descarga
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
                console.error('Error al descargar:', error.message);
              }
            }
            
            // Auto-imprimir después de un breve delay
            setTimeout(() => {
              console.log('Auto-imprimiendo ticket...');
              imprimirTicket();
            }, 1000);
            
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

    // Estrategia 1: Intentar abrir ventana nueva
    try {
      const printWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
      if (printWindow) {
        console.log("Ventana de impresión abierta exitosamente");
        
        // Escribir el contenido en la nueva ventana
        printWindow.document.write(content);
        printWindow.document.close();

        // Esperar a que se cargue el contenido
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

        // Ejecutar la impresión
        console.log('Ejecutando impresión...');
        printWindow.print();

        // Cerrar la ventana después de un tiempo
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        }, 5000);

        console.log('Proceso de impresión completado exitosamente');
        return true;
      }
    } catch (windowError) {
      console.warn("No se pudo abrir ventana nueva:", windowError);
    }

    // Estrategia 2: Crear un iframe oculto
    try {
      console.log("Intentando estrategia alternativa con iframe...");
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();
        
        // Esperar a que se cargue
        await new Promise<void>((resolve) => {
          iframe.onload = () => resolve();
          setTimeout(() => resolve(), 1000);
        });
        
        // Imprimir desde el iframe
        iframe.contentWindow?.print();
        
        // Remover el iframe después de un tiempo
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
        
        console.log('Impresión desde iframe completada');
        return true;
      }
    } catch (iframeError) {
      console.warn("Error con iframe:", iframeError);
    }

    // Estrategia 3: Crear elemento temporal en la página actual
    try {
      console.log("Intentando estrategia con elemento temporal...");
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Esperar un momento para que se renderice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Imprimir la página completa
      window.print();
      
      // Remover el elemento temporal
      setTimeout(() => {
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
      }, 1000);
      
      console.log('Impresión desde elemento temporal completada');
      return true;
      
    } catch (tempError) {
      console.warn("Error con elemento temporal:", tempError);
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
