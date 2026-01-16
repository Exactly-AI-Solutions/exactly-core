import type { TenantUIConfig, MessageRole, ValidateHandoffResponse } from '@exactly/types';

/**
 * Validate a handoff token
 */
export async function validateHandoff(
  token: string,
  apiUrl: string
): Promise<ValidateHandoffResponse> {
  try {
    const response = await fetch(`${apiUrl}/api/v1/handoffs/validate/${token}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate token',
    };
  }
}

/**
 * Fetch tenant UI configuration
 */
export async function fetchTenantConfig(
  tenantId: string,
  apiUrl: string
): Promise<TenantUIConfig> {
  const response = await fetch(`${apiUrl}/api/v1/tenants/${tenantId}/config`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tenant config: ${response.status}`);
  }

  return response.json();
}

/**
 * Component event data
 */
export interface ComponentEvent {
  component: string;
  props: Record<string, unknown>;
}

/**
 * Stream handler callbacks
 */
export interface StreamHandler {
  onTextDelta: (delta: string) => void;
  onComponent?: (component: ComponentEvent) => void;
  onDone: (usage?: { promptTokens: number; completionTokens: number }) => void;
  onError: (error: Error) => void;
}

/**
 * Send a message and stream the response
 */
export async function sendMessage(
  tenantId: string,
  sessionId: string,
  messages: Array<{ role: MessageRole; content: string }>,
  apiUrl: string,
  handler: StreamHandler,
  handoffId?: string
): Promise<void> {
  const response = await fetch(`${apiUrl}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
      'X-Session-Id': sessionId,
    },
    body: JSON.stringify({ messages, handoffId }),
  });

  if (!response.ok) {
    handler.onError(new Error(`Chat request failed: ${response.status}`));
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    handler.onError(new Error('No response body'));
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Stream ended - server sends 'done' event before closing, so no need to call onDone here
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data);

            switch (event.type) {
              case 'text-delta':
                handler.onTextDelta(event.content);
                break;
              case 'component':
                if (handler.onComponent) {
                  handler.onComponent({
                    component: event.component,
                    props: event.props || {},
                  });
                }
                break;
              case 'done':
                handler.onDone(event.usage);
                break;
              case 'error':
                handler.onError(new Error(event.error));
                break;
            }
          } catch {
            // Ignore non-JSON lines
          }
        }
      }
    }
  } catch (error) {
    handler.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Submit a vote on a message
 */
export async function submitVote(
  messageId: string,
  tenantId: string,
  sessionId: string,
  isUpvoted: boolean,
  apiUrl: string
): Promise<void> {
  const response = await fetch(`${apiUrl}/api/v1/messages/${messageId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
      'X-Session-Id': sessionId,
    },
    body: JSON.stringify({ isUpvoted }),
  });

  if (!response.ok) {
    throw new Error(`Vote request failed: ${response.status}`);
  }
}
