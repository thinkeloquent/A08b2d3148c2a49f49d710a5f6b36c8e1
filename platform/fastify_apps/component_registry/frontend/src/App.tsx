import { ComponentRegistry } from '@/components/ComponentRegistry';
import { AppShell } from './layout/AppShell';

function App() {
  return (
    <AppShell>
      <ComponentRegistry />
    </AppShell>
  );
}

export default App;
