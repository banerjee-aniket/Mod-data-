import { User, InsertModerator, InsertAdmin } from "@shared/schema";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByBadgeNumber(badgeNumber: string): Promise<User | undefined>;
  createModerator(moderator: InsertModerator): Promise<User>;
  createAdmin(admin: InsertAdmin): Promise<User>;
  updateModeratorCredentials(id: number, username: string, password: string): Promise<User>;
  updateModerator(id: number, data: Partial<InsertModerator>): Promise<User>;
  deleteModerator(id: number): Promise<void>;
  getAllModerators(): Promise<User[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByBadgeNumber(badgeNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.badgeNumber, badgeNumber));
    return user;
  }

  async createModerator(moderator: InsertModerator): Promise<User> {
    const [user] = await db.insert(users)
      .values({ ...moderator, role: "moderator" })
      .returning();
    return user;
  }

  async createAdmin(admin: InsertAdmin): Promise<User> {
    const [user] = await db.insert(users)
      .values({ ...admin, role: "admin", badgeNumber: "ADMIN" })
      .returning();
    return user;
  }

  async updateModeratorCredentials(id: number, username: string, password: string): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user || user.role !== "moderator") {
      throw new Error("Moderator not found");
    }

    const [updatedUser] = await db.update(users)
      .set({ username, password })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateModerator(id: number, data: Partial<InsertModerator>): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user || user.role !== "moderator") {
      throw new Error("Moderator not found");
    }

    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteModerator(id: number): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user || user.role !== "moderator") {
      throw new Error("Moderator not found");
    }

    await db.delete(users).where(eq(users.id, id));
  }

  async getAllModerators(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "moderator"));
  }
}

export const storage = new DatabaseStorage();