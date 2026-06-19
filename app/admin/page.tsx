import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import AdminLoginForm from '@/components/AdminLoginForm';

export default function AdminLoginPage() {
  if (isAdmin()) {
    redirect('/admin/dashboard');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <p className="font-mono-num text-xs uppercase tracking-[0.3em] text-muted mb-3">
        Private booth
      </p>
      <h1 className="font-display italic text-4xl tracking-wide text-cream mb-8">
        CURATOR SIGN IN
      </h1>
      <AdminLoginForm />
    </main>
  );
}
