"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, Check, Clock3, Download, FileCheck2, FileText, LockKeyhole, Plus, ShieldCheck, Trash2, Users, Upload } from 'lucide-react';
import { businessIssues, peopleIssues, documentIssues, documentMetadata, documentTypes, jurisdictions, kybReadiness, kybPacket, sampleKybDraft, type Jurisdiction, type Business, type Person } from '@/lib/kyb';
import { useKyb } from './kyb-provider';
import { hackathonKybEnabled } from '@/lib/demo-kyb';

function Heading({ title, children }: { title: string; children: ReactNode }) { return <div className="kyb-page-heading"><h1>{title}</h1><p>{children}</p></div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="form-label">{label}{children}</label>; }
function Issues({ items }: { items: string[] }) { return items.length ? <div className="kyb-errors" role="alert"><strong>A few details need attention</strong><ul>{items.map(i => <li key={i}>{i}</li>)}</ul></div> : null; }
function Actions({ back, next, children }: { back: string; next?: string; children?: ReactNode }) { return <div className="kyb-actions"><Link href={back} className="button button-outline"><ArrowLeft size={14}/> Back</Link>{next ? <button type="submit" className="button button-dark">{next}<ArrowRight size={14}/></button> : children}</div>; }
function exportRequest(packet: ReturnType<typeof kybPacket>) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'money-station-kyb-demo.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function KybOverview() {
  const { draft, edit, preparedAt } = useKyb(), readiness = kybReadiness(draft);
  if(hackathonKybEnabled&&preparedAt)return <>
    <Heading title="Your business is ready for the demo">KYB is approved instantly for the hackathon sample workflow.</Heading>
    <div className="kyb-overview-status"><span className="kyb-status-icon"><ShieldCheck size={24}/></span><div><strong>Approved for hackathon demo</strong><p>{draft.business.legalName} · Sample business</p></div><span className="kyb-badge ready">Demo approved</span></div>
    <div className="kyb-actions"><Link href="/kyb/status/" className="button button-outline">View approval</Link><Link href="/invoices/" className="button button-dark">Continue to payments<ArrowRight size={14}/></Link></div>
    <div className="kyb-reference"><FileText size={18}/><div><strong>Explore the business intake</strong><p>Review the sample company, ownership and evidence records. Editing details clears the current demo approval.</p><Link href="/kyb/business/">Review sample details<ArrowRight size={13}/></Link></div></div>
  </>;
  const stages = [
    { title: 'Business details', text: 'Confirm the legal entity, its registration jurisdiction and how it plans to use payments.', href: '/kyb/business/', icon: Building2, ready: !readiness.business.length, caption: 'Entity information' },
    { title: 'People & ownership', text: 'Identify the representative, natural-person owners and people who control the business.', href: '/kyb/people/', icon: Users, ready: !readiness.people.length, caption: 'Ownership & authority' },
    { title: 'Supporting documents', text: 'Match evidence to registration, address, ownership and authority to act.', href: '/kyb/documents/', icon: FileText, ready: !readiness.documents.length, caption: '4 required evidence records' },
  ];
  const next = stages.find(s => !s.ready)?.href || (preparedAt ? '/kyb/status/' : '/kyb/review/');
  return <>
    <Heading title="Verify your business, step by step">Know what to prepare, what is still missing, and who makes the verification decision.</Heading>
    <div className="kyb-overview-status"><span className="kyb-status-icon"><ShieldCheck size={24}/></span><div><strong>{preparedAt ? 'Request prepared · Provider not connected' : 'Start your business verification'}</strong><p>Intake details can be prepared here. Verification and credential issuance require an external KYB provider.</p></div><Link href={next} className="button button-dark">{preparedAt ? 'View status' : 'Continue'}<ArrowRight size={14}/></Link></div>
    <div className="kyb-overview-cards">{stages.map(s => <Link href={s.href} className="kyb-overview-card" key={s.href}><div><s.icon size={22}/><span className={`kyb-badge ${s.ready ? 'ready' : ''}`}>{s.ready ? 'Intake ready' : 'Details needed'}</span></div><h3>{s.title}</h3><p>{s.text}</p><span className="kyb-card-link">{s.ready ? 'Review details' : 'Add details'}<ArrowRight size={14}/></span></Link>)}</div>
    <section className="panel live-card kyb-next-stages"><h3>What happens after intake?</h3><div><span>04</span><div><strong>Review & prepare your request</strong><p>Check the information, confirm your authority, and prepare a local sample request.</p></div><Link href="/kyb/review/">Review <ArrowRight size={13}/></Link></div><div><span>05</span><div><strong>Provider checks & decision</strong><p>Registry checks, identity verification, screening and manual review are not connected in this demo.</p></div><Link href="/kyb/status/">Status <ArrowRight size={13}/></Link></div></section>
    {!draft.business.legalName && <div className="kyb-sample"><div><strong>Exploring the hackathon demo?</strong><p>Use a clearly labelled example business. Select sample documents in the evidence step.</p></div><button className="button button-outline" onClick={() => edit(() => sampleKybDraft())}>Use sample business details</button></div>}
  </>;
}

