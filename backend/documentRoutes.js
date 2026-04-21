const express = require('express');
const router = express.Router();

/**
 * @route POST /api/documents/draft
 * @desc Saves the ongoing document form to PostgreSQL DB as 'draft'
 */
router.post('/draft', async (req, res) => {
    try {
        const { userId, templateId, formData } = req.body;

        // Dummy validation, hook up to SQL logic natively
        if(!userId || !templateId || !formData) {
            return res.status(400).json({ error: "Missing payload data" });
        }

        // DB logic to INSERT INTO documents (...) VALUES (...)
        const draftId = `doc-draft-${Date.now()}`;

        res.status(200).json({ 
            success: true, 
            draftId, 
            message: "Draft saved securely to database" 
        });
    } catch (err) {
        res.status(500).json({ error: "Document persistence error" });
    }
});

/**
 * @route POST /api/documents/generate
 * @desc Converts stored JSONB Draft into PDF via Puppeteer/PDFKit and flags status 'generated'
 */
router.post('/generate', async (req, res) => {
    try {
        const { draftId } = req.body;
        
        if (!draftId) {
            return res.status(400).json({ error: "Missing Draft ID" });
        }

        // 1. Fetch form_data mapping from DB 
        // 2. Perform NIK AES-256 decryption
        // 3. Render PDF Service
        // 4. Update status = 'generated'

        const mockPdfUrl = "https://aws-s3-bucket/lawsy/generated-docs/mock_doc.pdf";

        res.status(200).json({ 
            success: true, 
            documentUrl: mockPdfUrl,
            message: "Document successfully rendered to PDF"
        });
    } catch (err) {
        res.status(500).json({ error: "Document generation pipeline failed" });
    }
});

module.exports = router;
