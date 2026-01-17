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
export const quickWinsTool = tool({
  description:
    'Run a Quick Win workflow to generate a short strategic analysis for a company. Use this when users request quick wins, reports, or assessments about their business.',
  parameters: z.object({
    quick_win_type: z
      .enum(QUICK_WIN_TYPES)
      .describe('Type of quick win to generate'),
    company_name: z.string().min(1).describe('Company name'),
    company_url: z.string().min(1).describe('Company website URL (e.g., https://example.com)'),
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
