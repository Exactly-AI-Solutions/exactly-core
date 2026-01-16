import { eq, and, gt, lt, sql } from 'drizzle-orm';
import type { DbClient } from '../client';
import { handoffs, type Handoff, type NewHandoff } from '../schema/handoffs';
import { generateShareToken } from './utils/token';

/**
 * Repository for handoff operations
 */
export class HandoffRepository {
  constructor(private db: DbClient) {}

  /**
   * Find a handoff by its ID
   */
  async findById(id: string): Promise<Handoff | null> {
    const result = await this.db.query.handoffs.findFirst({
      where: eq(handoffs.id, id),
    });
    return result ?? null;
  }

  /**
   * Find a handoff by its share token
   */
  async findByToken(token: string): Promise<Handoff | null> {
    const result = await this.db.query.handoffs.findFirst({
      where: eq(handoffs.shareToken, token),
    });
    return result ?? null;
  }

  /**
   * Find a valid handoff by token (checks expiry, active status, and max uses)
   */
  async findValidByToken(token: string): Promise<Handoff | null> {
    const now = new Date();
    const result = await this.db.query.handoffs.findFirst({
      where: and(
        eq(handoffs.shareToken, token),
        eq(handoffs.isActive, true),
        gt(handoffs.expiresAt, now)
      ),
    });

    if (!result) {
      return null;
    }

    // Check max uses if configured
    if (result.maxUses !== null && result.usedCount >= result.maxUses) {
      return null;
    }

    return result;
  }

  /**
   * Create a new handoff with an auto-generated share token
   */
  async create(data: Omit<NewHandoff, 'shareToken'>): Promise<Handoff> {
    const shareToken = generateShareToken();
    const [result] = await this.db
      .insert(handoffs)
      .values({ ...data, shareToken })
      .returning();
    return result;
  }

  /**
   * Increment the usage count for a handoff
   */
  async incrementUsage(id: string): Promise<void> {
    await this.db
      .update(handoffs)
      .set({
        usedCount: sql`${handoffs.usedCount} + 1`,
      })
      .where(eq(handoffs.id, id));
  }

  /**
   * Deactivate a handoff (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    await this.db
      .update(handoffs)
      .set({ isActive: false })
      .where(eq(handoffs.id, id));
  }

  /**
   * Find all handoffs for a tenant
   */
  async findByTenant(tenantId: string, limit = 100): Promise<Handoff[]> {
    return this.db.query.handoffs.findMany({
      where: eq(handoffs.tenantId, tenantId),
      orderBy: (h, { desc }) => [desc(h.createdAt)],
      limit,
    });
  }

  /**
   * Delete expired handoffs (cleanup job)
   */
  async deleteExpired(): Promise<number> {
    const now = new Date();
    const result = await this.db
      .delete(handoffs)
      .where(and(eq(handoffs.isActive, false), lt(handoffs.expiresAt, now)))
      .returning();
    return result.length;
  }
}
