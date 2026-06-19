'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="password" className="block text-xs font-mono-num uppercase tracking-wide text-muted mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface2 border border-surface2 focus:border-amber rounded-sm px-3 py-2.5 text-cream outline-none transition-colors"
        />
      </div>
      {status === 'error' ? (
        <p className="text-velvet text-sm">Incorrect password. Try again.</p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-amber text-ink font-mono-num uppercase tracking-wide text-sm py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'loading' ? 'Checking...' : 'Sign in'}
      </button>
    </form>
  );
}
