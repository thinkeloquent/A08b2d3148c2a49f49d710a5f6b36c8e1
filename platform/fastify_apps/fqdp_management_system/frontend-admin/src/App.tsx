/**
 * FQDP Management System - Admin Dashboard (Placeholder)
 *
 * Phase 1: Minimal placeholder. Admin functionality is available in the main frontend.
 * Phase 2: Enhanced admin features (diff viewer, bulk insert, data tables) planned for later.
 */

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        FQDP Management System - Admin
      </h1>
      <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#f9fafb' }}>
        <p style={{ marginBottom: '1rem', color: '#374151' }}>
          The admin dashboard is a placeholder. Full management capabilities are available in the main frontend application.
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Phase 2 will add: diff viewer for change tracking, bulk JSON import, enhanced data tables with sorting and export,
          and role-based access controls.
        </p>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Managed Entities</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#4b5563' }}>
          <li>Organizations</li>
          <li>Workspaces</li>
          <li>Teams</li>
          <li>Applications</li>
          <li>Projects</li>
          <li>Resources (with FQDP ID generation)</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
