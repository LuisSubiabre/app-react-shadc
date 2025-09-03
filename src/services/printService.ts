import { EstudianteType } from "@/types";

export const printAtraso = async (
  estudiante: EstudianteType,
  hora: string,
  tipo: "llegada" | "jornada"
): Promise<boolean> => {
  try {
    // Crear una nueva ventana para la impresión
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("No se pudo abrir la ventana de impresión");
    }

    // Generar el contenido HTML para el ticket
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Atraso</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              width: 80mm;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .logo {
              width: 40mm;
              height: auto;
              margin: 0 auto 10px;
              display: block;
            }
            .header h2 {
              margin: 0;
              font-size: 18px;
            }
            .info {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 10px;
            }
            @media print {
              body {
                width: 80mm;
                padding: 0;
              }
              .no-print {
                display: none;
              }
              .logo {
                width: 40mm;
                height: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://res.cloudinary.com/dx219dazh/image/upload/v1741693182/varios/e8ublpwdsj4j2kz0h8mp.png" alt="Logo" class="logo" />
            <h2>TICKET DE ATRASO</h2>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
            <p>Hora: ${hora}</p>
          </div>
          
          <div class="info">
            <p><strong>Estudiante:</strong> ${estudiante.nombre}</p>
            <p><strong>RUT:</strong> ${estudiante.rut}</p>
            <p><strong>Curso:</strong> ${estudiante.curso_nombre}</p>
          </div>

          <div class="footer">
            <p><strong>Tipo: Atraso ${tipo === 'llegada' ? 'Llegada' : 'Jornada'}</strong></p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.close()">Cerrar</button>
          </div>
        </body>
      </html>
    `;

    // Escribir el contenido en la nueva ventana
    printWindow.document.write(content);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y la imagen
    printWindow.onload = () => {
      // Imprimir una sola vez
      printWindow.print();

      // Cerrar la ventana después de un tiempo
      setTimeout(() => {
        printWindow.close();
      }, 2000);
    };

    return true;
  } catch (error) {
    console.error("Error al imprimir el ticket:", error);
    return false;
  }
};
