import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function Metrics() {
  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Metrics Overview</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Add metrics overview content here */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}