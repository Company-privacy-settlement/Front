import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans';
import './globals.css';
import './near-theme.css';
import './merchant-theme.css';
import './workspace-layout.css';
import './groups.css';
import './invoice-library.css';
import './recipient-readiness.css';
import './notes.css';
import './invoice-note-payment.css';
import './evidence.css';
import './organization.css';
import './money-station.css';

export const metadata: Metadata = { title: { default: 'Money Station — Private payments. Clear proof.', template: '%s · Money Station' }, description: 'Private on-chain payments for business. Move money at network speed, protect sensitive business details, and prepare evidence for reconciliation and tax review.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
