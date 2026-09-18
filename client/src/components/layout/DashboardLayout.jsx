import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children, role }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar role={role} />
        <main className="flex-1 overflow-y-auto p-6 custom-scroll">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
