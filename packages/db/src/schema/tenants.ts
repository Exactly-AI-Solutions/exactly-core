import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import type { TenantUIConfig } from '@exactly/types';

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  allowedDomains: text('allowed_domains').array().notNull(),
  uiConfig: jsonb('ui_config').$type<TenantUIConfig>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
