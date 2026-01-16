'use client';

import { useEffect, useState } from 'react';
import { listTenants, deleteTenant, type TenantListItem } from '@/lib/api';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    try {
      setLoading(true);
      const data = await listTenants();
      setTenants(data.tenants);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(`Are you sure you want to deactivate tenant "${id}"?`)) {
      return;
    }

    try {
      await deleteTenant(id);
      await loadTenants();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete tenant');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Tenants</h2>
        <a
          href="/tenants/new"
          style={{
            backgroundColor: '#0066FF',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          + New Tenant
        </a>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: '#DC2626' }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: '#F3F4F6' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>ID</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Domains</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} style={{ borderTop: '1px solid #E5E7EB' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <code style={{ backgroundColor: '#F3F4F6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                    {tenant.id}
                  </code>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>{tenant.name}</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                  {tenant.allowedDomains.slice(0, 2).join(', ')}
                  {tenant.allowedDomains.length > 2 && ` +${tenant.allowedDomains.length - 2}`}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      backgroundColor: tenant.isActive ? '#D1FAE5' : '#FEE2E2',
                      color: tenant.isActive ? '#065F46' : '#991B1B',
                    }}
                  >
                    {tenant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <a
                    href={`/tenants/${tenant.id}`}
                    style={{ color: '#0066FF', textDecoration: 'none', marginRight: '1rem', fontSize: '0.875rem' }}
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(tenant.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                  No tenants found. Create your first tenant to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
