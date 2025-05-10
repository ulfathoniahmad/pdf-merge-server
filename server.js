const express = require('express');
const { PDFDocument } = require('pdf-lib');
const app = express();

// Middleware untuk menerima data JSON
app.use(express.json({ limit: '10mb' }));

app.post('/merge-pdfs', async (req, res) => {
  try {
    const pdfFiles = req.body.files; // Array base64-encoded PDF
    const pdfDocs = [];

    // Muat setiap PDF dari base64
    for (const pdfBase64 of pdfFiles) {
      const pdfBytes = Buffer.from(pdfBase64, 'base64');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDocs.push(pdfDoc);
    }

    // Buat dokumen PDF baru untuk penggabungan
    const mergedPdf = await PDFDocument.create();
    for (const pdfDoc of pdfDocs) {
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    // Simpan PDF yang digabungkan
    const mergedPdfBytes = await mergedPdf.save();
    res.set('Content-Type', 'application/pdf');
    res.send(Buffer.from mergedPdfBytes));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
