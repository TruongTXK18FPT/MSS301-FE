'use client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin layout riêng - không có Navbar/Footer từ root layout
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
