export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#F7F7F2' }}>
      {children}
    </div>
  )
}
