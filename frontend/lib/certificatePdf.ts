import { jsPDF } from 'jspdf';

/**
 * Generates an Escape4SDG certificate as PDF and triggers download.
 * Uses a canvas-based rendering approach to support Unicode (Turkish) characters
 * and maintain consistent styling with the on-screen preview.
 */
export function downloadCertificatePdf(options: {
  userName: string;
  courseTitle: string;
  issuedAt: string;
  filename?: string;
}): void {
  const { userName, courseTitle, issuedAt, filename = 'Escape4SDG-Sertifika.pdf' } = options;

  // A4 Landscape size in mm
  const pdfW = 297;
  const pdfH = 210;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Load the background image
  const img = new Image();
  img.src = '/images/sertifika.jpeg';

  img.onload = () => {
    // 1. Add background image
    doc.addImage(img, 'JPEG', 0, 0, pdfW, pdfH);

    // 2. Create a high-resolution canvas to render the text precisely
    // Using a 4:1 scale factor for sharp text in PDF
    const scale = 4;
    const canvas = document.createElement('canvas');
    canvas.width = pdfW * scale;
    canvas.height = pdfH * scale;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- RENDER USER NAME ---
    // Match reverted CertificateClient.tsx: top: 43%
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';

    // Size adjusted to match visual weight
    ctx.font = `italic 600 ${14 * scale}px Palatino, "Book Antiqua", Georgia, serif`;
    ctx.fillStyle = '#1e293b'; // text-stone-800

    const nameX = canvas.width / 2;
    const nameY = canvas.height * 0.485; // Visually tuned to sit on the line
    ctx.fillText(userName, nameX, nameY);

    // --- RENDER COURSE TITLE ---
    // Match reverted CertificateClient.tsx: top: 69%
    ctx.font = `italic bold ${11 * scale}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = '#0f766e'; // text-teal-700

    const courseX = canvas.width / 2;
    const courseY = canvas.height * 0.735; // Visually tuned to fit the template gap
    ctx.fillText(courseTitle, courseX, courseY);

    // 3. Add the rendered text layer as an image over the background
    const textLayerData = canvas.toDataURL('image/png');
    doc.addImage(textLayerData, 'PNG', 0, 0, pdfW, pdfH);

    // 4. Save the PDF
    doc.save(filename);
  };

  img.onerror = () => {
    doc.text('Certificate Generation Failed - Image not found', 10, 10);
    doc.save('error.pdf');
  };
}
