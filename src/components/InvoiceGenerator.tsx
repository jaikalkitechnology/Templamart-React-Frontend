import React from "react";
import jsPDF from "jspdf";

type Purchase = {
  id: string;
  date?: string;
  template?: string;
  templateId?: string;
  price: number; // incoming amount (original)
};

type Buyer = {
  full_name: string;
  email: string;
};

type Company = {
  name: string;
  addressLines: string[];
  phone?: string;
  email?: string;
  gstin?: string;
};

const inr = (v: number) => `INR ${v.toFixed(2)}`; // use ASCII INR to avoid glyph issues

const formatDate = (d?: string) => {
  if (!d) return new Date().toLocaleDateString("en-IN");
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-IN");
};

function fitTextToWidth(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  initialFontSize = 11,
  fontName = "helvetica",
  fontStyle = "normal",
  minFontSize = 6
) {
  let size = initialFontSize;
  doc.setFont(fontName as any, fontStyle as any);
  doc.setFontSize(size);
  let textWidth = doc.getTextWidth(text) * (doc.getFontSize() / 1);
  while (size > minFontSize && textWidth > maxWidth) {
    size -= 0.5;
    doc.setFontSize(size);
    textWidth = doc.getTextWidth(text) * (doc.getFontSize() / 1);
  }
  return size;
}

const InvoiceGenerator: React.FC<{
  purchase: Purchase;
  buyer: Buyer;
  company?: Company;
}> = ({ purchase, buyer, company }) => {
  const defaultCompany = {
    name: "AHG DEVELOPMENT PRIVATE LIMITED",
    addressLines: [
      "C/o Mohammad Sahat, Ratipura,",
      "Mohalla Ratipura, Mahoba, Mahoba,",
      "Uttar Pradesh, 210427",
    ],
    phone: "+91 9584027396",
    email: "ahgdevelop2@gmail.com",
    gstin: "09ABBCA1619E1Z2",
  };

  const comp = company || defaultCompany;

  const download = () => {
  const origAmount = Number(purchase.price || 0);

// Extract GST (inclusive calculation)
const netAmount = Number((origAmount / 1.18).toFixed(2));  // base price without GST
const gstAmount = Number((origAmount - netAmount).toFixed(2)); // GST portion

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const left = 40;
    const rightLimit = 555;
    const pageWidth = 595;
    const rightX = 420;
    let y = 60;

    // Header (use helvetica for text)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(comp.name, left, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y += 18;
    comp.addressLines.forEach((line) => {
      doc.text(line, left, y);
      y += 14;
    });
    if (comp.phone) { doc.text(`Phone: ${comp.phone}`, left, y); y += 14; }
    if (comp.email) { doc.text(`Email: ${comp.email}`, left, y); y += 14; }
    if (comp.gstin) { doc.text(`GSTIN: ${comp.gstin}`, left, y); y += 18; }

    // Invoice title and metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", rightX, 80);

    // Fit long invoice id
    const invoiceIdText = `Invoice #: ${purchase.id || ""}`;
    const idMaxWidth = pageWidth - rightX - 40;
    const idSize = fitTextToWidth(doc, invoiceIdText, idMaxWidth, 11, "helvetica", "normal", 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(idSize);
    doc.text(invoiceIdText, rightX, 100, { maxWidth: idMaxWidth, align: "left" });

    doc.setFontSize(11);
    doc.text(`Date: ${formatDate(purchase.date)}`, rightX, 116);
    if (purchase.templateId) {
      const tplText = `Template ID: ${purchase.templateId}`;
      const tplSize = fitTextToWidth(doc, tplText, idMaxWidth, 11, "helvetica", "normal", 6);
      doc.setFontSize(tplSize);
      doc.text(tplText, rightX, 132);
    }

    // Separator and Bill To
    y += 6;
    doc.setDrawColor(200);
    doc.line(left, y + 6, rightLimit, y + 6);
    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill To:", left, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y += 16;
    let buyerY = y;
    doc.text(buyer.full_name || "-", left, buyerY);
    buyerY += 14;
    doc.text(buyer.email || "-", left, buyerY);
    buyerY += 18;

    // Table header
    const tableStartY = buyerY + 8;
    let tableY = tableStartY;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Description", left, tableY);
    doc.text("Amount", rightLimit, tableY, { align: "right" });
    doc.setFont("helvetica", "normal");
    tableY += 16;

    // Description (left column)
    const desc = purchase.template || "Template Purchase";
    doc.text(desc, left, tableY);

    // Numeric values: use Courier (monospace) for clean digits
    doc.setFont("courier", "normal"); // built-in monospace font
    doc.setFontSize(11);
    doc.text(inr(netAmount), rightLimit, tableY, { align: "right" });
    tableY += 18;

    // GST row - label left in helvetica, number in courier
    doc.setFont("helvetica", "normal");
    doc.text("GST (18%)", left, tableY);
    doc.setFont("courier", "normal");
    doc.text(inr(gstAmount), rightLimit, tableY, { align: "right" });
    tableY += 18;

    // Separator
    doc.setDrawColor(200);
    doc.line(left, tableY + 4, rightLimit, tableY + 4);
    tableY += 16;

    // Total row - label helvetica bold, number courier bold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total (after 18% GST)", left, tableY);
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(inr(origAmount), rightLimit, tableY, { align: "right" });
    tableY += 28;

    // Footer note
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "Note: Compurate generate invoice to user as buyer email.id and name only from company details and txn details, template id",
      left,
      tableY,
      { maxWidth: 500 }
    );
    tableY += 22;
    doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, left, tableY);

    // Save
    const filename = `invoice_${purchase.id || Date.now()}.pdf`;
    doc.save(filename);
  };

  return (
    <button
      onClick={download}
      className="inline-flex items-center px-3 py-2 rounded-md bg-slate-900 text-white hover:opacity-90"
    >
      Download Invoice (PDF)
    </button>
  );
};

export default InvoiceGenerator;
