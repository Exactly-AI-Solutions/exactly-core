import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    tenantId: text('tenant_id').notNull(),
    sessionId: text('session_id'),
    userId: text('user_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    exportedAt: timestamp('exported_at', { withTimezone: true }), // NULL until exported to Data Lake
  },
  (table) => [
    index('idx_events_type').on(table.type),
    index('idx_events_tenant').on(table.tenantId),
    index('idx_events_timestamp').on(table.timestamp),
    index('idx_events_not_exported')
      .on(table.exportedAt)
      .where(sql`${table.exportedAt} IS NULL`),
  ]
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
