import Link from 'next/link';
export function Mark({ size = 27 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 2 29 9.5v13L16 30 3 22.5v-13L16 2Z" stroke="currentColor" strokeWidth="2.3"/><path d="m16 9 6 3.5v7L16 23l-6-3.5v-7L16 9Z" fill="currentColor"/><path d="M16 2v7M29 9.5l-7 3M29 22.5l-7-3M16 30v-7M3 22.5l7-3M3 9.5l7 3" stroke="currentColor" strokeWidth="1.8"/></svg>;
}
export function Brand({ dark = false }: { dark?: boolean }) { return <Link href="/" className={`brand ${dark ? 'brand-dark' : ''}`} aria-label="Core home"><Mark/><span>core<span className="brand-dot">.</span></span></Link>; }
export function NearMark() { return <svg className="near-mark" viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="M3 16V4c0-.8 1-.9 1.5-.2L16 16V4M5 4l10 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
