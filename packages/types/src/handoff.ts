/**
 * Request body for creating a new handoff
 */
export interface CreateHandoffRequest {
  /** The handoff context/background to inject into system prompt */
  context: string;
  /** Optional metadata for tracking (source system, customer ID, etc.) */
  metadata?: Record<string, unknown>;
  /** Expiration time in seconds (default: 7 days = 604800) */
  expiresInSeconds?: number;
  /** Maximum number of uses (null/undefined = unlimited) */
  maxUses?: number;
}

/**
 * Response from creating a handoff
 */
export interface CreateHandoffResponse {
  /** Unique ID of the handoff */
  id: string;
  /** The share token for URL construction */
  shareToken: string;
  /** Full shareable URL with handoff token */
  shareUrl: string;
  /** ISO timestamp when the handoff expires */
  expiresAt: string;
}

/**
 * Response from validating a handoff token
 */
export interface ValidateHandoffResponse {
  /** Whether the token is valid */
  valid: boolean;
  /** Handoff ID if valid */
  handoffId?: string;
  /** Tenant ID associated with the handoff */
  tenantId?: string;
  /** Error message if invalid */
  error?: string;
}

/**
 * Handoff data returned from repository
 */
export interface HandoffData {
  id: string;
  tenantId: string;
  shareToken: string;
  context: string;
  metadata: Record<string, unknown>;
  expiresAt: Date;
  usedCount: number;
  maxUses: number | null;
  isActive: boolean;
  createdAt: Date;
}
