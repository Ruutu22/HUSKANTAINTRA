import html2pdf from 'html2pdf.js';

function addWatermark(element: HTMLElement): HTMLElement {
  // Create wrapper with watermark
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = '100%';
  
  // Add watermark text overlay
  const watermark = document.createElement('div');
  watermark.innerHTML = '.ruutu HUS';
  watermark.style.position = 'absolute';
  watermark.style.bottom = '20mm';
  watermark.style.right = '20mm';
  watermark.style.fontSize = '12px';
  watermark.style.color = '#999';
  watermark.style.fontFamily = 'Arial, sans-serif';
  watermark.style.zIndex = '1';
  
  wrapper.appendChild(element.cloneNode(true));
  wrapper.appendChild(watermark);
  return wrapper;
}

/**
 * Convert HTML form content to PDF and return as data URL
 * @param htmlContent The HTML content to convert
 * @param filename The name of the PDF file
 * @returns Promise<string> Data URL of the PDF
 */
export async function convertHtmlToPdf(htmlContent: string, filename: string = 'document.pdf'): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Remove any script tags for security
      const sanitizedHtml = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      const element = document.createElement('div');
      element.innerHTML = sanitizedHtml;
      const elementWithWatermark = addWatermark(element);
      
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf().set(opt).from(elementWithWatermark).toPdf().output('dataurlstring').then((pdfAsString: string) => {
        resolve(pdfAsString);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert HTML form to PDF and download it
 * @param htmlContent The HTML content to convert
 * @param filename The name of the PDF file to download
 */
export async function downloadHtmlAsPdf(htmlContent: string, filename: string = 'document.pdf'): Promise<void> {
  try {
    const pdfUrl = await convertHtmlToPdf(htmlContent, filename);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

/**
 * Convert HTML form to PDF and return as Blob
 * @param htmlContent The HTML content to convert
 * @returns Promise<Blob> The PDF as a Blob
 */
export async function convertHtmlToPdfBlob(htmlContent: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const sanitizedHtml = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      const element = document.createElement('div');
      element.innerHTML = sanitizedHtml;
      const elementWithWatermark = addWatermark(element);
      
      const opt = {
        margin: 10,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf().set(opt).from(elementWithWatermark).toPdf().output('blob').then((pdf: Blob) => {
        resolve(pdf);
      });
    } catch (error) {
      reject(error);
    }
  });
}
