import { eq, isNull, lte } from 'drizzle-orm';
import type { DbClient } from '../client';
import { events, type Event, type NewEvent } from '../schema/events';

/**
 * Repository for event operations
 */
export class EventRepository {
  constructor(private db: DbClient) {}

  async create(data: NewEvent): Promise<Event> {
    const [result] = await this.db.insert(events).values(data).returning();
    return result;
  }

  async createMany(data: NewEvent[]): Promise<Event[]> {
    return this.db.insert(events).values(data).returning();
  }

  async findByTenant(tenantId: string, limit = 100): Promise<Event[]> {
    return this.db.query.events.findMany({
      where: eq(events.tenantId, tenantId),
      orderBy: (e, { desc }) => [desc(e.timestamp)],
      limit,
    });
  }

  async findUnexported(limit = 1000): Promise<Event[]> {
    return this.db.query.events.findMany({
      where: isNull(events.exportedAt),
      orderBy: (e, { asc }) => [asc(e.timestamp)],
      limit,
    });
  }

  async markExported(ids: string[]): Promise<void> {
    await this.db
      .update(events)
      .set({ exportedAt: new Date() })
      .where(eq(events.id, ids[0])); // TODO: Use inArray for batch
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.db
      .delete(events)
      .where(lte(events.timestamp, cutoff))
      .returning();

    return result.length;
  }
}
