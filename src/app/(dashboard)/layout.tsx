import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
