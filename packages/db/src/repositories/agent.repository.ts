import { eq } from 'drizzle-orm';
import type { DbClient } from '../client';
import { agentConfigs, type AgentConfig, type NewAgentConfig } from '../schema/agents';

/**
 * Repository for agent configuration operations
 */
export class AgentConfigRepository {
  constructor(private db: DbClient) {}

  async findById(id: string): Promise<AgentConfig | null> {
    const result = await this.db.query.agentConfigs.findFirst({
      where: eq(agentConfigs.id, id),
    });
    return result ?? null;
  }

  async findByTenantId(tenantId: string): Promise<AgentConfig | null> {
    const result = await this.db.query.agentConfigs.findFirst({
      where: eq(agentConfigs.tenantId, tenantId),
    });
    return result ?? null;
  }

  async create(data: NewAgentConfig): Promise<AgentConfig> {
    const [result] = await this.db.insert(agentConfigs).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<NewAgentConfig>): Promise<AgentConfig | null> {
    const [result] = await this.db
      .update(agentConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agentConfigs.id, id))
      .returning();
    return result ?? null;
  }
}
