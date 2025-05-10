const express = require('express');
const { PDFDocument } = require('pdf-lib');
const app = express();

// Middleware untuk menerima data JSON
app.use(express.json({ limit: '10mb' }));

app.post('/merge-pdfs', async (req, res) => {
  try {
    console.log('Menerima request:', JSON.stringify(req.body, null, 2));
    const pdfFiles = req.body.files;

    // Validasi input
    if (!pdfFiles || !Array.isArray(pdfFiles) || pdfFiles.length === 0) {
      throw new Error('Invalid or missing files array in request body');
    }

    const pdfDocs = [];
    for (const pdfBase64 of pdfFiles) {
      if (typeof pdfBase64 !== 'string') {
        throw new Error('Invalid base64 string');
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
    res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Route dasar untuk memeriksa server
app.get('/', (req, res) => {
  res.send('PDF Merge Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
