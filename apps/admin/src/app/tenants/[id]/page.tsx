'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTenant, getEmbedCode, updateTenant, type TenantDetail, type EmbedCode } from '@/lib/api';

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [embedCode, setEmbedCode] = useState<EmbedCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTenant();
  }, [tenantId]);

  async function loadTenant() {
    try {
      setLoading(true);
      const [tenantData, embed] = await Promise.all([
        getTenant(tenantId),
        getEmbedCode(tenantId),
      ]);
      setTenant(tenantData);
      setEmbedCode(embed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive() {
    if (!tenant) return;
    setSaving(true);
    try {
      await updateTenant(tenantId, { isActive: !tenant.tenant.isActive });
      await loadTenant();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update tenant');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: '#DC2626' }}>{error}</p>
        <a href="/tenants" style={{ color: '#0066FF' }}>
          Back to Tenants
        </a>
      </div>
    );
  }

  if (!tenant) {
    return <p>Tenant not found</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <a href="/tenants" style={{ color: '#6B7280', textDecoration: 'none', fontSize: '0.875rem' }}>
            &larr; Back to Tenants
          </a>
          <h2 style={{ margin: '0.5rem 0 0' }}>{tenant.tenant.name}</h2>
          <code style={{ backgroundColor: '#F3F4F6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
            {tenant.tenant.id}
          </code>
        </div>
        <button
          onClick={handleToggleActive}
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: tenant.tenant.isActive ? '#FEE2E2' : '#D1FAE5',
            color: tenant.tenant.isActive ? '#991B1B' : '#065F46',
            border: 'none',
            borderRadius: '6px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : tenant.tenant.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column - Config */}
        <div>
          <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Configuration</h3>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280' }}>Status</strong>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor: tenant.tenant.isActive ? '#D1FAE5' : '#FEE2E2',
                  color: tenant.tenant.isActive ? '#065F46' : '#991B1B',
                }}
              >
                {tenant.tenant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280' }}>Allowed Domains</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {tenant.tenant.allowedDomains.map((domain, i) => (
                  <code
                    key={i}
                    style={{
                      backgroundColor: '#F3F4F6',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                    }}
                  >
                    {domain}
                  </code>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280' }}>Created</strong>
              <span>{new Date(tenant.tenant.createdAt).toLocaleString()}</span>
            </div>
          </section>

          {tenant.agentConfig && (
            <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 1rem' }}>Agent Configuration</h3>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280' }}>Model</strong>
                <code style={{ backgroundColor: '#F3F4F6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  {tenant.agentConfig.model}
                </code>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280' }}>Temperature</strong>
                <span>{tenant.agentConfig.temperature}</span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280' }}>Max Tokens</strong>
                <span>{tenant.agentConfig.maxTokens}</span>
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                  System Prompt
                </strong>
                <pre
                  style={{
                    backgroundColor: '#F3F4F6',
                    padding: '1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}
                >
                  {tenant.agentConfig.systemPrompt}
                </pre>
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Embed Code */}
        <div>
          <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Embed Code</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Copy and paste this code into your website to embed the chatbot:
            </p>

            {embedCode && (
              <>
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
                  {embedCode.embedCode}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(embedCode.embedCode)}
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

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280' }}>API URL</strong>
                  <code style={{ fontSize: '0.875rem' }}>{embedCode.apiUrl}</code>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280' }}>CDN URL</strong>
                  <code style={{ fontSize: '0.875rem' }}>{embedCode.cdnUrl}</code>
                </div>
              </>
            )}
          </section>

          <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Handoff Link</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Create handoff links to pre-seed conversations with context:
            </p>
            <a
              href={`/handoffs/new?tenant=${tenantId}`}
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#0066FF',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              Create Handoff
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
