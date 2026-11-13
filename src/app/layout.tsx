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
import './evidence.css';
import './organization.css';

export const metadata: Metadata = { title: { default: 'Core — Private payments. Shared confidence.', template: '%s · Core' }, description: 'Documentation and wallet tools for private business settlement on NEAR. Distributed vaults, shared ZK notes, and selective evidence.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
