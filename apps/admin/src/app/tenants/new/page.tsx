'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTenant, getEmbedCode } from '@/lib/api';

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    allowedDomains: 'localhost',
    greeting: 'Hi! How can I help you today?',
    systemPrompt: 'You are a helpful assistant.',
    suggestedPrompts: 'What can you help me with?\nTell me more about your services',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const domains = formData.allowedDomains
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean);

      const suggestions = formData.suggestedPrompts
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await createTenant({
        id: formData.id,
        name: formData.name,
        allowedDomains: domains,
        uiConfig: {
          theme: {
            primaryColor: '#0066FF',
            backgroundColor: '#FFFFFF',
            textColor: '#1A1A1A',
            borderRadius: 12,
            position: 'bottom-right',
          },
          greeting: formData.greeting,
          placeholderText: 'Type a message...',
          suggestedPrompts: suggestions,
          components: {
            suggestions: true,
            quickActions: false,
            feedbackButtons: true,
            typingIndicator: true,
            fileUpload: false,
          },
        },
        agentConfig: {
          model: 'gpt-4o-mini',
          systemPrompt: formData.systemPrompt,
          instructions: [],
        },
      });

      // Get embed code for the new tenant
      const embed = await getEmbedCode(formData.id);
      setEmbedCode(embed.embedCode);
      setCreatedTenantId(formData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  }

  if (embedCode && createdTenantId) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Tenant Created!</h2>
        <p style={{ color: '#059669' }}>
          Tenant <strong>{createdTenantId}</strong> has been created successfully.
        </p>

        <div style={{ marginTop: '1.5rem' }}>
          <h3>Embed Code</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Copy and paste this code into your website to embed the chatbot:
          </p>
          <pre
            style={{
              backgroundColor: '#1F2937',
              color: '#E5E7EB',
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {embedCode}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(embedCode)}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0066FF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Copy to Clipboard
          </button>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <a
            href={`/tenants/${createdTenantId}`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#E5E7EB',
              color: '#1F2937',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            View Tenant Details
          </a>
          <a
            href="/tenants/new"
            onClick={() => {
              setEmbedCode(null);
              setCreatedTenantId(null);
              setFormData({
                id: '',
                name: '',
                allowedDomains: 'localhost',
                greeting: 'Hi! How can I help you today?',
                systemPrompt: 'You are a helpful assistant.',
                suggestedPrompts: 'What can you help me with?\nTell me more about your services',
              });
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0066FF',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            Create Another Tenant
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Create New Tenant</h2>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Tenant ID *
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            placeholder="my-company"
            required
            pattern="[a-z0-9-]+"
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '1rem',
            }}
          />
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Company"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Allowed Domains *
          </label>
          <textarea
            value={formData.allowedDomains}
            onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
            placeholder="example.com&#10;*.example.com"
            required
            rows={3}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '1rem',
              fontFamily: 'monospace',
            }}
          />
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
            One domain per line. Use * for wildcards (e.g., *.example.com)
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Greeting Message
          </label>
          <input
            type="text"
            value={formData.greeting}
            onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
            placeholder="Hi! How can I help you today?"
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            System Prompt
          </label>
          <textarea
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            placeholder="You are a helpful assistant..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Suggested Prompts
          </label>
          <textarea
            value={formData.suggestedPrompts}
            onChange={(e) => setFormData({ ...formData, suggestedPrompts: e.target.value })}
            placeholder="What can you help me with?&#10;Tell me about pricing"
            rows={3}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '1rem',
            }}
          />
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
            One suggestion per line
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#9CA3AF' : '#0066FF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {loading ? 'Creating...' : 'Create Tenant'}
          </button>
          <a
            href="/tenants"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#E5E7EB',
              color: '#1F2937',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
