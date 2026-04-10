import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-surface-50 w-fit min-w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet data-test-id="outlet-c29d22c8" />
        </main>
      </div>
    </div>);

}
