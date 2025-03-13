import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, isAdmin } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function requireAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "local-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Admin routes
  app.post("/api/admin/register", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const admin = await storage.createAdmin({
        ...req.body,
        password: await hashPassword(req.body.password),
        role: "admin"
      });

      req.login(admin, (err) => {
        if (err) throw err;
        res.status(201).json(admin);
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to register admin" });
    }
  });

  app.post("/api/admin/moderators", requireAdmin, async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingBadge = await storage.getUserByBadgeNumber(req.body.badgeNumber);
      if (existingBadge) {
        return res.status(400).json({ message: "Badge number already exists" });
      }

      const moderator = await storage.createModerator({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      res.status(201).json(moderator);
    } catch (err) {
      res.status(500).json({ message: "Failed to create moderator" });
    }
  });

  app.get("/api/admin/moderators", requireAdmin, async (req, res) => {
    try {
      const moderators = await storage.getAllModerators();
      res.json(moderators);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch moderators" });
    }
  });

  app.patch("/api/admin/moderators/:id", requireAdmin, async (req, res) => {
    try {
      const moderator = await storage.updateModerator(
        parseInt(req.params.id),
        req.body
      );
      res.json(moderator);
    } catch (err) {
      res.status(500).json({ message: "Failed to update moderator" });
    }
  });

  app.delete("/api/admin/moderators/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteModerator(parseInt(req.params.id));
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete moderator" });
    }
  });


  // Authentication routes
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
}