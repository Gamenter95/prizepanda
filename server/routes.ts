import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { insertUserSchema, insertGiftCodeSchema, insertWithdrawalRequestSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdminAuthenticated?: boolean;
  }
}

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.session.isAdminAuthenticated) {
    return res.status(403).json({ message: "Forbidden: Admin password required" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    })
  );

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.createUser({ username, password: hashedPassword });

      res.json({ message: "User created successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        req.session.userId = user.id;
        res.json({ message: "Login successful" });
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/redeem", isAuthenticated, async (req, res) => {
    try {
      const { code } = req.body;

      const giftCode = await storage.getGiftCodeByCode(code);
      if (!giftCode) {
        return res.status(404).json({ message: "Gift code not found" });
      }

      if (!giftCode.isActive) {
        return res.status(400).json({ message: "Gift code is inactive" });
      }

      if (new Date(giftCode.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Gift code has expired" });
      }

      if (giftCode.usedCount >= giftCode.usageLimit) {
        return res.status(400).json({ message: "Gift code usage limit reached" });
      }

      const hasRedeemed = await storage.hasUserRedeemedCode(req.session.userId!, giftCode.id);
      if (hasRedeemed) {
        return res.status(400).json({ message: "You have already redeemed this code" });
      }

      await storage.updateUserBalance(req.session.userId!, giftCode.prizeAmount);
      await storage.incrementGiftCodeUsage(giftCode.id);
      await storage.createRedemption(req.session.userId!, giftCode.id);

      res.json({ message: "Gift code redeemed successfully", prizeAmount: giftCode.prizeAmount });
    } catch (error) {
      console.error("Redemption error:", error);
      res.status(500).json({ message: "Redemption failed" });
    }
  });

  app.post("/api/withdraw", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertWithdrawalRequestSchema.parse({
        userId: req.session.userId,
        amount: req.body.amount,
        upiId: req.body.upiId,
      });

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const balance = parseFloat(user.balance);
      const withdrawAmount = parseFloat(validatedData.amount);

      if (withdrawAmount < 5) {
        return res.status(400).json({ message: "Minimum withdrawal amount is ₹5" });
      }

      if (withdrawAmount > balance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      await storage.createWithdrawalRequest(validatedData);
      res.json({ message: "Withdrawal request submitted successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;

      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "95weox";
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Invalid admin password" });
      }

      if (!req.session.userId) {
        return res.status(401).json({ message: "You must be logged in first" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const oldSessionId = req.session.id;
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Admin login failed" });
        }
        
        req.session.userId = user.id;
        req.session.isAdminAuthenticated = true;
        
        storage.setUserAdmin(user.id, true).then(() => {
          res.json({ message: "Admin access granted" });
        }).catch(() => {
          res.status(500).json({ message: "Admin login failed" });
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/gift-codes", isAdmin, async (req, res) => {
    try {
      const codes = await storage.getAllGiftCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gift codes" });
    }
  });

  app.post("/api/admin/gift-codes", isAdmin, async (req, res) => {
    try {
      console.log("Received gift code data:", req.body);
      const validatedData = insertGiftCodeSchema.parse(req.body);
      console.log("Validated gift code data:", validatedData);
      const giftCode = await storage.createGiftCode(validatedData);
      res.json(giftCode);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Gift code creation error:", error);
      res.status(500).json({ message: "Failed to create gift code" });
    }
  });

  app.delete("/api/admin/gift-codes/:id", isAdmin, async (req, res) => {
    try {
      await storage.deactivateGiftCode(req.params.id);
      res.json({ message: "Gift code deactivated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate gift code" });
    }
  });

  app.get("/api/admin/withdrawals", isAdmin, async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawalRequests();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });

  app.patch("/api/admin/withdrawals/:id", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["approved", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateWithdrawalStatus(req.params.id, status);
      res.json({ message: "Withdrawal status updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update withdrawal status" });
    }
  });

  app.get("/api/config", (req, res) => {
    res.json({
      subscribeUrl: process.env.SUBSCRIBE_URL || "",
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
