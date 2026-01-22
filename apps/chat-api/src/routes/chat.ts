import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { CoreMessage } from 'ai';
import type { SessionEnv } from '../middleware/index.js';
import { streamChat, generateSuggestions } from '../services/ai.js';
import { agentConfigRepository, sessionRepository, messageRepository, handoffRepository } from '../app.js';
import { createExactlyChatbotPrompt } from '@exactly/agents';

export const chatRoutes = new Hono<SessionEnv>();

// POST /api/v1/chat - Send message and receive streaming response
chatRoutes.post('/', async (c) => {
  // Get tenant and session from middleware context
  const tenantId = c.get('tenantId');
  const clientSessionId = c.get('sessionId');

  const body = await c.req.json();
  const { messages, handoffId } = body;

  if (!messages || !Array.isArray(messages)) {
    return c.json({ error: 'Invalid request body: messages required' }, 400);
  }

  // Load handoff context if provided
  let handoffContext: string | undefined;
  if (handoffId) {
    const handoff = await handoffRepository.findById(handoffId);
    if (handoff && handoff.tenantId === tenantId && handoff.isActive) {
      handoffContext = handoff.context;
      // Increment usage count
      await handoffRepository.incrementUsage(handoffId);
    }
  }

  // Get agent config for this tenant
  const agentConfig = await agentConfigRepository.findByTenantId(tenantId);
  if (!agentConfig) {
    return c.json({ error: 'No agent configured for this tenant' }, 404);
  }

  // For exactly-homepage, use the repo prompt as source of truth
  const systemPrompt = tenantId === 'exactly-homepage'
    ? createExactlyChatbotPrompt()
    : agentConfig.systemPrompt;

  // Get or create database session
  const dbSession = await sessionRepository.getOrCreate(tenantId, clientSessionId);

  // Get the last user message to save
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return c.json({ error: 'Last message must be from user' }, 400);
  }

  // Save user message to database
  const userMessage = await messageRepository.create({
    sessionId: dbSession.id,
    role: 'user',
    content: lastMessage.content,
  });

  // Convert messages to CoreMessage format
  const coreMessages: CoreMessage[] = messages.map((msg: { role: string; content: string }) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return streamSSE(c, async (stream) => {
    let assistantContent = '';
    let assistantMessageId: string | null = null;

    try {
      const result = await streamChat({
        messages: coreMessages,
        agentConfig: {
          model: agentConfig.model,
          temperature: parseFloat(agentConfig.temperature),
          maxTokens: agentConfig.maxTokens,
          systemPrompt,
          instructions: agentConfig.instructions,
        },
        handoffContext,
        enableTools: true,
      });

      // Use fullStream to handle both text and tool events
      for await (const part of result.fullStream) {
        const partType = part.type as string;

        if (partType === 'text-delta' && 'textDelta' in part) {
          assistantContent += part.textDelta;
          await stream.writeSSE({
            data: JSON.stringify({ type: 'text-delta', content: part.textDelta }),
          });
        } else if (partType === 'tool-call' && 'toolName' in part) {
          // Notify client that a tool is being called
          await stream.writeSSE({
            data: JSON.stringify({
              type: 'tool-call',
              toolName: part.toolName,
              args: 'args' in part ? part.args : {},
            }),
          });
        } else if (partType === 'tool-result' && 'result' in part) {
          // Check if tool result contains a component instruction
          const toolResult = part.result as Record<string, unknown> | undefined;
          if (toolResult && typeof toolResult === 'object' && 'component' in toolResult) {
            // Emit component event for the widget to render
            await stream.writeSSE({
              data: JSON.stringify({
                type: 'component',
                component: toolResult.component,
                props: toolResult.props || {},
              }),
            });
            // Also add the message to the content if provided
            if (toolResult.message && typeof toolResult.message === 'string') {
              assistantContent += toolResult.message + '\n';
              await stream.writeSSE({
                data: JSON.stringify({ type: 'text-delta', content: toolResult.message + '\n' }),
              });
            }
          }
        } else if (partType === 'step-finish' && 'finishReason' in part) {
          // Step finished (after tool execution) - notify for debugging
          if (part.finishReason === 'tool-calls') {
            await stream.writeSSE({
              data: JSON.stringify({
                type: 'step-finish',
                finishReason: part.finishReason,
              }),
            });
          }
        } else if (partType === 'error' && 'error' in part) {
          console.error('Stream error:', part.error);
          await stream.writeSSE({
            data: JSON.stringify({
              type: 'error',
              error: String(part.error),
            }),
          });
        }
      }

      // Save assistant message to database after stream completes
      const assistantMessage = await messageRepository.create({
        sessionId: dbSession.id,
        role: 'assistant',
        content: assistantContent,
      });
      assistantMessageId = assistantMessage.id;

      // Get final usage stats
      const usage = await result.usage;

      // Generate contextual suggestions (non-blocking, but we await to include in stream)
      // This runs in parallel with the user reading the response
      const suggestions = await generateSuggestions(coreMessages, assistantContent);
      if (suggestions.length > 0) {
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'suggestions',
            suggestions,
          }),
        });
      }

      await stream.writeSSE({
        data: JSON.stringify({
          type: 'done',
          sessionId: clientSessionId,
          userMessageId: userMessage.id,
          assistantMessageId,
          usage: {
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
          },
        }),
      });
    } catch (error) {
      console.error('Chat stream error:', error);

      // Save error as assistant message if we got any content
      if (assistantContent) {
        await messageRepository.create({
          sessionId: dbSession.id,
          role: 'assistant',
          content: assistantContent,
          metadata: { error: true, errorMessage: error instanceof Error ? error.message : 'Unknown error' },
        });
      }

      await stream.writeSSE({
        data: JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
    }
  });
});

// GET /api/v1/chat/history - Get chat history for current session
chatRoutes.get('/history', async (c) => {
  const clientSessionId = c.get('sessionId');
  const tenantId = c.get('tenantId');

  // Find session in database
  const dbSession = await sessionRepository.findBySessionId(tenantId, clientSessionId);
  if (!dbSession) {
    return c.json({
      tenantId,
      sessionId: clientSessionId,
      messages: [],
    });
  }

  // Fetch messages from database
  const messages = await messageRepository.findBySession(dbSession.id);

  return c.json({
    tenantId,
    sessionId: clientSessionId,
    messages: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    })),
  });
});

// GET /api/v1/chat/history/:sessionId - Get chat history for specific session
chatRoutes.get('/history/:sessionId', async (c) => {
  const requestedSessionId = c.req.param('sessionId');
  const tenantId = c.get('tenantId');

  // Find session in database
  const dbSession = await sessionRepository.findBySessionId(tenantId, requestedSessionId);
  if (!dbSession) {
    return c.json({
      tenantId,
      sessionId: requestedSessionId,
      messages: [],
    });
  }

  // Fetch messages from database
  const messages = await messageRepository.findBySession(dbSession.id);

  return c.json({
    tenantId,
    sessionId: requestedSessionId,
    messages: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    })),
  });
});
