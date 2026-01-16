import { eq } from 'drizzle-orm';
import type { DbClient } from '../client';
import { tenants, type Tenant, type NewTenant } from '../schema/tenants';

/**
 * Repository for tenant operations
 * Uses repository pattern for future CQRS support
 */
export class TenantRepository {
  constructor(private db: DbClient) {}

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, id),
    });
    return result ?? null;
  }

  async findAll(): Promise<Tenant[]> {
    return this.db.query.tenants.findMany();
  }

  async findActive(): Promise<Tenant[]> {
    return this.db.query.tenants.findMany({
      where: eq(tenants.isActive, true),
    });
  }

  async create(data: NewTenant): Promise<Tenant> {
    const [result] = await this.db.insert(tenants).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<NewTenant>): Promise<Tenant | null> {
    const [result] = await this.db
      .update(tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return result ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(tenants).where(eq(tenants.id, id)).returning();
    return result.length > 0;
  }
}
