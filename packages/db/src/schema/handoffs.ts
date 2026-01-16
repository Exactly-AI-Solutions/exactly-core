import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

/**
 * Email Handoffs - Pre-seeded conversation contexts with shareable links
 * Used to inject background context into AI system prompt for users
 * coming from email conversations or other channels.
 */
export const handoffs = pgTable(
  'handoffs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id),

    // URL-safe share token (32 chars, base62 encoding, ~190 bits entropy)
    shareToken: text('share_token').notNull().unique(),

    // The hidden context to inject into system prompt
    context: text('context').notNull(),

    // Optional metadata for tracking (source system, customer ID, etc.)
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),

    // Expiry configuration
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    // Usage tracking
    usedCount: integer('used_count').default(0).notNull(),
    maxUses: integer('max_uses'), // null = unlimited

    // Soft delete / deactivation
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_handoffs_tenant').on(table.tenantId),
    index('idx_handoffs_share_token').on(table.shareToken),
    index('idx_handoffs_expires_at').on(table.expiresAt),
  ]
);

export type Handoff = typeof handoffs.$inferSelect;
export type NewHandoff = typeof handoffs.$inferInsert;
