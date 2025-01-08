export default function LoginLayout({ children }) {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        {children}
      </div>
    </main>
  );
}
