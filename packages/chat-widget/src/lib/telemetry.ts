import type { BaseEvent } from '@exactly/types';

type PartialEvent = Omit<BaseEvent, 'id' | 'timestamp' | 'tenantId' | 'sessionId'>;

interface TelemetryConfig {
  tenantId: string;
  sessionId: string;
  apiUrl: string;
  batchSize: number;
  flushInterval: number;
}

class Telemetry {
  private config: TelemetryConfig | null = null;
  private queue: BaseEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize telemetry with tenant and session info
   */
  init(tenantId: string, sessionId: string, apiUrl: string): void {
    this.config = {
      tenantId,
      sessionId,
      apiUrl,
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
    };

    // Start flush timer
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  /**
   * Track an event
   */
  track(event: PartialEvent): void {
    if (!this.config) {
      console.warn('[ExactlyChat] Telemetry not initialized');
      return;
    }

    const fullEvent: BaseEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tenantId: this.config.tenantId,
      sessionId: this.config.sessionId,
      ...event,
    };

    this.queue.push(fullEvent);

    // Flush if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush queued events to the server
   */
  async flush(): Promise<void> {
    if (!this.config || this.queue.length === 0) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch(`${this.config.apiUrl}/api/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': this.config.tenantId,
          'X-Session-Id': this.config.sessionId,
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      // Re-queue events on failure (with limit to prevent memory issues)
      if (this.queue.length < 100) {
        this.queue.unshift(...events);
      }
      console.error('[ExactlyChat] Failed to send telemetry:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

export const telemetry = new Telemetry();
