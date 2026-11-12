"use client";
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export function LegacyWorkspace() {
  const router = useRouter();
  useEffect(() => {
    const view = new URLSearchParams(location.search).get('view');
    const destination = view === 'vaults' ? '/docs/architecture/' : view === 'proofs' ? '/docs/privacy/' : view === 'payments' ? '/docs/payments/' : '/docs/';
    router.replace(destination);
  }, [router]);
  return <main style={{padding:40}}><h1>Core documentation</h1><p><Link href="/docs/">Continue to the documentation</Link></p></main>;
}
