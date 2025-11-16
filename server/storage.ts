import {
  users,
  giftCodes,
  withdrawalRequests,
  giftCodeRedemptions,
  type User,
  type InsertUser,
  type GiftCode,
  type InsertGiftCode,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type GiftCodeRedemption,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: string, amount: string): Promise<void>;
  setUserAdmin(id: string, isAdmin: boolean): Promise<void>;
  
  getAllUsers(): Promise<User[]>;
  
  getGiftCodeByCode(code: string): Promise<GiftCode | undefined>;
  createGiftCode(giftCode: InsertGiftCode): Promise<GiftCode>;
  getAllGiftCodes(): Promise<GiftCode[]>;
  incrementGiftCodeUsage(id: string): Promise<void>;
  deactivateGiftCode(id: string): Promise<void>;
  
  hasUserRedeemedCode(userId: string, giftCodeId: string): Promise<boolean>;
  createRedemption(userId: string, giftCodeId: string): Promise<GiftCodeRedemption>;
  
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getAllWithdrawalRequests(): Promise<WithdrawalRequest[]>;
  updateWithdrawalStatus(id: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(id: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${amount}` })
      .where(eq(users.id, id));
  }

  async setUserAdmin(id: string, isAdmin: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getGiftCodeByCode(code: string): Promise<GiftCode | undefined> {
    const [giftCode] = await db.select().from(giftCodes).where(eq(giftCodes.code, code));
    return giftCode || undefined;
  }

  async createGiftCode(insertGiftCode: InsertGiftCode): Promise<GiftCode> {
    const [giftCode] = await db
      .insert(giftCodes)
      .values(insertGiftCode)
      .returning();
    return giftCode;
  }

  async getAllGiftCodes(): Promise<GiftCode[]> {
    return await db.select().from(giftCodes);
  }

  async incrementGiftCodeUsage(id: string): Promise<void> {
    await db
      .update(giftCodes)
      .set({ usedCount: sql`${giftCodes.usedCount} + 1` })
      .where(eq(giftCodes.id, id));
  }

  async deactivateGiftCode(id: string): Promise<void> {
    await db
      .update(giftCodes)
      .set({ isActive: false })
      .where(eq(giftCodes.id, id));
  }

  async hasUserRedeemedCode(userId: string, giftCodeId: string): Promise<boolean> {
    const [redemption] = await db
      .select()
      .from(giftCodeRedemptions)
      .where(
        and(
          eq(giftCodeRedemptions.userId, userId),
          eq(giftCodeRedemptions.giftCodeId, giftCodeId)
        )
      );
    return !!redemption;
  }

  async createRedemption(userId: string, giftCodeId: string): Promise<GiftCodeRedemption> {
    const [redemption] = await db
      .insert(giftCodeRedemptions)
      .values({ userId, giftCodeId })
      .returning();
    return redemption;
  }

  async createWithdrawalRequest(insertRequest: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [request] = await db
      .insert(withdrawalRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    return await db.select().from(withdrawalRequests);
  }

  async updateWithdrawalStatus(id: string, status: string): Promise<void> {
    await db
      .update(withdrawalRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(withdrawalRequests.id, id));
  }
}

export const storage = new DatabaseStorage();
