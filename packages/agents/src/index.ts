// Tools
export { quickWinsTool, scheduleConsultationTool } from './tools';

// Quick Wins
export {
  generateQuickWin,
  cleanQuickWinContent,
  QUICK_WIN_TYPES,
  QUICK_WIN_PROMPTS,
  type QuickWinType,
  type QuickWinResult,
  type GenerateQuickWinOptions,
} from './quick-wins';

// Utilities
export { scrapeHomepage, preprocessHtml, normalizeUrl } from './utils';

// Prompts
export { createExactlyChatbotPrompt } from './prompts';

// All chatbot tools bundled for convenience
export const chatbotTools = {
  quickWins: async () => (await import('./tools/quick-wins')).quickWinsTool,
};
