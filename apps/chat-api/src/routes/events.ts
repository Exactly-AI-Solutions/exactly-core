import { Hono } from 'hono';
import type { SessionEnv } from '../middleware/index.js';
import { eventRepository } from '../app.js';

// Allowed event types from widget
const ALLOWED_EVENT_TYPES = [
  'widget.opened',
  'widget.closed',
  'widget.message.sent',
  'widget.suggestion.clicked',
  'widget.action.clicked',
  'widget.feedback.submitted',
] as const;

export const eventRoutes = new Hono<SessionEnv>();

// POST /api/v1/events - Receive telemetry events from widget
eventRoutes.post('/', async (c) => {
  const tenantId = c.get('tenantId');
  const sessionId = c.get('sessionId');

  const body = await c.req.json();
  const { events } = body;

  if (!events || !Array.isArray(events)) {
    return c.json({ error: 'Invalid request body: events array required' }, 400);
  }

  // Validate and limit batch size
  if (events.length > 100) {
    return c.json({ error: 'Too many events in batch (max 100)' }, 400);
  }

  // Validate and transform events
  const validEvents: Array<{
    type: string;
    tenantId: string;
    sessionId: string | null;
    metadata: Record<string, unknown>;
    timestamp: Date;
  }> = [];

  for (const event of events) {
    // Validate event type
    if (!event.type || typeof event.type !== 'string') {
      continue; // Skip invalid events
    }

    // Only allow widget events (prevent injection of server-side event types)
    if (!ALLOWED_EVENT_TYPES.includes(event.type as (typeof ALLOWED_EVENT_TYPES)[number])) {
      continue;
    }

    // Validate timestamp
    const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();
    if (isNaN(timestamp.getTime())) {
      continue;
    }

    validEvents.push({
      type: event.type,
      tenantId,
      sessionId,
      metadata: typeof event.metadata === 'object' && event.metadata !== null ? event.metadata : {},
      timestamp,
    });
  }

  // Write valid events to database
  if (validEvents.length > 0) {
    try {
      await eventRepository.createMany(validEvents);
    } catch (error) {
      console.error('Failed to write events to database:', error);
      return c.json({ error: 'Failed to save events' }, 500);
    }
  }

  return c.json({
    received: events.length,
    saved: validEvents.length,
    status: 'ok',
  });
});