export function KybBusiness() {
  const { draft, edit } = useKyb(), router = useRouter(), [issues, setIssues] = useState<string[]>([]), b = draft.business;
  const jurisdiction = b.jurisdiction ? jurisdictions[b.jurisdiction] : null;
  function change(key: keyof Business, value: string) { edit(d => ({ ...d, business: { ...d.business, [key]: value } })); }
  function submit(e: FormEvent) { e.preventDefault(); const issues = businessIssues(draft); setIssues(issues); if (!issues.length) router.push('/kyb/people/'); }
  return <>
    <Heading title="Tell us about your business">Use the name and registration details that match the business registry and your supporting documents.</Heading>
    <form noValidate onSubmit={submit}>
      <Issues items={issues}/>
      <section className="panel live-card kyb-form-card"><div className="kyb-card-heading"><Building2 size={19}/><div><h3>Registration & jurisdiction</h3><p>Abu Dhabi mainland and ADGM are separate selections.</p></div></div>
        <Field label="Registration jurisdiction"><select value={b.jurisdiction} required onChange={e => edit(d => ({ ...d, business: { ...d.business, jurisdiction: e.target.value as Jurisdiction, authority: '', region: '', registrationNumber: '' }, documents: {} }))}><option value="">Choose jurisdiction</option>{Object.entries(jurisdictions).map(([id, j]) => <option key={id} value={id}>{j.label}</option>)}</select></Field>
        <p className="kyb-field-hint">Changing jurisdiction clears the registration identifier, authority, location and selected document records.</p>
        <Field label="Legal business name"><input required maxLength={160} autoComplete="off" value={b.legalName} onChange={e => change('legalName', e.target.value)} placeholder="Example company legal name"/></Field>
        <div className="kyb-field-grid"><Field label={jurisdiction?.registration || 'Registration number'}><input required maxLength={100} value={b.registrationNumber} onChange={e => change('registrationNumber', e.target.value)} placeholder="Use a sample registration number"/></Field><Field label="Entity type"><select required value={b.entityType} onChange={e => change('entityType', e.target.value)}><option value="">Choose entity type</option>{['Private company','Limited liability company','Partnership','Other legal entity'].map(t => <option key={t}>{t}</option>)}</select></Field></div>
        <Field label={jurisdiction?.authority || 'Registration authority'}><input required maxLength={160} value={b.authority} onChange={e => change('authority', e.target.value)} placeholder="Authority shown on the registration record"/></Field>
        <Field label={jurisdiction?.region || 'Registered location'}><input required maxLength={160} value={b.region} onChange={e => change('region', e.target.value)}/></Field>
        <Field label="Registered business address"><textarea required maxLength={500} rows={3} value={b.address} onChange={e => change('address', e.target.value)} placeholder="Street, city, region, postal code and country"/></Field>
      </section>
      <section className="panel live-card kyb-form-card"><h3>Business activity & expected payments</h3><Field label="Business activity"><textarea required maxLength={600} rows={3} value={b.activity} onChange={e => change('activity', e.target.value)} placeholder="Describe your goods or services and typical customers"/></Field><div className="kyb-field-grid"><Field label="Payment purpose"><select required value={b.purpose} onChange={e => change('purpose', e.target.value)}><option value="">Choose purpose</option><option value="b2b">Business-to-business</option><option value="payroll">Employee payments</option><option value="both">B2B & employee payments</option></select></Field><Field label="Expected payment activity"><select required value={b.volume} onChange={e => change('volume', e.target.value)}><option value="">Choose monthly activity</option>{['1–50 payments / month','51–500 payments / month','More than 500 payments / month'].map(v => <option key={v}>{v}</option>)}</select></Field></div></section>
      {jurisdiction && <div className="kyb-reference"><ShieldCheck size={18}/><div><strong>Jurisdiction reference</strong><p>Reference material for provider assessment. Entity type, activities and provider policy determine the final checklist.</p><a href={jurisdiction.url} target="_blank" rel="noreferrer">{jurisdiction.reference}<ArrowUpRight size={13}/></a></div></div>}
      <Actions back="/kyb/" next="Continue to people"/>
    </form>
  </>;
}

