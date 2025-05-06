import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { parseResumeFile } from "./lib/parser";
import { analyzeResumeWithJobDescription, generatePDFReport } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (_, file, cb) => {
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
      }
    }
  });

  // Analyze resume endpoint
  app.post('/api/analyze', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No resume file uploaded' });
      }

      if (!req.body.jobDescription) {
        return res.status(400).json({ message: 'Job description is required' });
      }

      // Save the file temporarily
      const { id, path: filePath } = await storage.saveFile(
        req.file.buffer,
        req.file.originalname
      );

      // Extract text from the resume file
      const resumeText = await parseResumeFile(filePath, path.extname(req.file.originalname));

      // Analyze the resume against the job description
      const analysisResult = await analyzeResumeWithJobDescription(
        resumeText,
        req.body.jobDescription
      );

      // Clean up temporary file
      await storage.deleteFile(id);

      // Return the analysis results
      return res.json(analysisResult);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      return res.status(500).json({ 
        message: `Error analyzing resume: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Generate PDF report endpoint
  app.post('/api/generate-report', async (req, res) => {
    try {
      const { resumeFileName, analysisResult } = req.body;

      if (!resumeFileName || !analysisResult) {
        return res.status(400).json({ message: 'Resume filename and analysis results are required' });
      }

      // Generate PDF report
      const pdfBuffer = await generatePDFReport(resumeFileName, analysisResult);

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=resume-analysis-report.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send the PDF
      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating report:', error);
      return res.status(500).json({ 
        message: `Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
