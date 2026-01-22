import { openai } from '@ai-sdk/openai';
import { streamText, generateText, type CoreMessage, type CoreTool } from 'ai';
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

  const result = streamText({
    model: openai(agentConfig.model),
    system: systemMessage,
    messages,
    temperature: agentConfig.temperature,
    maxTokens: agentConfig.maxTokens,
    tools: enableTools ? chatbotTools : undefined,
    maxSteps: 5, // Allow multi-step tool usage
  });

  return result;
}

/**
 * Generate contextual follow-up suggestions based on conversation history.
 * Uses a fast model (gpt-4o-mini) to minimize latency.
 */
export async function generateSuggestions(messages: CoreMessage[], assistantResponse: string): Promise<string[]> {
  try {
    // Build a condensed conversation summary for the prompt
    const recentMessages = messages.slice(-4); // Last 4 messages for context
    const conversationContext = recentMessages
      .map((m) => `${m.role}: ${typeof m.content === 'string' ? m.content.slice(0, 200) : '...'}`)
      .join('\n');

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      temperature: 0.7,
      maxTokens: 150,
      system: `You generate brief follow-up questions for a chatbot conversation.
Return exactly 3 short questions (max 6 words each) that the user might want to ask next.
Questions should be natural continuations of the conversation.
Return ONLY a JSON array of strings, nothing else. Example: ["How does pricing work?","Can I see a demo?","What's the timeline?"]`,
      prompt: `Recent conversation:
${conversationContext}

Latest assistant response:
${assistantResponse.slice(0, 500)}

Generate 3 brief follow-up questions:`,
    });

    // Parse the JSON response
    const text = result.text.trim();
    const suggestions = JSON.parse(text);

    if (Array.isArray(suggestions) && suggestions.every((s) => typeof s === 'string')) {
      return suggestions.slice(0, 4); // Max 4 suggestions
    }

    return [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}