export function KybPeople() {
  const { draft, edit } = useKyb(), router = useRouter(), [issues, setIssues] = useState<string[]>([]);
  function representative(key: 'name' | 'email' | 'role', value: string) { edit(d => ({ ...d, representative: { ...d.representative, [key]: value } })); }
  function person(id: string, values: Partial<Person>) { edit(d => ({ ...d, ownershipConfirmed: false, people: d.people.map(p => p.id === id ? { ...p, ...values } : p) })); }
  function submit(e: FormEvent) { e.preventDefault(); const issues = peopleIssues(draft); setIssues(issues); if (!issues.length) router.push('/kyb/documents/'); }
  return <>
    <Heading title="Who owns and runs the business?">Separate the person preparing this request from the natural persons who own or control the business.</Heading>
    <form noValidate onSubmit={submit}><Issues items={issues}/>
      <section className="panel live-card kyb-form-card"><div className="kyb-card-heading"><Users size={19}/><div><h3>Authorised representative</h3><p>The business contact responsible for preparing this request.</p></div></div><Field label="Representative full name"><input required maxLength={120} value={draft.representative.name} onChange={e => representative('name', e.target.value)} placeholder="Sample representative name"/></Field><div className="kyb-field-grid"><Field label="Business contact email"><input type="email" required maxLength={160} value={draft.representative.email} onChange={e => representative('email', e.target.value)} placeholder="person@example.com"/></Field><Field label="Representative role"><input required maxLength={100} value={draft.representative.role} onChange={e => representative('role', e.target.value)} placeholder="Director, officer or authorised agent"/></Field></div></section>
      <section className="panel live-card kyb-form-card"><h3>Beneficial owners & controlling persons</h3><p>List natural persons and their combined direct or indirect ownership. Include control roles even without equity. The provider assesses applicable thresholds, exemptions and ownership layers.</p>
        {draft.people.map((p, index) => <fieldset className="kyb-person" key={p.id}><legend>Person {index + 1}</legend><div className="kyb-person-header"><span>Natural person</span>{draft.people.length > 1 && <button type="button" className="icon-button" aria-label={`Remove person ${index + 1}`} onClick={() => edit(d => ({ ...d, ownershipConfirmed: false, people: d.people.filter(row => row.id !== p.id) }))}><Trash2 size={15}/></button>}</div><Field label={`Person ${index + 1} full name`}><input required maxLength={120} value={p.name} onChange={e => person(p.id, { name: e.target.value })}/></Field><div className="kyb-field-grid"><Field label={`Person ${index + 1} country of residence`}><input required maxLength={80} value={p.country} onChange={e => person(p.id, { country: e.target.value })} placeholder="Country"/></Field><Field label={`Person ${index + 1} ownership percentage`}><input required type="number" min={0} max={100} step="0.01" value={p.ownership} onChange={e => person(p.id, { ownership: e.target.value })} placeholder="0–100"/></Field></div><label className="kyb-checkbox"><input type="checkbox" checked={p.controller} onChange={e => person(p.id, { controller: e.target.checked })}/><span>Person {index + 1} has a control or management role</span></label></fieldset>)}
        <button type="button" className="button button-outline" disabled={draft.people.length >= 10} onClick={() => edit(d => ({ ...d, ownershipConfirmed: false, people: [...d.people, { id: crypto.randomUUID(), name: '', country: '', ownership: '', controller: false }] }))}><Plus size={14}/> Add person</button>
        <label className="kyb-checkbox kyb-confirm"><input type="checkbox" checked={draft.ownershipConfirmed} onChange={e => edit(d => ({ ...d, ownershipConfirmed: e.target.checked }))}/><span>I have included the people identified in the ownership and control record for provider assessment.</span></label>
      </section>
      <div className="kyb-reference"><LockKeyhole size={18}/><div><strong>Individual identity checks happen with the provider</strong><p>Passport numbers, identity images and biometrics are not collected by this demo. A company wallet signature alone does not establish identity or KYB approval.</p></div></div>
      <Actions back="/kyb/business/" next="Continue to documents"/>
    </form>
  </>;
}

