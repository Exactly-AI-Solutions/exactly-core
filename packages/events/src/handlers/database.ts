import type { BaseEvent } from '@exactly/types';
import type { EventHandler } from '../emitter';

/**
 * Event write function type - allows dependency injection of database write
 */
export type EventWriteFunction = (event: {
  id: string;
  type: string;
  tenantId: string;
  sessionId?: string;
  userId?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}) => Promise<void>;

/**
 * Database event handler configuration
 */
export interface DatabaseEventHandlerConfig {
  /** Function to write event to database */
  writeEvent?: EventWriteFunction;
  /** Log events to console (default: true in development) */
  logToConsole?: boolean;
}

/**
 * Database event handler - writes events to the events table
 */
export class DatabaseEventHandler implements EventHandler {
  private config: DatabaseEventHandlerConfig;

  constructor(config: DatabaseEventHandlerConfig = {}) {
    this.config = {
      logToConsole: process.env.NODE_ENV !== 'production',
      ...config,
    };
  }

  async handle(event: BaseEvent): Promise<void> {
    if (this.config.logToConsole) {
      console.log(`[Event] ${event.type}`, {
        id: event.id,
        tenantId: event.tenantId,
        sessionId: event.sessionId,
        timestamp: new Date(event.timestamp).toISOString(),
        metadata: event.metadata,
      });
    }

    // Write to database if write function is configured
    if (this.config.writeEvent) {
      await this.config.writeEvent({
        id: event.id,
        type: event.type,
        tenantId: event.tenantId,
        sessionId: event.sessionId,
        userId: event.userId,
        metadata: event.metadata,
        timestamp: new Date(event.timestamp),
      });
    }
  }
}
