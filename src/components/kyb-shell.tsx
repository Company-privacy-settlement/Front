"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Check, ChevronRight, ShieldCheck } from 'lucide-react';
import { kybSteps, kybReadiness } from '@/lib/kyb';
import { useKyb } from './kyb-provider';
import { hackathonKybEnabled } from '@/lib/demo-kyb';
export function KybShell({ children }: { children: ReactNode }) {
  const path = usePathname().replace(/\/$/, ''), { draft, preparedAt } = useKyb(), readiness = kybReadiness(draft);
  const complete = Object.values(readiness).filter(issues => !issues.length).length;
  return <>
    <div className="kyb-demo-notice"><span className="kyb-mode"><ShieldCheck size={14}/>{hackathonKybEnabled?'Hackathon · Instant demo approval':'Demo intake · Not verified'}</span><div>{hackathonKybEnabled?'Sample businesses are approved immediately for this hackathon. No identity checks are performed and no verification credential is issued.':'Use sample information. Your draft stays in memory inside this workspace. Reloading or leaving clears it. No files or data are sent to a KYB provider.'} <Link href="/organization/">Open organization verification.</Link></div></div>
    <div className="kyb-workspace">
      <aside className="kyb-steps"><div className="kyb-progress-heading"><strong>Verification steps</strong><span>{complete} / 3 intake sections ready</span><progress aria-label="KYB intake readiness" max={3} value={complete}/></div><nav aria-label="KYB steps">{kybSteps.map((step, index) => {
        const active = path === step.href.replace(/\/$/, '');
        const ready = step.id in readiness ? readiness[step.id as keyof typeof readiness].length === 0 : step.id === 'review' && !!preparedAt;
        return <Link key={step.id} href={step.href} aria-current={active ? 'step' : undefined}><span className={`kyb-step-number ${ready ? 'is-ready' : ''}`}>{ready ? <Check size={13}/> : index === 0 ? '—' : index}</span><span><strong>{step.title}</strong><small>{step.detail}</small></span><ChevronRight size={13}/></Link>;
      })}</nav><div className="kyb-step-footnote"><ShieldCheck size={16}/><p>{hackathonKybEnabled?'Demo approval applies to the sample workflow. Real identity verification remains separate.':'Intake readiness records information supplied by you. A verified status requires an external provider decision.'}</p></div></aside>
      <div className="kyb-step-content">{children}</div>
    </div>
  </>;
}
