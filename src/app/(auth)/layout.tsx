export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ecco-off-white to-ecco-accent-light">
      {children}
    </div>
  );
}
