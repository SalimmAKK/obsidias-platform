import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import { handleApproval } from './node_05_approval_handler.js';
import { httpHandler } from './node_06_orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();

// Middleware
app.use(cors()); // Allow frontend to be hosted on GH Pages / Cloudflare Pages
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (the UI) if not hosted separately
app.use(express.static(path.join(__dirname, 'public')));

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// 1. Approval Endpoint
// Handles GET and POST requests for approving or rejecting a job
app.get('/api/approval', handleApproval);
app.post('/api/approval', handleApproval);

// 2. Upload Endpoint
// Handles multipart file uploads and pipes the buffer to the orchestrator
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    // node_06_orchestrator expects the file buffer in req.body.file or req.rawBody
    req.body.file = req.file.buffer;
  }
  return httpHandler(req, res);
});

// ─── START SERVER ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
