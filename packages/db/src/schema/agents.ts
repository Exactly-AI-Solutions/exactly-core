import { pgTable, text, timestamp, numeric, integer, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import type { ToolConfig } from '@exactly/types';

export const agentConfigs = pgTable('agent_configs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id),
  model: text('model').notNull().default('claude-3-5-sonnet-20241022'),
  temperature: numeric('temperature').default('0.7').notNull(),
  maxTokens: integer('max_tokens').default(4096).notNull(),
  systemPrompt: text('system_prompt').notNull(),
  instructions: jsonb('instructions').$type<string[]>().default([]).notNull(),
  tools: jsonb('tools').$type<ToolConfig[]>().default([]).notNull(),
  knowledgeBaseId: text('knowledge_base_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type AgentConfig = typeof agentConfigs.$inferSelect;
export type NewAgentConfig = typeof agentConfigs.$inferInsert;
