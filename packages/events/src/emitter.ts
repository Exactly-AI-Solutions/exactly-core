import type { BaseEvent } from '@exactly/types';

/**
 * Event handler interface
 */
export interface EventHandler {
  handle(event: BaseEvent): Promise<void>;
}

/**
 * Event emitter configuration
 */
export interface EventConfig {
  handlers?: EventHandler[];
}

/**
 * Event emitter - emits events to all registered handlers
 */
export class EventEmitter {
  private handlers: EventHandler[] = [];

  constructor(config: EventConfig = {}) {
    if (config.handlers) {
      this.handlers = config.handlers;
    }
  }

  /**
   * Register an event handler
   */
  addHandler(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Remove an event handler
   */
  removeHandler(handler: EventHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  /**
   * Emit an event to all handlers
   * Non-blocking - handlers run in parallel
   */
  async emit(event: Partial<BaseEvent> & { type: string; tenantId: string }): Promise<void> {
    // Enrich event with defaults
    const enrichedEvent: BaseEvent = {
      id: event.id || crypto.randomUUID(),
      type: event.type,
      timestamp: event.timestamp || Date.now(),
      tenantId: event.tenantId,
      sessionId: event.sessionId,
      userId: event.userId,
      metadata: event.metadata || {},
    };

    // Send to all handlers (non-blocking)
    const results = await Promise.allSettled(
      this.handlers.map((handler) => handler.handle(enrichedEvent))
    );

    // Log any failures (but don't throw)
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Event handler ${index} failed for event ${enrichedEvent.type}:`,
          result.reason
        );
      }
    });
  }

  /**
   * Emit multiple events
   */
  async emitBatch(
    events: Array<Partial<BaseEvent> & { type: string; tenantId: string }>
  ): Promise<void> {
    await Promise.all(events.map((event) => this.emit(event)));
  }
}

/**
 * Create a pre-configured event emitter
 */
export function createEventEmitter(config: EventConfig = {}): EventEmitter {
  return new EventEmitter(config);
}
