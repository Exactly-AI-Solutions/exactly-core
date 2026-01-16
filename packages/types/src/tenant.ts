/**
 * Tenant - A client using the Exactly platform
 */
export interface Tenant {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  allowedDomains: string[];
  uiConfig: TenantUIConfig;
  isActive: boolean;
}

/**
 * Quick action button configuration
 */
export interface QuickActionConfig {
  id: string;
  label: string;
  action: string; // URL for links, or action identifier
  type: 'link' | 'action';
}

/**
 * UI Configuration for the chat widget
 */
export interface TenantUIConfig {
  components: {
    suggestions: boolean;
    quickActions: boolean;
    fileUpload: boolean;
    feedbackButtons: boolean;
    typingIndicator: boolean;
  };
  greeting: string;
  placeholderText: string;
  suggestedPrompts?: string[];
  quickActionButtons?: QuickActionConfig[];
  theme: TenantTheme;
}

/**
 * Theme configuration for the chat widget
 */
export interface TenantTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  position: 'bottom-right' | 'bottom-left';
  borderRadius: number;
}

/**
 * Security configuration for a tenant
 */
export interface TenantSecurityConfig {
  tenantId: string;
  allowedDomains: string[];
  rateLimits: {
    messagesPerMinute: number;
    messagesPerDay: number;
  };
}
