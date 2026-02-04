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
  const w = doc.getPageWidth();
  const h = doc.getPageHeight();

  // Background tint
  doc.setFillColor(240, 253, 244); // teal-50
  doc.rect(0, 0, w, h, 'F');

  // Border
  doc.setDrawColor(20, 184, 166); // teal-500
  doc.setLineWidth(1.5);
  doc.rect(8, 8, w - 16, h - 16);

  // Escape4SDG logo text
  doc.setFontSize(28);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text('Escape4SDG', w / 2, 32, { align: 'center' });

  // Certificate title
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('SERTİFİKA', w / 2, 48, { align: 'center' });

  // Course name
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(courseTitle, w / 2, 72, { align: 'center', maxWidth: w - 40 });

  // "This certifies that"
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Bu sertifika aşağıda adı geçen kişinin ilgili kursu başarıyla tamamladığını doğrular.', w / 2, 95, { align: 'center' });

  // Participant name
  doc.setFontSize(22);
  doc.setTextColor(20, 184, 166);
  doc.setFont('helvetica', 'bold');
  doc.text(userName, w / 2, 115, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date(issuedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Tarih: ${dateStr}`, w / 2, 135, { align: 'center' });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Escape4SDG – Sürdürülebilir Kalkınma Hedefleri için Eğitim', w / 2, h - 20, { align: 'center' });

  doc.save(filename);
}
