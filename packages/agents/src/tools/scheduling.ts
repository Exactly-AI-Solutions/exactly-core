import { tool } from 'ai';
import { z } from 'zod';

/**
 * Calendly URL for Exactly consultations
 * This should be configured via environment variable in production
 */
const BASE_CALENDLY_URL =
  process.env.CALENDLY_URL || 'https://calendly.com/exactlyaisolutions/15min';

// Add params to hide event details header and make widget more compact
const CALENDLY_URL = `${BASE_CALENDLY_URL}?hide_event_type_details=1&hide_gdpr_banner=1`;

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