export function KybDocuments() {
  const { draft, edit } = useKyb(), router = useRouter(), [error, setError] = useState(''), [issues, setIssues] = useState<string[]>([]);
  const selected = documentTypes.filter(t => draft.documents[t.id]).length;
  return <>
    <Heading title="Support each business claim">Select sample evidence for the legal entity, address, ownership and authority to act.</Heading>
    <div className="kyb-document-intro"><Upload size={20}/><div><strong>Sample file selection · No upload</strong><p>PDF, PNG or JPEG · Up to 10 MB each. Only file name, type and size stay in memory; file contents are never read, stored or sent.</p></div><span>{selected} / {documentTypes.length} selected</span></div>
    {error && <p className="kyb-errors" role="alert">{error}</p>}<Issues items={issues}/>
    <div className="kyb-document-list">{documentTypes.map(t => { const file = draft.documents[t.id]; return <section className="kyb-document panel live-card" key={t.id}><div className="kyb-document-heading"><span className={`kyb-document-icon ${file ? 'selected' : ''}`}>{file ? <Check size={20}/> : <FileText size={20}/>}</span><div><h3>{t.title}</h3><p>{t.detail}</p></div><span className="kyb-badge">{t.required ? 'Required for demo intake' : 'If requested'}</span></div>{file && <div className="kyb-selected-file"><FileCheck2 size={16}/><div><strong>{file.name}</strong><span>{Math.ceil(file.size / 1024)} KB · Selected for demo, not uploaded</span></div><button className="icon-button" aria-label={`Remove ${t.title.toLowerCase()} document`} onClick={() => edit(d => { const docs = { ...d.documents }; delete docs[t.id]; return { ...d, documents: docs }; })}><Trash2 size={15}/></button></div>}<Field label={`Sample ${t.title.toLowerCase()} document`}><input type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; try { const metadata = documentMetadata(file); edit(d => ({ ...d, documents: { ...d.documents, [t.id]: metadata } })); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'File could not be selected'); } }}/></Field></section>; })}</div>
    <div className="kyb-actions"><Link href="/kyb/people/" className="button button-outline"><ArrowLeft size={14}/> Back</Link><button className="button button-dark" onClick={() => { const issues = documentIssues(draft); setIssues(issues); if (!issues.length) router.push('/kyb/review/'); }}>Review request <ArrowRight size={14}/></button></div>
  </>;
}

