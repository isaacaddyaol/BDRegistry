import {
  users,
  birthRegistrations,
  deathRegistrations,
  documents,
  type User,
  type UpsertUser,
  type InsertBirthRegistration,
  type BirthRegistration,
  type InsertDeathRegistration,
  type DeathRegistration,
  type InsertDocument,
  type Document,
  type RegisterUser,
  type LoginUser,
  type RequestPasswordReset,
  type ResetPassword,
  type VerifyEmail,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, isNull, gt } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./utils/password";
import { randomUUID } from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail } from "./services/email";

export interface IStorage {
  // User authentication operations
  registerUser(userData: RegisterUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  validateUserCredentials(credentials: LoginUser): Promise<User | undefined>;
  
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Birth registration operations
  createBirthRegistration(registration: InsertBirthRegistration): Promise<BirthRegistration>;
  getBirthRegistration(id: number): Promise<BirthRegistration | undefined>;
  getBirthRegistrationByApplicationId(applicationId: string): Promise<BirthRegistration | undefined>;
  updateBirthRegistrationStatus(id: number, status: string, reviewedBy: string, reviewNotes?: string, certificateNumber?: string): Promise<BirthRegistration>;
  getAllBirthRegistrations(): Promise<BirthRegistration[]>;
  getBirthRegistrationsByStatus(status: string): Promise<BirthRegistration[]>;
  
  // Death registration operations
  createDeathRegistration(registration: InsertDeathRegistration): Promise<DeathRegistration>;
  getDeathRegistration(id: number): Promise<DeathRegistration | undefined>;
  getDeathRegistrationByApplicationId(applicationId: string): Promise<DeathRegistration | undefined>;
  updateDeathRegistrationStatus(id: number, status: string, reviewedBy: string, reviewNotes?: string, certificateNumber?: string): Promise<DeathRegistration>;
  getAllDeathRegistrations(): Promise<DeathRegistration[]>;
  getDeathRegistrationsByStatus(status: string): Promise<DeathRegistration[]>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByApplication(applicationId: string, applicationType: string): Promise<Document[]>;
  
  // Statistics
  getRegistrationStats(): Promise<{
    pendingApplications: number;
    thisMonthRegistrations: number;
    totalBirths: number;
    totalDeaths: number;
  }>;
  
  // Certificate verification
  verifyCertificate(certificateNumber: string): Promise<{
    valid: boolean;
    type?: string;
    applicationId?: string;
    issuedDate?: Date;
    issuingOffice?: string;
  }>;
  
  // Email verification
  verifyEmail(token: string): Promise<boolean>;
  resendVerificationEmail(email: string): Promise<void>;
  
  // Password reset
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(data: ResetPassword): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User authentication operations
  async registerUser(userData: RegisterUser): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    const verificationToken = randomUUID();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const [user] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        verificationToken,
        verificationTokenExpiry,
      })
      .returning();
    
    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);
    
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async validateUserCredentials(credentials: LoginUser): Promise<User | undefined> {
    const user = await this.getUserByEmail(credentials.email);
    
    if (!user) {
      return undefined;
    }
    
    const isValid = await verifyPassword(credentials.password, user.password);
    
    return isValid ? user : undefined;
  }

  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Birth registration operations
  async createBirthRegistration(registration: InsertBirthRegistration): Promise<BirthRegistration> {
    // Generate application ID
    const year = new Date().getFullYear();
    const count = await db.select().from(birthRegistrations);
    const nextNumber = count.length + 1;
    const applicationId = `BR${year}${nextNumber.toString().padStart(3, '0')}`;

    const [created] = await db
      .insert(birthRegistrations)
      .values({
        ...registration,
        applicationId,
      })
      .returning();
    return created;
  }

  async getBirthRegistration(id: number): Promise<BirthRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.id, id));
    return registration;
  }

  async getBirthRegistrationByApplicationId(applicationId: string): Promise<BirthRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.applicationId, applicationId));
    return registration;
  }

  async updateBirthRegistrationStatus(
    id: number,
    status: string,
    reviewedBy: string,
    reviewNotes?: string,
    certificateNumber?: string
  ): Promise<BirthRegistration> {
    const [updated] = await db
      .update(birthRegistrations)
      .set({
        status,
        reviewedBy,
        reviewNotes,
        certificateNumber,
        updatedAt: new Date(),
      })
      .where(eq(birthRegistrations.id, id))
      .returning();
    return updated;
  }

  async getAllBirthRegistrations(): Promise<BirthRegistration[]> {
    return await db
      .select()
      .from(birthRegistrations)
      .orderBy(desc(birthRegistrations.createdAt));
  }

  async getBirthRegistrationsByStatus(status: string): Promise<BirthRegistration[]> {
    return await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.status, status))
      .orderBy(desc(birthRegistrations.createdAt));
  }

  // Death registration operations
  async createDeathRegistration(registration: InsertDeathRegistration): Promise<DeathRegistration> {
    // Generate application ID
    const year = new Date().getFullYear();
    const count = await db.select().from(deathRegistrations);
    const nextNumber = count.length + 1;
    const applicationId = `DR${year}${nextNumber.toString().padStart(3, '0')}`;

    const [created] = await db
      .insert(deathRegistrations)
      .values({
        ...registration,
        applicationId,
      })
      .returning();
    return created;
  }

  async getDeathRegistration(id: number): Promise<DeathRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.id, id));
    return registration;
  }

  async getDeathRegistrationByApplicationId(applicationId: string): Promise<DeathRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.applicationId, applicationId));
    return registration;
  }

  async updateDeathRegistrationStatus(
    id: number,
    status: string,
    reviewedBy: string,
    reviewNotes?: string,
    certificateNumber?: string
  ): Promise<DeathRegistration> {
    const [updated] = await db
      .update(deathRegistrations)
      .set({
        status,
        reviewedBy,
        reviewNotes,
        certificateNumber,
        updatedAt: new Date(),
      })
      .where(eq(deathRegistrations.id, id))
      .returning();
    return updated;
  }

  async getAllDeathRegistrations(): Promise<DeathRegistration[]> {
    return await db
      .select()
      .from(deathRegistrations)
      .orderBy(desc(deathRegistrations.createdAt));
  }

  async getDeathRegistrationsByStatus(status: string): Promise<DeathRegistration[]> {
    return await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.status, status))
      .orderBy(desc(deathRegistrations.createdAt));
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [created] = await db
      .insert(documents)
      .values(document)
      .returning();
    return created;
  }

  async getDocumentsByApplication(applicationId: string, applicationType: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.applicationId, applicationId),
          eq(documents.applicationType, applicationType)
        )
      );
  }

  // Statistics
  async getRegistrationStats(): Promise<{
    pendingApplications: number;
    thisMonthRegistrations: number;
    totalBirths: number;
    totalDeaths: number;
  }> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    const [pendingBirths] = await db
      .select({ count: count() })
      .from(birthRegistrations)
      .where(eq(birthRegistrations.status, 'pending'));
    
    const [pendingDeaths] = await db
      .select({ count: count() })
      .from(deathRegistrations)
      .where(eq(deathRegistrations.status, 'pending'));
    
    const [totalBirths] = await db
      .select({ count: count() })
      .from(birthRegistrations);
    
    const [totalDeaths] = await db
      .select({ count: count() })
      .from(deathRegistrations);

    // For this month registrations, we'll use total approved this month
    const [thisMonthBirths] = await db
      .select({ count: count() })
      .from(birthRegistrations)
      .where(eq(birthRegistrations.status, 'approved'));
    
    const [thisMonthDeaths] = await db
      .select({ count: count() })
      .from(deathRegistrations)
      .where(eq(deathRegistrations.status, 'approved'));

    return {
      pendingApplications: (pendingBirths?.count || 0) + (pendingDeaths?.count || 0),
      thisMonthRegistrations: (thisMonthBirths?.count || 0) + (thisMonthDeaths?.count || 0),
      totalBirths: totalBirths?.count || 0,
      totalDeaths: totalDeaths?.count || 0,
    };
  }

  // Certificate verification
  async verifyCertificate(certificateNumber: string): Promise<{
    valid: boolean;
    type?: string;
    applicationId?: string;
    issuedDate?: Date;
    issuingOffice?: string;
  }> {
    // Check birth certificates
    const [birthCert] = await db
      .select()
      .from(birthRegistrations)
      .where(eq(birthRegistrations.certificateNumber, certificateNumber));
    
    if (birthCert && birthCert.status === 'approved') {
      return {
        valid: true,
        type: 'Birth Certificate',
        applicationId: birthCert.applicationId,
        issuedDate: birthCert.updatedAt ?? birthCert.createdAt ?? undefined,
        issuingOffice: 'Accra Registry',
      };
    }

    // Check death certificates
    const [deathCert] = await db
      .select()
      .from(deathRegistrations)
      .where(eq(deathRegistrations.certificateNumber, certificateNumber));
    
    if (deathCert && deathCert.status === 'approved') {
      return {
        valid: true,
        type: 'Death Certificate',
        applicationId: deathCert.applicationId,
        issuedDate: deathCert.updatedAt ?? deathCert.createdAt ?? undefined,
        issuingOffice: 'Accra Registry',
      };
    }

    return { valid: false };
  }

  async verifyEmail(token: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verificationToken, token),
          gt(users.verificationTokenExpiry!, new Date())
        )
      );

    if (!user) {
      return false;
    }

    await db
      .update(users)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return true;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    
    if (!user || user.isVerified) {
      return;
    }

    const verificationToken = randomUUID();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db
      .update(users)
      .set({
        verificationToken,
        verificationTokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await sendVerificationEmail(email, verificationToken);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return;
    }

    const resetToken = randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(data: ResetPassword): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, data.token),
          gt(users.resetTokenExpiry!, new Date())
        )
      );

    if (!user) {
      return false;
    }

    const hashedPassword = await hashPassword(data.password);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return true;
  }
}

export const storage = new DatabaseStorage();
