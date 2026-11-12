import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans';
import './globals.css';
import './near-theme.css';
import './merchant-theme.css';

export const metadata: Metadata = { title: { default: 'Core — Private payments. Shared confidence.', template: '%s · Core' }, description: 'A demo of private B2B payments and payroll on NEAR. Distributed vaults, shared anonymity, and selectively disclosed proof.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
