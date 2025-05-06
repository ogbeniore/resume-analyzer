import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Analysis history to store previous resume analyses
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  resumeName: text("resume_name").notNull(),
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description").notNull(),
  matchPercentage: integer("match_percentage").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analysesRelations = relations(analyses, ({ one }) => ({
  user: one(users, { fields: [analyses.userId], references: [users.id] }),
}));

export const insertAnalysisSchema = createInsertSchema(analyses, {
  resumeName: (schema) => schema.min(1, "Resume name is required"),
  jobTitle: (schema) => schema.min(1, "Job title is required"),
  jobDescription: (schema) => schema.min(10, "Job description must be at least 10 characters"),
  matchPercentage: (schema) => schema.min(0).max(100),
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;
