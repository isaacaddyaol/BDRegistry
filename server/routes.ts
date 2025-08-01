import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { insertBirthRegistrationSchema, insertDeathRegistrationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  },
});

// Helper function to check admin access
const isAdminOrRegistrar = (user: any) => {
  console.log('Checking user role:', user?.role);
  return user?.role === 'admin' || user?.role === 'registrar';
};

// Helper function to check if user has access to registration
const hasRegistrationAccess = (user: any, submittedById: string) => {
  return user?.role === 'admin' || user?.role === 'registrar' || user.id === submittedById;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - auto authenticate as admin
  app.get('/api/auth/user', (req: any, res) => {
    res.json({
      id: 'auto-admin',
      email: req.body?.email || 'admin@registry.gov.gh',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true
    });
  });

  // Birth registration routes
  app.post('/api/birth-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertBirthRegistrationSchema.parse({
        ...req.body,
        submittedBy: userId,
      });
      
      const registration = await storage.createBirthRegistration(validatedData);
      res.json(registration);
    } catch (error) {
      console.error("Error creating birth registration:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create birth registration" });
      }
    }
  });

  app.get('/api/birth-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      let registrations;
      
      if (user?.role === 'admin' || user?.role === 'registrar') {
        registrations = await storage.getAllBirthRegistrations();
      } else {
        registrations = await storage.getAllBirthRegistrations();
        registrations = registrations.filter(reg => reg.submittedBy === user.id);
      }
      
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching birth registrations:", error);
      res.status(500).json({ message: "Failed to fetch birth registrations" });
    }
  });

  app.get('/api/birth-registrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const registration = await storage.getBirthRegistration(id);
      
      if (!registration) {
        return res.status(404).json({ message: "Birth registration not found" });
      }
      
      res.json(registration);
    } catch (error) {
      console.error("Error fetching birth registration:", error);
      res.status(500).json({ message: "Failed to fetch birth registration" });
    }
  });

  app.patch('/api/birth-registrations/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (!isAdminOrRegistrar(user)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const id = parseInt(req.params.id);
      const { status, reviewNotes } = req.body;
      
      let certificateNumber;
      if (status === 'approved') {
        const registration = await storage.getBirthRegistration(id);
        if (registration) {
          certificateNumber = `BC${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        }
      }
      
      const updated = await storage.updateBirthRegistrationStatus(
        id,
        status,
        user.id,
        reviewNotes,
        certificateNumber
      );
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating birth registration status:", error);
      res.status(500).json({ message: "Failed to update birth registration status" });
    }
  });

  // Death registration routes
  app.post('/api/death-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertDeathRegistrationSchema.parse({
        ...req.body,
        submittedBy: userId,
      });
      
      const registration = await storage.createDeathRegistration(validatedData);
      res.json(registration);
    } catch (error) {
      console.error("Error creating death registration:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create death registration" });
      }
    }
  });

  app.get('/api/death-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      let registrations;
      
      if (user?.role === 'admin') {
        // Admins can see all registrations
        registrations = await storage.getAllDeathRegistrations();
      } else if (user?.role === 'registrar') {
        // Registrars can see all registrations
        registrations = await storage.getAllDeathRegistrations();
      } else {
        // Other users can only see their own registrations
        registrations = await storage.getAllDeathRegistrations();
        registrations = registrations.filter(reg => reg.submittedBy === user.id);
      }
      
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching death registrations:", error);
      res.status(500).json({ message: "Failed to fetch death registrations" });
    }
  });

  app.patch('/api/death-registrations/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (user?.role !== 'admin' && user?.role !== 'registrar') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const id = parseInt(req.params.id);
      const { status, reviewNotes } = req.body;
      
      let certificateNumber;
      if (status === 'approved') {
        const registration = await storage.getDeathRegistration(id);
        if (registration) {
          certificateNumber = `DC${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        }
      }
      
      const updated = await storage.updateDeathRegistrationStatus(
        id,
        status,
        user.id,
        reviewNotes,
        certificateNumber
      );
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating death registration status:", error);
      res.status(500).json({ message: "Failed to update death registration status" });
    }
  });

  // Document upload routes
  app.post('/api/documents/upload', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { applicationId, applicationType, documentType } = req.body;
      
      const document = await storage.createDocument({
        applicationId,
        applicationType,
        documentType,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.id,
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get('/api/documents/:applicationId/:applicationType', isAuthenticated, async (req, res) => {
    try {
      const { applicationId, applicationType } = req.params;
      const documents = await storage.getDocumentsByApplication(applicationId, applicationType);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Statistics route
  app.get('/api/statistics', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getRegistrationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Certificate verification route
  app.get('/api/verify/:certificateNumber', async (req, res) => {
    try {
      const { certificateNumber } = req.params;
      const result = await storage.verifyCertificate(certificateNumber);
      res.json(result);
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({ message: "Failed to verify certificate" });
    }
  });

  // Pending applications for admin/registrar
  app.get('/api/pending-applications', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      if (!isAdminOrRegistrar(user)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const pendingBirths = await storage.getBirthRegistrationsByStatus('pending');
      const pendingDeaths = await storage.getDeathRegistrationsByStatus('pending');
      
      const applications = [
        ...pendingBirths.map(app => ({ ...app, type: 'birth' })),
        ...pendingDeaths.map(app => ({ ...app, type: 'death' })),
      ].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching pending applications:", error);
      res.status(500).json({ message: "Failed to fetch pending applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}