// Tools
export { quickWinsTool, scheduleConsultationTool } from './tools/index.js';

// Quick Wins
export {
  generateQuickWin,
  cleanQuickWinContent,
  QUICK_WIN_TYPES,
  QUICK_WIN_PROMPTS,
  type QuickWinType,
  type QuickWinResult,
  type GenerateQuickWinOptions,
} from './quick-wins/index.js';

// Utilities
export { scrapeHomepage, preprocessHtml, normalizeUrl } from './utils/index.js';

// Prompts
export { createExactlyChatbotPrompt } from './prompts/index.js';

// All chatbot tools bundled for convenience
export const chatbotTools = {
  quickWins: async () => (await import('./tools/quick-wins.js')).quickWinsTool,
};
