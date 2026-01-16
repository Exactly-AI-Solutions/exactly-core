/**
 * Quick Win Agents
 * Uses Vercel AI SDK to generate quick win reports
 */

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { QUICK_WIN_PROMPTS } from './prompts';
import { scrapeHomepage, normalizeUrl } from '../utils/scraper';

/**
 * Quick win types available
 */
export const QUICK_WIN_TYPES = [
  'ICP Check',
  'Brand Reputation Snapshot',
  'Overhead Check',
  'CRO Assessment',
  'Sales Tips',
  'AI in your Industry',
  'SEO Opportunities Report',
  'Weak CTA Detector',
  'AI Sales Playbook',
] as const;

export type QuickWinType = (typeof QUICK_WIN_TYPES)[number];

/**
 * Result from a quick win generation
 */
export interface QuickWinResult {
  quickWinType: QuickWinType;
  content: string;
  companyName: string;
  companyUrl: string;
}

/**
 * Options for generating a quick win
 */
export interface GenerateQuickWinOptions {
  quickWinType: QuickWinType;
  companyName: string;
  companyUrl: string;
  /** Model to use (default: gpt-4o-mini) */
  model?: string;
}

/**
 * Generate a quick win report for a company
 *
 * @param options - Options for generating the quick win
 * @returns The generated quick win report
 */
export async function generateQuickWin(
  options: GenerateQuickWinOptions
): Promise<QuickWinResult> {
  const {
    quickWinType,
    companyName,
    companyUrl,
    model = 'gpt-4o-mini',
  } = options;

  // Get the prompt for this quick win type
  const systemPrompt = QUICK_WIN_PROMPTS[quickWinType];
  if (!systemPrompt) {
    throw new Error(`Unknown quick win type: ${quickWinType}`);
  }

  // Normalize the URL
  const normalizedUrl = normalizeUrl(companyUrl);

  // Scrape the homepage
  console.log(`[Quick Win] Scraping homepage: ${normalizedUrl}`);
  let homepageHtml: string;
  try {
    homepageHtml = await scrapeHomepage(normalizedUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to scrape homepage: ${message}`);
  }

  // Generate the report using the AI SDK
  console.log(`[Quick Win] Generating ${quickWinType} report for ${companyName}`);
  const userPrompt = `Create a ${quickWinType} report for the following company.

Company Name: ${companyName}
Company URL: ${normalizedUrl}

Here is the HTML from their homepage:

<HTML>
${homepageHtml}
</HTML>`;

  const result = await generateText({
    model: openai(model),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  console.log(`[Quick Win] Successfully generated ${quickWinType} report for ${companyName}`);

  return {
    quickWinType,
    content: result.text,
    companyName,
    companyUrl: normalizedUrl,
  };
}

/**
 * Clean up the quick win content by removing JSON encoding artifacts
 * (for compatibility with previous API responses)
 */
export function cleanQuickWinContent(content: string): string {
  // If the content is JSON-encoded, decode it
  if (content.startsWith('"') && content.endsWith('"')) {
    try {
      content = JSON.parse(content);
    } catch {
      // Not valid JSON, return as-is
    }
  }

  // Replace literal \n with actual newlines
  content = content.replace(/\\n/g, '\n');

  return content;
}
