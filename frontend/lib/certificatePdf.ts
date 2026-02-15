import { jsPDF } from 'jspdf';

/**
 * Generates an Escape4SDG certificate as PDF and triggers download.
 */
export function downloadCertificatePdf(options: {
  userName: string;
  courseTitle: string;
  issuedAt: string;
  filename?: string;
}): void {
  const { userName, courseTitle, issuedAt, filename = 'Escape4SDG-Sertifika.pdf' } = options;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Load the background image
  const img = new Image();
  img.src = '/images/sertifika.jpeg';

  img.onload = () => {
    // Add background image
    doc.addImage(img, 'JPEG', 0, 0, w, h);

    // Participant name - Centered below "This is to certify that"
    // Adjust Y coordinate based on the template
    doc.setFontSize(24);
    doc.setTextColor(30, 41, 59); // Dark slate
    doc.setFont('helvetica', 'bold');
    doc.text(userName, w / 2, 95, { align: 'center' });

    // Course name - Centered below "has successfully completed..."
    doc.setFontSize(20);
    doc.setTextColor(20, 184, 166); // Teal
    doc.setFont('helvetica', 'bold');
    doc.text(courseTitle, w / 2, 125, { align: 'center', maxWidth: w - 60 });

    // Date - Bottom right or where appropriate
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date(issuedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    // Assuming there is a space for date or we just place it at the bottom
    doc.text(`Tarih: ${dateStr}`, w - 20, h - 20, { align: 'right' });

    doc.save(filename);
  };

  img.onerror = () => {
    // Fallback if image fails to load
    console.error('Certificate background failed to load');
    doc.text('Certificate Generation Failed - Image not found', 10, 10);
    doc.save('error.pdf');
  };
}
