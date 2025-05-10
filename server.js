const express = require('express');
const { PDFDocument } = require('pdf-lib');
const app = express();

// Middleware untuk menerima data JSON
app.use(express.json({ limit: '10mb' }));

// Tambahkan logging untuk semua request
app.use((req, res, next) => {
  console.log(`${req.method} request diterima di ${req.url}`);
  next();
});

app.post('/merge-pdfs', async (req, res) => {
  try {
    console.log('POST /merge-pdfs diterima dengan body:', JSON.stringify(req.body, null, 2));
    const pdfFiles = req.body.files;

    // Validasi input
    if (!pdfFiles || !Array.isArray(pdfFiles) || pdfFiles.length === 0) {
      throw new Error('Array files tidak valid atau kosong');
    }

    const pdfDocs = [];
    for (const pdfBase64 of pdfFiles) {
      if (typeof pdfBase64 !== 'string') {
        throw new Error('String base64 tidak valid');
      }
      const pdfBytes = Buffer.from(pdfBase64, 'base64');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDocs.push(pdfDoc);
    }

    // Buat dokumen PDF baru
    const mergedPdf = await PDFDocument.create();
    for (const pdfDoc of pdfDocs) {
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    // Simpan PDF yang digabungkan
    const mergedPdfBytes = await mergedPdf.save();
    res.set('Content-Type', 'application/pdf');
    res.status(200).send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.status(200).send('PDF Merge Server berjalan');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
