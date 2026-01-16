import { tool } from 'ai';
import { z } from 'zod';

/**
 * Calendly URL for Exactly consultations
 * This should be configured via environment variable in production
 */
const CALENDLY_URL = process.env.CALENDLY_URL || 'https://calendly.com/exactly-ai/consultation';

/**
 * Schedule Consultation tool
 * Returns a component instruction for the widget to render Calendly inline
 */
export const scheduleConsultationTool = tool({
  description:
    'Use this tool when the user wants to schedule a meeting, consultation, call, or demo. This will display an inline calendar for them to book directly in the chat.',
  parameters: z.object({}),
  execute: async () => {
    // Return component instruction for the widget
    return {
      component: 'calendly',
      props: {
        url: CALENDLY_URL,
      },
      message:
        "I've opened our scheduling calendar below. Pick a time that works for you and we'll confirm the details.",
    };
  },
});
