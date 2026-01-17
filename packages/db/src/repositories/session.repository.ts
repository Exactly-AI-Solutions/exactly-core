import { eq, and } from 'drizzle-orm';
import type { DbClient } from '../client.js';
import { chatSessions, type ChatSession, type NewChatSession } from '../schema/sessions.js';

/**
 * Repository for session operations
 */
export class SessionRepository {
  constructor(private db: DbClient) {}

  async findById(id: string): Promise<ChatSession | null> {
    const result = await this.db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, id),
    });
    return result ?? null;
  }

  async findBySessionId(tenantId: string, sessionId: string): Promise<ChatSession | null> {
    const result = await this.db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.tenantId, tenantId),
        eq(chatSessions.sessionId, sessionId)
      ),
    });
    return result ?? null;
  }

  async findByTenant(tenantId: string): Promise<ChatSession[]> {
    return this.db.query.chatSessions.findMany({
      where: eq(chatSessions.tenantId, tenantId),
      orderBy: (sessions, { desc }) => [desc(sessions.lastActiveAt)],
    });
  }

  async create(data: NewChatSession): Promise<ChatSession> {
    const [result] = await this.db.insert(chatSessions).values(data).returning();
    return result;
  }

  async updateLastActive(id: string): Promise<void> {
    await this.db
      .update(chatSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(chatSessions.id, id));
  }

  async getOrCreate(tenantId: string, sessionId: string): Promise<ChatSession> {
    const existing = await this.findBySessionId(tenantId, sessionId);
    if (existing) {
      await this.updateLastActive(existing.id);
      return existing;
    }

    return this.create({ tenantId, sessionId });
  }
}
