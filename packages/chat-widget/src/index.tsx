import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget';
import { fetchTenantConfig, validateHandoff } from './lib/api';
import { getOrCreateSession } from './lib/session';
import { telemetry } from './lib/telemetry';
import type { TenantUIConfig } from '@exactly/types';
import './styles.css';

export interface InitOptions {
  tenantId: string;
  apiUrl?: string;
}

export async function init(options: InitOptions): Promise<void> {
  const { tenantId, apiUrl = 'http://localhost:3001' } = options;

  // Fetch tenant config
  let config: TenantUIConfig;
  try {
    config = await fetchTenantConfig(tenantId, apiUrl);
  } catch (error) {
    console.error('[ExactlyChat] Failed to fetch tenant config:', error);
    return;
  }

  // Get or create session
  const sessionId = getOrCreateSession(tenantId);

  // Check for handoff token in URL
  let handoffId: string | undefined;
  const urlParams = new URLSearchParams(window.location.search);
  const handoffToken = urlParams.get('handoff');

  if (handoffToken) {
    const handoffResult = await validateHandoff(handoffToken, apiUrl);
    if (handoffResult.valid && handoffResult.handoffId) {
      handoffId = handoffResult.handoffId;
      console.log('[ExactlyChat] Handoff context loaded');
    } else {
      console.warn('[ExactlyChat] Invalid or expired handoff token:', handoffResult.error);
    }
  }

  // Create container in Shadow DOM for style isolation
  const host = document.createElement('div');
  host.id = 'exactly-chat-root';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Create style element
  const style = document.createElement('style');
  style.textContent = getStyles();
  shadow.appendChild(style);

  // Create container for React
  const container = document.createElement('div');
  container.id = 'exactly-chat-container';
  shadow.appendChild(container);

  // Track widget opened
  telemetry.init(tenantId, sessionId, apiUrl);
  telemetry.track({
    type: 'widget.opened',
    metadata: {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    },
  });

  // Render React app
  createRoot(container).render(
    <ChatWidget
      config={config}
      tenantId={tenantId}
      sessionId={sessionId}
      apiUrl={apiUrl}
      handoffId={handoffId}
    />
  );
}

function getStyles(): string {
  // Base styles for Shadow DOM isolation
  // Additional CSS is injected via INJECT_CSS_PLACEHOLDER at build time
  return `
    #exactly-chat-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    INJECT_CSS_PLACEHOLDER
  `;
}

/**
 * Open the chatbot programmatically
 */
export function open(): void {
  window.dispatchEvent(new CustomEvent('exactly:open'));
}

// Expose to window for UMD
if (typeof window !== 'undefined') {
  (window as unknown as { ExactlyChat: { init: typeof init; open: typeof open } }).ExactlyChat = { init, open };
}
