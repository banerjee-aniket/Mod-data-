import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("moderator"),
  badgeNumber: text("badge_number").notNull().unique(),
  profileImage: text("profile_image"),
  designation: text("designation"),
  department: text("department"),
  joinDate: text("join_date"),
  contactInfo: text("contact_info"),
});

// Schema for creating moderators (used by admin)
export const insertModeratorSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  badgeNumber: true,
  profileImage: true,
  designation: true,
  department: true,
  joinDate: true,
  contactInfo: true,
});

// Schema for admin registration
export const insertAdminSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
}).extend({
  role: z.literal("admin")
});

export type InsertModerator = z.infer<typeof insertModeratorSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type User = typeof users.$inferSelect;

export function isAdmin(user: User): boolean {
  return user.role === "admin";
}