import { AuthProvider } from '@/components/AuthProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
