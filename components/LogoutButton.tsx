'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-mono-num uppercase tracking-wide text-muted hover:text-amber transition-colors"
    >
      Log out
    </button>
  );
}
