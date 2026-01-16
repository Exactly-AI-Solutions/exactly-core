/**
 * Agent configuration for a tenant
 */
export interface AgentConfig {
  id: string;
  tenantId: string;

  // Model settings
  model: string;
  temperature: number;
  maxTokens: number;

  // Prompts
  systemPrompt: string;
  instructions: string[];

  // Tools
  tools: ToolConfig[];

  // Knowledge base
  knowledgeBaseId?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tool configuration
 */
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  enabled: boolean;
}

/**
 * Available model options
 */
export type ModelId =
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229';
