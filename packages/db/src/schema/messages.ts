import { pgTable, text, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';
import { chatSessions } from './sessions';
import type { MessagePart, MessageAttachment } from '@exactly/types';

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => chatSessions.id),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  parts: jsonb('parts').$type<MessagePart[]>().default([]).notNull(),
  attachments: jsonb('attachments').$type<MessageAttachment[]>().default([]).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export const messageVotes = pgTable('message_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => chatMessages.id),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => chatSessions.id),
  isUpvoted: boolean('is_upvoted').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type MessageVote = typeof messageVotes.$inferSelect;
export type NewMessageVote = typeof messageVotes.$inferInsert;