export function KybReview() {
  const { draft, acknowledged, acknowledge, preparedAt, prepare } = useKyb(), readiness = kybReadiness(draft), router = useRouter(), [error, setError] = useState('');
  const allReady = Object.values(readiness).every(i => !i.length);
  const groups = [ { title: 'Business details', href: '/kyb/business/', issues: readiness.business }, { title: 'People & ownership', href: '/kyb/people/', issues: readiness.people }, { title: 'Supporting documents', href: '/kyb/documents/', issues: readiness.documents } ];
  return <>
    <Heading title={hackathonKybEnabled?'Review your demo business':'Review before preparing'}>{hackathonKybEnabled?'Submit the completed intake for immediate hackathon approval. No provider checks or verification credential are included.':'A prepared request is an intake package. It is not a provider submission, approval or on-chain credential.'}</Heading>
    <div className="kyb-review-checks">{groups.map(g => <Link href={g.href} key={g.href}><span className={`kyb-step-number ${!g.issues.length ? 'is-ready' : ''}`}>{!g.issues.length ? <Check size={14}/> : <Clock3 size={14}/>}</span><div><strong>{g.title}</strong><small>{g.issues.length ? `${g.issues.length} item${g.issues.length === 1 ? '' : 's'} need attention` : 'Intake information ready'}</small></div><span>{g.issues.length ? 'Complete' : 'Edit'}<ArrowRight size={13}/></span></Link>)}</div>
    {!allReady && <div className="kyb-review-missing"><strong>Finish the required sections to prepare a request.</strong><p>Each checklist row takes you to the information that is missing.</p></div>}
    <section className="panel live-card kyb-form-card"><div className="kyb-card-heading"><Building2 size={19}/><h3>Business summary</h3></div><dl className="kyb-review-summary"><div><dt>Legal entity</dt><dd>{draft.business.legalName || 'Not provided'}</dd></div><div><dt>Jurisdiction</dt><dd>{draft.business.jurisdiction ? jurisdictions[draft.business.jurisdiction].label : 'Not selected'}</dd></div><div><dt>Registration</dt><dd>{draft.business.registrationNumber || 'Not provided'}</dd></div><div><dt>Representative</dt><dd>{draft.representative.name || 'Not provided'}</dd></div><div><dt>Ownership & control</dt><dd>{draft.people.filter(p => p.name.trim()).length} people listed</dd></div><div><dt>Evidence records</dt><dd>{Object.keys(draft.documents).length} sample files selected · Contents excluded</dd></div></dl></section>
    <section className="panel live-card kyb-form-card"><h3>Authority & acknowledgement</h3><p>Check the sample request before preparing. Changes to any intake detail invalidate the prepared request and require a new acknowledgement.</p><label className="kyb-checkbox"><input type="checkbox" aria-label="Confirm review and authority" checked={acknowledged} onChange={e => acknowledge(e.target.checked)} disabled={!allReady}/><span>I am authorised to prepare this sample request and have checked the information. I understand no verification provider has reviewed or received it.</span></label></section>
    {error && <p className="kyb-errors" role="alert">{error}</p>}
    <div className="kyb-actions"><Link href="/kyb/documents/" className="button button-outline"><ArrowLeft size={14}/> Back</Link><button className="button button-dark" disabled={!allReady || !acknowledged} onClick={() => { try { prepare(); router.push('/kyb/status/'); } catch(e) { setError(e instanceof Error ? e.message : 'Could not prepare request'); } }}>{hackathonKybEnabled?'Approve for demo':preparedAt ? 'Prepare request again' : 'Prepare KYB request'}<ArrowRight size={14}/></button></div>
  </>;
}

