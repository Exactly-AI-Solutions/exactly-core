import { tool } from 'ai';
import { z } from 'zod';
import {
  generateQuickWin,
  QUICK_WIN_TYPES,
  type QuickWinType,
} from '../quick-wins/index.js';

/**
 * Quick Wins tool - Generates strategic analysis reports for companies
 * Uses local Vercel AI SDK agents to generate reports
 */
// Regex to reject placeholder values
const notPlaceholder = (val: string) => {
  const placeholders = /^(unknown|n\/a|none|tbd|placeholder|example|test)$/i;
  return !placeholders.test(val.trim());
};

export const quickWinsTool = tool({
  description:
    'Run a Quick Win workflow to generate a short strategic analysis for a company. IMPORTANT: You MUST ask the user for their company name AND website URL before calling this tool. NEVER use placeholder values like "Unknown" - always get real input from the user first.',
  parameters: z.object({
    quick_win_type: z
      .enum(QUICK_WIN_TYPES)
      .describe('Type of quick win to generate'),
    company_name: z
      .string()
      .min(2)
      .refine(notPlaceholder, {
        message: 'Company name must be provided by the user, not a placeholder',
      })
      .describe(
        'The actual company name as provided by the user. NEVER guess or use placeholder values.'
      ),
    company_url: z
      .string()
      .url('Must be a valid URL starting with http:// or https://')
      .refine(notPlaceholder, {
        message: 'Company URL must be provided by the user, not a placeholder',
      })
      .describe(
        'The actual company website URL as provided by the user (must start with https://). NEVER guess or use placeholder values.'
      ),
  }),
  execute: async ({ quick_win_type, company_name, company_url }) => {
    try {
      const result = await generateQuickWin({
        quickWinType: quick_win_type as QuickWinType,
        companyName: company_name,
        companyUrl: company_url,
      });

      return {
        quick_win_type: result.quickWinType,
        quick_win_content: result.content,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Quick Win generation failed: ${message}`);
    }
  },
});
