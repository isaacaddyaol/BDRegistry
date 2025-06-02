import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  date,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("public"), // public, health_worker, registrar, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Birth registrations
export const birthRegistrations = pgTable("birth_registrations", {
  id: serial("id").primaryKey(),
  applicationId: varchar("application_id").notNull().unique(), // BR2024001 format
  
  // Child information
  childName: varchar("child_name").notNull(),
  childSex: varchar("child_sex").notNull(), // male, female
  dateOfBirth: date("date_of_birth").notNull(),
  timeOfBirth: varchar("time_of_birth"),
  placeOfBirth: varchar("place_of_birth").notNull(),
  
  // Father information
  fatherName: varchar("father_name").notNull(),
  fatherNationalId: varchar("father_national_id").notNull(),
  fatherDateOfBirth: date("father_date_of_birth"),
  fatherOccupation: varchar("father_occupation"),
  
  // Mother information
  motherName: varchar("mother_name").notNull(),
  motherNationalId: varchar("mother_national_id").notNull(),
  motherDateOfBirth: date("mother_date_of_birth"),
  motherOccupation: varchar("mother_occupation"),
  
  // Application metadata
  submittedBy: varchar("submitted_by").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  certificateNumber: varchar("certificate_number").unique(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Death registrations
export const deathRegistrations = pgTable("death_registrations", {
  id: serial("id").primaryKey(),
  applicationId: varchar("application_id").notNull().unique(), // DR2024001 format
  
  // Deceased information
  deceasedName: varchar("deceased_name").notNull(),
  dateOfDeath: date("date_of_death").notNull(),
  timeOfDeath: varchar("time_of_death"),
  placeOfDeath: varchar("place_of_death").notNull(),
  causeOfDeath: text("cause_of_death").notNull(),
  
  // Next of kin information
  nextOfKinName: varchar("next_of_kin_name").notNull(),
  nextOfKinRelationship: varchar("next_of_kin_relationship").notNull(),
  nextOfKinContact: varchar("next_of_kin_contact").notNull(),
  nextOfKinNationalId: varchar("next_of_kin_national_id"),
  
  // Application metadata
  submittedBy: varchar("submitted_by").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  certificateNumber: varchar("certificate_number").unique(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document uploads
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: varchar("application_id").notNull(),
  applicationType: varchar("application_type").notNull(), // birth, death
  documentType: varchar("document_type").notNull(), // medical_certificate, parent_id, next_of_kin_id
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  birthRegistrations: many(birthRegistrations),
  deathRegistrations: many(deathRegistrations),
  documents: many(documents),
}));

export const birthRegistrationsRelations = relations(birthRegistrations, ({ one, many }) => ({
  submitter: one(users, {
    fields: [birthRegistrations.submittedBy],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [birthRegistrations.reviewedBy],
    references: [users.id],
  }),
  documents: many(documents),
}));

export const deathRegistrationsRelations = relations(deathRegistrations, ({ one, many }) => ({
  submitter: one(users, {
    fields: [deathRegistrations.submittedBy],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [deathRegistrations.reviewedBy],
    references: [users.id],
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertBirthRegistrationSchema = createInsertSchema(birthRegistrations).omit({
  id: true,
  applicationId: true,
  status: true,
  reviewedBy: true,
  reviewNotes: true,
  certificateNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeathRegistrationSchema = createInsertSchema(deathRegistrations).omit({
  id: true,
  applicationId: true,
  status: true,
  reviewedBy: true,
  reviewNotes: true,
  certificateNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const upsertUserSchema = createInsertSchema(users);

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBirthRegistration = z.infer<typeof insertBirthRegistrationSchema>;
export type BirthRegistration = typeof birthRegistrations.$inferSelect;
export type InsertDeathRegistration = z.infer<typeof insertDeathRegistrationSchema>;
export type DeathRegistration = typeof deathRegistrations.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
