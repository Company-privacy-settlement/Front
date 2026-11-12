export const kybSteps = [
  { id: 'overview', href: '/kyb/', title: 'Overview', detail: 'Your verification checklist' },
  { id: 'business', href: '/kyb/business/', title: 'Business details', detail: 'Entity, registration and activity' },
  { id: 'people', href: '/kyb/people/', title: 'People & ownership', detail: 'Representative and controlling persons' },
  { id: 'documents', href: '/kyb/documents/', title: 'Supporting documents', detail: 'Evidence for each business claim' },
  { id: 'review', href: '/kyb/review/', title: 'Review & prepare', detail: 'Check and prepare your request' },
  { id: 'status', href: '/kyb/status/', title: 'Verification status', detail: 'Provider checks and decision' },
] as const;
export const jurisdictions = {
  US: { label: 'United States', authority: 'State registration authority', region: 'State of incorporation', registration: 'State registration number', reference: 'FinCEN customer due diligence guidance', url: 'https://www.fincen.gov/resources/statutes-and-regulations/cdd-rule-faqs' },
  AE_MAINLAND: { label: 'Abu Dhabi · Mainland', authority: 'Licensing authority', region: 'Emirate / registered location', registration: 'Trade licence number', reference: 'CBUAE customer due diligence guidance', url: 'https://rulebook.centralbank.ae/en/rulebook/4411-general-cdd-measures' },
  ADGM: { label: 'Abu Dhabi · ADGM', authority: 'Registration authority', region: 'Registered location in ADGM', registration: 'ADGM registration number', reference: 'ADGM beneficial ownership and control', url: 'https://www.adgm.com/operating-in-adgm/obligations-of-adgm-registered-entities/beneficial-ownership-and-control' },
} as const;
export type Jurisdiction = '' | keyof typeof jurisdictions;
export type Business = { jurisdiction: Jurisdiction; legalName: string; registrationNumber: string; authority: string; region: string; entityType: string; address: string; activity: string; purpose: string; volume: string };
export type Representative = { name: string; email: string; role: string };
export type Person = { id: string; name: string; country: string; ownership: string; controller: boolean };
export const documentTypes = [
  { id: 'registration', title: 'Business registration', required: true, detail: 'Certificate of incorporation or current trade licence matching the legal entity.' },
  { id: 'address', title: 'Registered business address', required: true, detail: 'A sample lease, utility statement or registry extract supporting the registered address.' },
  { id: 'ownership', title: 'Ownership & control record', required: true, detail: 'A shareholder register or ownership chart, including intermediate entities and controlling persons.' },
  { id: 'authority', title: 'Authority to represent', required: true, detail: 'A sample board resolution, appointment record or authorisation to act for the business.' },
  { id: 'funds', title: 'Source of funds', required: false, detail: 'Optional at intake. A provider may request financial statements or an explanation of funding.' },
] as const;
export type DocumentId = typeof documentTypes[number]['id'];
export type DocumentMetadata = { name: string; size: number; type: string };
export type KybDraft = { business: Business; representative: Representative; people: Person[]; ownershipConfirmed: boolean; documents: Partial<Record<DocumentId, DocumentMetadata>> };
export function emptyKybDraft(): KybDraft {
  return { business: { jurisdiction: '', legalName: '', registrationNumber: '', authority: '', region: '', entityType: '', address: '', activity: '', purpose: '', volume: '' }, representative: { name: '', email: '', role: '' }, people: [{ id: 'person-1', name: '', country: '', ownership: '', controller: false }], ownershipConfirmed: false, documents: {} };
}
export function sampleKybDraft(): KybDraft {
  return { ...emptyKybDraft(), business: { jurisdiction: 'ADGM', legalName: 'Meridian Studio Example Ltd', registrationNumber: 'DEMO-0001', authority: 'ADGM Registration Authority', region: 'Al Maryah Island, Abu Dhabi', entityType: 'Private company', address: 'Example Office 101, Sample Building, Abu Dhabi, UAE', activity: 'Example design and software services', purpose: 'b2b', volume: '1–50 payments / month' }, representative: { name: 'Jamie Example', email: 'jamie@example.com', role: 'Director' }, people: [{ id: 'person-1', name: 'Jamie Example', country: 'United Arab Emirates', ownership: '100', controller: true }], ownershipConfirmed: true };
}
export function businessIssues(d: KybDraft): string[] {
  const b = d.business, issues: string[] = [];
  if (!Object.hasOwn(jurisdictions, b.jurisdiction)) issues.push('Select the registration jurisdiction.');
  for (const [key, label] of [['legalName','Legal business name'],['registrationNumber','Registration number'],['authority','Registration authority'],['region','Registered location'],['entityType','Entity type'],['address','Registered business address'],['activity','Business activity'],['purpose','Payment purpose'],['volume','Expected payment activity']] as const) if (!b[key].trim()) issues.push(`${label} is required.`);
  return issues;
}
export function peopleIssues(d: KybDraft): string[] {
  const issues: string[] = [];
  if (!d.representative.name.trim()) issues.push('Representative name is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.representative.email)) issues.push('Enter a valid business contact email.');
  if (!d.representative.role.trim()) issues.push('Representative role is required.');
  if (!d.people.length) issues.push('Add at least one person who owns or controls the business.');
  if (d.people.length > 10) issues.push('This demo supports up to 10 people.');
  let total = 0;
  const names = new Set<string>();
  for (const [index, p] of d.people.entries()) {
    const label = `Person ${index + 1}`;
    if (!p.name.trim() || !p.country.trim()) issues.push(`${label}: name and country are required.`);
    const percent = Number(p.ownership);
    if (!p.ownership.trim() || !Number.isFinite(percent) || percent < 0 || percent > 100 || (!p.controller && percent === 0)) issues.push(`${label}: enter 0–100% ownership; a 0% person must have a control role.`);
    else total += percent;
    const name = p.name.trim().toLowerCase();
    if (name && names.has(name)) issues.push('Each person should be listed once, combining their ownership interests.');
    names.add(name);
  }
  if (total > 100.000001) issues.push('Combined ownership cannot exceed 100%.');
  if (!d.people.some(p => p.controller)) issues.push('Identify at least one person with a control or management role.');
  if (!d.ownershipConfirmed) issues.push('Confirm the ownership and control record is complete for provider assessment.');
  return issues;
}
export function documentIssues(d: KybDraft): string[] {
  return documentTypes.filter(t => t.required && !d.documents[t.id]).map(t => `${t.title} is still missing.`);
}
export function kybReadiness(d: KybDraft) {
  return { business: businessIssues(d), people: peopleIssues(d), documents: documentIssues(d) };
}
export function documentMetadata(file: Pick<File, 'name' | 'size' | 'type'>): DocumentMetadata {
  const valid = { 'application/pdf': /\.pdf$/i, 'image/png': /\.png$/i, 'image/jpeg': /\.jpe?g$/i };
  if (!Object.hasOwn(valid, file.type) || !valid[file.type as keyof typeof valid].test(file.name)) throw new Error('Choose a sample PDF, PNG or JPEG with a matching file type.');
  if (file.size < 1 || file.size > 10 * 1024 * 1024) throw new Error('Choose a non-empty sample document up to 10 MB.');
  return { name: file.name.slice(0, 200), size: file.size, type: file.type };
}
export function kybPacket(draft: KybDraft, preparedAt: string) {
  const issues = Object.values(kybReadiness(draft)).flat();
  if (issues.length) throw new Error('Complete all intake steps before preparing a request.');
  return { format: 'core-kyb-demo-intake-v1', environment: 'local-demo', preparedAt, draft, documentContentsIncluded: false, providerSubmission: 'not_sent', checks: { registry: 'not_run', identity: 'not_run', sanctions: 'not_run', manualReview: 'not_started' }, verified: false, credentialIssued: false };
}
