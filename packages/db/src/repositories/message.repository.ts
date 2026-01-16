import { eq, asc } from 'drizzle-orm';
import type { DbClient } from '../client';
import {
  chatMessages,
  messageVotes,
  type ChatMessage,
  type NewChatMessage,
  type MessageVote,
  type NewMessageVote,
} from '../schema/messages';

/**
 * Repository for message operations
 */
export class MessageRepository {
  constructor(private db: DbClient) {}

  async findById(id: string): Promise<ChatMessage | null> {
    const result = await this.db.query.chatMessages.findFirst({
      where: eq(chatMessages.id, id),
    });
    return result ?? null;
  }

  async findBySession(sessionId: string): Promise<ChatMessage[]> {
    return this.db.query.chatMessages.findMany({
      where: eq(chatMessages.sessionId, sessionId),
      orderBy: [asc(chatMessages.createdAt)],
    });
  }

  async create(data: NewChatMessage): Promise<ChatMessage> {
    const [result] = await this.db.insert(chatMessages).values(data).returning();
    return result;
  }

  async createMany(data: NewChatMessage[]): Promise<ChatMessage[]> {
    return this.db.insert(chatMessages).values(data).returning();
  }

  // Vote operations
  async findVote(messageId: string, _sessionId: string): Promise<MessageVote | null> {
    const result = await this.db.query.messageVotes.findFirst({
      where: eq(messageVotes.messageId, messageId),
    });
    return result ?? null;
  }

  async upsertVote(data: NewMessageVote): Promise<MessageVote> {
    const [result] = await this.db
      .insert(messageVotes)
      .values(data)
      .onConflictDoUpdate({
        target: [messageVotes.messageId, messageVotes.sessionId],
        set: { isUpvoted: data.isUpvoted },
      })
      .returning();
    return result;
  }
}
