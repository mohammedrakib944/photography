import { AdminNav } from "@/features/admin";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen w-300 px-4 py-10 md:px-8">
      <AdminNav />
      {children}
    </div>
  );
}
