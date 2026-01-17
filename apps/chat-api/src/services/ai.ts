import { openai } from '@ai-sdk/openai';
import { streamText, type CoreMessage, type CoreTool } from 'ai';
import { quickWinsTool, scheduleConsultationTool } from '@exactly/agents';

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  instructions: string[];
}

export interface StreamChatOptions {
  messages: CoreMessage[];
  agentConfig: AgentConfig;
  /** Optional handoff context to inject into system prompt (hidden from user) */
  handoffContext?: string;
  /** Enable tools for this chat */
  enableTools?: boolean;
}

// Tools available for the chatbot
const chatbotTools: Record<string, CoreTool> = {
  quickWins: quickWinsTool,
  scheduleConsultation: scheduleConsultationTool,
};

export async function streamChat({ messages, agentConfig, handoffContext, enableTools = true }: StreamChatOptions) {
  console.log('[AI] streamChat called, model:', agentConfig.model);
  console.log('[AI] OPENAI_API_KEY set:', !!process.env.OPENAI_API_KEY);

  const systemParts = [
    agentConfig.systemPrompt,
    ...agentConfig.instructions.map((instruction) => `- ${instruction}`),
  ];

  // Inject handoff context if provided (hidden from user, only in system prompt)
  if (handoffContext) {
    systemParts.push(
      '\n--- EMAIL HANDOFF CONTEXT ---',
      'Background information from previous email conversation with this user:',
      handoffContext,
      '--- END HANDOFF CONTEXT ---'
    );
  }

  const systemMessage = systemParts.join('\n\n');

  console.log('[AI] Calling streamText with model:', agentConfig.model);
  const result = streamText({
    model: openai(agentConfig.model),
    system: systemMessage,
    messages,
    temperature: agentConfig.temperature,
    maxTokens: agentConfig.maxTokens,
    tools: enableTools ? chatbotTools : undefined,
    maxSteps: 5, // Allow multi-step tool usage
  });
  console.log('[AI] streamText returned');

  return result;
}
