const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || '';

async function adminFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': ADMIN_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export interface TenantListItem {
  id: string;
  name: string;
  allowedDomains: string[];
  isActive: boolean;
  createdAt: string;
}

export interface TenantDetail {
  tenant: {
    id: string;
    name: string;
    allowedDomains: string[];
    uiConfig: Record<string, unknown>;
    widgetConfig: Record<string, unknown>;
    isActive: boolean;
    createdAt: string;
  };
  agentConfig: {
    id: string;
    model: string;
    temperature: string;
    maxTokens: number;
    systemPrompt: string;
    instructions: string[];
  } | null;
}

export interface CreateTenantInput {
  id: string;
  name: string;
  allowedDomains: string[];
  uiConfig?: Record<string, unknown>;
  agentConfig?: {
    model?: string;
    temperature?: string;
    maxTokens?: number;
    systemPrompt?: string;
    instructions?: string[];
  };
}

export interface EmbedCode {
  tenantId: string;
  embedCode: string;
  apiUrl: string;
  cdnUrl: string;
}

export async function listTenants(): Promise<{ tenants: TenantListItem[] }> {
  return adminFetch('/admin/v1/tenants');
}

export async function getTenant(id: string): Promise<TenantDetail> {
  return adminFetch(`/admin/v1/tenants/${id}`);
}

export async function createTenant(data: CreateTenantInput): Promise<{ tenant: TenantListItem; created: boolean }> {
  return adminFetch('/admin/v1/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTenant(
  id: string,
  data: Partial<{
    name: string;
    allowedDomains: string[];
    uiConfig: Record<string, unknown>;
    isActive: boolean;
  }>
): Promise<{ tenant: TenantListItem }> {
  return adminFetch(`/admin/v1/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTenant(id: string): Promise<{ success: boolean }> {
  return adminFetch(`/admin/v1/tenants/${id}`, {
    method: 'DELETE',
  });
}

export async function getEmbedCode(id: string): Promise<EmbedCode> {
  return adminFetch(`/admin/v1/tenants/${id}/embed`);
}
