import { AdminNav } from "@/components/admin-nav";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-8 md:px-8">
      <AdminNav />
      {children}
    </div>
  );
}