export function KybStatus() {
  const { draft, preparedAt } = useKyb();
  if(hackathonKybEnabled&&preparedAt)return <>
    <Heading title="Business approved for demo">Your sample business can continue immediately. No provider queue or document upload is required.</Heading>
    <section className="kyb-overview-status" aria-label="Demo KYB approval"><span className="kyb-status-icon"><ShieldCheck size={24}/></span><div><strong>Approved for hackathon demo</strong><p>{draft.business.legalName} · Sample business</p></div><span className="kyb-badge ready">Demo approved</span></section>
    <section className="panel live-card kyb-form-card"><dl className="kyb-review-summary"><div><dt>KYB decision</dt><dd>Approved · Hackathon demo</dd></div><div><dt>Approved at</dt><dd>{preparedAt}</dd></div><div><dt>Identity checks</dt><dd>Not performed</dd></div><div><dt>Verification credential</dt><dd>Not issued</dd></div></dl></section>
    <div className="kyb-actions"><button className="button button-outline" onClick={()=>exportRequest(kybPacket(draft,preparedAt,true))}><Download size={14}/>Export demo approval</button><Link href="/invoices/" className="button button-dark">Continue to payments<ArrowRight size={14}/></Link></div>
  </>;
  const stages = [
    { title: 'Intake request', detail: preparedAt ? `Prepared locally at ${preparedAt}` : 'Complete the intake and review steps first.', state: preparedAt ? 'Prepared locally' : 'Not prepared', ready: !!preparedAt },
    { title: 'Provider receipt', detail: 'An external provider must receive the request and return a case reference.', state: 'Not sent', ready: false },
    { title: 'Business registry checks', detail: 'Validate registration, legal status, address and business activity.', state: 'Not run', ready: false },
    { title: 'People & identity checks', detail: 'Verify the representative, ownership chain and controlling persons.', state: 'Not run', ready: false },
    { title: 'Screening & manual review', detail: 'Provider screening, follow-up evidence and the review decision.', state: 'Not started', ready: false },
    { title: 'Credential issuance', detail: 'An authorised issuer must bind a signed credential to the verified subject and its validity period.', state: 'Not issued', ready: false },
  ];
  return <>
    <Heading title="Track the verification decision">Local preparation and independent verification are separate milestones.</Heading>
    <div className="kyb-overview-status"><span className="kyb-status-icon"><Clock3 size={24}/></span><div><strong>{preparedAt ? 'Ready for provider handoff' : 'No prepared request yet'}</strong><p>{preparedAt ? 'Your sample request is prepared. Provider integration is needed to submit it and receive review updates.' : 'Complete the required business, people and evidence steps, then prepare your request.'}</p></div><span className="kyb-badge">Not verified</span></div>
    <section className="panel live-card kyb-form-card"><dl className="kyb-review-summary"><div><dt>Business</dt><dd>{draft.business.legalName || 'Not provided'}</dd></div><div><dt>Provider case reference</dt><dd>Not assigned</dd></div><div><dt>KYB decision</dt><dd>Not issued</dd></div><div><dt>Credential</dt><dd>Not issued · No expiry or issuer assigned</dd></div></dl></section>
    <ol className="kyb-timeline">{stages.map((s, index) => <li key={s.title}><span className={`kyb-step-number ${s.ready ? 'is-ready' : ''}`}>{s.ready ? <Check size={14}/> : index + 1}</span><div><strong>{s.title}</strong><p>{s.detail}</p></div><span className={`kyb-badge ${s.ready ? 'ready' : ''}`}>{s.state}</span></li>)}</ol>
    <div className="kyb-reference"><LockKeyhole size={18}/><div><strong>No approval is inferred from these steps</strong><p>This page does not unlock payments, issue a credential or post business documents on-chain. Wallet control, business identity and tax certification are separate checks.</p></div></div>
    <div className="kyb-actions"><Link href="/kyb/review/" className="button button-outline"><ArrowLeft size={14}/> Back to review</Link>{preparedAt && <button className="button button-dark" onClick={() => exportRequest(kybPacket(draft, preparedAt))}><Download size={14}/> Export sample request</button>}</div>
  </>;
}
