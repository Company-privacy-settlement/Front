import type { ReactNode } from 'react';
import { MerchantShell } from '@/components/merchant-shell';
import { KybProvider } from '@/components/kyb-provider';
import { KybShell } from '@/components/kyb-shell';
import './kyb.css';
export const metadata = { title: 'Business verification' };
export default function KybLayout({ children }: { children: ReactNode }) { return <KybProvider><MerchantShell section="Business verification"><KybShell>{children}</KybShell></MerchantShell></KybProvider>; }
