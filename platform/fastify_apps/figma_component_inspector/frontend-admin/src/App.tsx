export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Figma Component Inspector - Admin
      </h1>
      <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#f9fafb' }}>
        <p style={{ marginBottom: '1rem', color: '#374151' }}>
          The admin dashboard is a placeholder. The full component inspection experience is available in the main frontend application.
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Phase 2 will add: Figma API token management, usage analytics, cached file browsing,
          and team-level access controls.
        </p>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Features</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#4b5563' }}>
          <li>Figma file inspection and component tree browsing</li>
          <li>Component preview with image rendering</li>
          <li>CSS property extraction and design token display</li>
          <li>Read-only Figma comments viewer</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
