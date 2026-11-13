"use client";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, Check, LogOut, Plus, RefreshCw, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { MerchantShell } from './merchant-shell';
import { usePageHideLock } from '@/lib/page-hide-lock';
import { liveWallet, nearConnector } from '@/lib/wallet';
import { ORGANIZATION_ROLES, ORGANIZATION_PERMISSIONS, ORGANIZATION_ROLE_PERMISSIONS, OrganizationApiError, OrganizationClient, nonceBytes, organizationOrigin, parseOrganizationChallenge,
  type Organization, type OrganizationAudit, type OrganizationInvitation, type OrganizationMember, type OrganizationPermission, type OrganizationRole, type OrganizationSession } from '@/vendor/core-client/index.js';

type View = 'Overview' | 'Members' | 'Invitations' | 'Roles & permissions' | 'Audit log';
type GrantRole = Exclude<OrganizationRole, 'owner'>;
type Lists = { members: OrganizationMember[]; invites: OrganizationInvitation[]; audit: OrganizationAudit[]; cursor: number | null };
const empty = (): Lists => ({ members: [], invites: [], audit: [], cursor: null });
const title = (value: string) => value[0].toUpperCase() + value.slice(1);
const permissionLabels: Record<OrganizationPermission, string> = { 'organization.read': 'View organization', 'organization.update': 'Edit organization name', 'members.read': 'View members', 'members.manage': 'Manage permitted member roles', 'invitations.manage': 'Manage permitted invitations', 'audit.read': 'Read audit log', 'ownership.transfer': 'Transfer ownership' };
const messages: Record<string, string> = {
  VERSION_CONFLICT: 'This record changed. Refresh and review the latest version before trying again.',
  PERMISSION_DENIED: 'Your role no longer allows this action. Refresh your organizations.',
  ROLE_GRANT_DENIED: 'Only an owner can manage owners or admins. Admins can manage operators, viewers and auditors.',
  ORGANIZATION_NOT_FOUND: 'Organization access is unavailable. Refresh your organizations.',
  INVITATION_AUTHORITY_REVOKED: 'The inviter no longer has permission. Ask an owner for a new invitation.',
  INVITATION_NOT_PENDING: 'This invitation has expired or has already been resolved.',
  INVITATION_EXISTS: 'An invitation is already waiting for this account.',
  ALREADY_A_MEMBER: 'This account is already an active member.',
  FULL_ACCESS_KEY_REVOKED: 'The signing key is no longer current. Sign in again with your current wallet.',
  SESSION_INVALID: 'Your session ended. Sign in again.',
  IDENTITY_CHAIN_UNAVAILABLE: 'The testnet identity check is unavailable. Try again when the RPC is ready.',
};

export function OrganizationWorkspace() {
  const [api, setApi] = useState('http://localhost:3002'), [session, setSession] = useState<OrganizationSession | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]), [selected, setSelected] = useState<Organization | null>(null), [inbox, setInbox] = useState<OrganizationInvitation[]>([]);
  const [lists, setLists] = useState<Lists>(empty), [view, setView] = useState<View>('Overview');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [name, setName] = useState(''), [account, setAccount] = useState(''), [role, setRole] = useState<GrantRole>('viewer'), [successor, setSuccessor] = useState('');
  const generation = useRef(0), pending = useRef<AbortController | null>(null), credential = useRef<{ client: OrganizationClient; session: OrganizationSession } | null>(null), mounted = useRef(true);
  function clear() {
    generation.current++; pending.current?.abort(); pending.current = null; credential.current = null;
    setSession(null); setOrganizations([]); setSelected(null); setInbox([]); setLists(empty()); setView('Overview'); setName(''); setAccount(''); setRole('viewer'); setSuccessor(''); setError(''); setNotice(''); setBusy(false);
  }
  usePageHideLock(clear);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; generation.current++; pending.current?.abort(); credential.current = null; }; }, []);
  useEffect(() => { if (!session) return; const timer = setTimeout(clear, Math.max(0, Date.parse(session.expiresAt) - Date.now())); return () => clearTimeout(timer); }, [session]);
  const allowed = (p: OrganizationPermission) => selected?.permissions.includes(p) ?? false;
  const grantable = (r: OrganizationRole) => selected?.role === 'owner' ? r !== 'owner' : selected?.role === 'admin' && ['operator', 'viewer', 'auditor'].includes(r);
  async function run(action: (client: OrganizationClient, signal: AbortSignal, check: () => void) => Promise<void>, publicAction = false) {
    if (pending.current) return;
    const mine = generation.current, controller = new AbortController(); pending.current = controller; setBusy(true); setError(''); setNotice('');
    const check = () => { if (!mounted.current || generation.current !== mine) throw new DOMException('Workspace locked', 'AbortError'); controller.signal.throwIfAborted(); };
    try {
      const client = publicAction ? new OrganizationClient(organizationOrigin(api.trim())) : credential.current?.client;
      if (!client) throw new Error('Sign in first.');
      await action(client, controller.signal, check); check();
    } catch (e) {
      if (generation.current !== mine || !mounted.current) return;
      if (e instanceof OrganizationApiError && [401, 403, 404, 503, 504].includes(e.status)) {
        if (e.status === 401) { clear(); setError(messages[e.code] ?? 'Sign in again.'); return; }
        setSelected(null); setLists(empty()); setOrganizations([]); setInbox([]); setName(''); setAccount(''); setSuccessor('');
      }
      setError(e instanceof OrganizationApiError ? messages[e.code] ?? e.code.replaceAll('_', ' ') : e instanceof Error ? e.message : 'Organization action failed.');
    } finally { if (generation.current === mine && mounted.current) { pending.current = null; setBusy(false); } }
  }
  async function reload(client: OrganizationClient, signal: AbortSignal, check: () => void, id?: string, tab: View = view) {
    const [orgs, incoming] = await Promise.all([client.request<{ items: Organization[] }>('/v1/organizations', 'GET', undefined, signal), client.request<{ items: OrganizationInvitation[] }>('/v1/me/invitations', 'GET', undefined, signal)]);
    check(); setOrganizations(orgs.items); setInbox(incoming.items);
    const found = orgs.items.find(o => o.id === id);
    if (!found) { setSelected(null); setLists(empty()); setName(''); setSuccessor(''); return; }
    const current = await client.request<Organization>(`/v1/organizations/${found.id}`, 'GET', undefined, signal); check();
    const next = empty();
    if (tab === 'Members' && current.permissions.includes('members.read')) next.members = (await client.request<{ items: OrganizationMember[] }>(`/v1/organizations/${found.id}/members`, 'GET', undefined, signal)).items;
    if (tab === 'Invitations' && current.permissions.includes('invitations.manage')) next.invites = (await client.request<{ items: OrganizationInvitation[] }>(`/v1/organizations/${found.id}/invitations`, 'GET', undefined, signal)).items;
    if (tab === 'Audit log' && current.permissions.includes('audit.read')) { const page = await client.request<{ items: OrganizationAudit[]; nextCursor: number | null }>(`/v1/organizations/${found.id}/audit`, 'GET', undefined, signal); next.audit = page.items; next.cursor = page.nextCursor; }
    check(); setSelected(current); setLists(next); setName(current.name); setSuccessor('');
  }
  async function login() {
    await run(async (client, signal, check) => {
      const connector = await nearConnector(); check(); await connector.connect(); check();
      const identity = await liveWallet.identity(); check(); const wallet = await connector.wallet(); check();
      if (!wallet.manifest.features.signMessage) throw new Error('Choose a wallet that supports NEP-413 message signing.');
      const c = parseOrganizationChallenge(await client.request('/v1/auth/challenge', 'POST', { accountId: identity.accountId }, signal), identity.accountId, client.origin, location.origin); check();
      const proof = await wallet.signMessage({ network: 'testnet', signerId: identity.accountId, recipient: c.recipient, message: c.message, nonce: nonceBytes(c.nonce) }); check();
      if (!proof || proof.accountId !== identity.accountId || (await liveWallet.identity()).accountId !== identity.accountId) throw new Error('Wallet changed during sign-in. Start again.'); check();
      const signed = await client.request<OrganizationSession>('/v1/auth/login', 'POST', { challengeId: c.id, accountId: proof.accountId, publicKey: proof.publicKey, signature: proof.signature }, signal); check();
      if (signed.accountId !== identity.accountId || !/^[A-Za-z0-9_-]{43}$/.test(signed.token) || signed.token.length !== 43 || !Number.isFinite(Date.parse(signed.expiresAt)) || Date.parse(signed.expiresAt) <= Date.now() || Date.parse(signed.expiresAt) > Date.now() + 3660_000) throw new Error('Invalid organization session response.');
      const authenticated = new OrganizationClient(client.origin, signed.token);
      credential.current = { client: authenticated, session: signed }; setSession(signed);
      await reload(authenticated, signal, check); setNotice('Signed in. Choose or create your organization.');
    }, true);
  }
  function choose(id: string) {
    setSelected(null); setLists(empty()); setName(''); setAccount(''); setSuccessor(''); setView('Overview');
    void run((client, signal, check) => reload(client, signal, check, id, 'Overview'));
  }
  function changeView(tab: View) {
    setView(tab); setLists(empty()); setAccount(''); setSuccessor('');
    if (selected) void run((client, signal, check) => reload(client, signal, check, selected.id, tab));
  }
  function mutate(path: string, method: string, body: unknown, message: string, id = selected?.id) {
    void run(async (client, signal, check) => { await client.request(path, method, body, signal); check(); await reload(client, signal, check, id); setNotice(message); });
  }
  function create(e: FormEvent) {
    e.preventDefault(); void run(async (client, signal, check) => { const org = await client.request<Organization>('/v1/organizations', 'POST', { name: name.trim() }, signal); check(); setView('Overview'); await reload(client, signal, check, org.id, 'Overview'); setNotice('Organization created.'); });
  }
  return <MerchantShell section="Organization"><div className="organization-workspace">
    <div className="dashboard-heading"><div><h1>Organization</h1><p>Your team, with clear access to every workspace.</p></div><Building2 size={30}/></div>
    <section className="panel live-card organization-connection">
      <div className="organization-section-title"><div><h2>{session ? session.accountId : 'Sign in to your organization'}</h2><p>{session ? 'NEAR testnet wallet identity' : 'Use your NEAR testnet wallet to manage your team. Sign-in is a message signature.'}</p></div><ShieldCheck size={22}/></div>
      <label className="form-label">Organization API origin<input value={api} disabled={busy} placeholder="https://organization-api.example" onChange={e => { clear(); setApi(e.target.value); }}/></label>
      <div className="live-buttons">{session ? <>
        <button className="button button-outline" disabled={busy} onClick={() => void run((c, s, check) => reload(c, s, check, selected?.id))}><RefreshCw size={15}/>Refresh access</button>
        <button className="button button-outline" disabled={busy} onClick={() => void run(async (c, s, check) => { try { await c.request('/v1/auth/logout', 'POST', {}, s); check(); clear(); setNotice('Signed out.'); } catch { check(); clear(); setError('Local session cleared. Server revocation could not be confirmed; the server session expires within one hour.'); } })}><LogOut size={15}/>Sign out</button>
      </> : <button className="button button-dark" disabled={busy} onClick={() => void login()}>Sign in with testnet wallet</button>}</div>
    </section>
    {error && <div className="live-feedback organization-feedback" role="alert">{error}</div>}{notice && <div className="live-feedback organization-feedback" role="status"><Check size={17}/>{notice}</div>}
    {session && <>
      <section className="panel live-card organization-picker">
        <label className="form-label">Active organization<select value={selected?.id ?? ''} disabled={busy} onChange={e => choose(e.target.value)}><option value="">Choose an organization</option>{organizations.map(o => <option key={o.id} value={o.id}>{o.name} · {title(o.role)}</option>)}</select></label>
        {!selected && <form onSubmit={create}><label className="form-label">Organization name<input value={name} maxLength={120} minLength={2} required disabled={busy} onChange={e => setName(e.target.value)}/></label><button className="button button-dark" disabled={busy || name.trim().length < 2}><Plus size={15}/>Create organization</button></form>}
      </section>
      {inbox.length > 0 && <section className="panel live-card"><h2>Your invitations</h2><p>These invitations are addressed to your signed-in wallet.</p><div className="organization-list">{inbox.map(invite => <div className="organization-row" key={invite.id}><div><strong>{invite.organizationName}</strong><span>{title(invite.role)} · Expires {new Date(invite.expiresAt).toLocaleDateString()}</span></div><div className="live-buttons"><button className="button button-dark" disabled={busy} onClick={() => void run(async (c, s, check) => { const result = await c.request<{ organization: Organization }>(`/v1/me/invitations/${invite.id}/accept`, 'POST', { version: invite.version }, s); check(); setView('Overview'); await reload(c, s, check, result.organization.id, 'Overview'); setNotice('Invitation accepted.'); })}>Accept invitation</button><button className="button button-outline" disabled={busy} onClick={() => mutate(`/v1/me/invitations/${invite.id}/decline`, 'POST', { version: invite.version }, 'Invitation declined.')}>Decline</button></div></div>)}</div></section>}
      {selected && <>
        <div className="organization-current"><div><h2>{selected.name}</h2><p>{session.accountId} · {title(selected.role)}</p></div><span>Business verification is separate</span></div>
        <nav className="organization-tabs" aria-label="Organization settings">{(['Overview', 'Members', 'Invitations', 'Roles & permissions', 'Audit log'] as View[]).map(tab => <button key={tab} aria-current={view === tab ? 'page' : undefined} disabled={busy} onClick={() => changeView(tab)}>{tab}</button>)}</nav>
        <section className="panel live-card organization-detail">
          {view === 'Overview' && <><h2>Organization details</h2><p>Manage your workspace name and ownership.</p><dl className="organization-facts"><div><dt>Owner</dt><dd>{selected.ownerAccount}</dd></div><div><dt>Your role</dt><dd>{title(selected.role)}</dd></div><div><dt>Created</dt><dd>{new Date(selected.createdAt).toLocaleDateString()}</dd></div></dl>
            {allowed('organization.update') && <form onSubmit={e => { e.preventDefault(); mutate(`/v1/organizations/${selected.id}`, 'PATCH', { name: name.trim(), version: selected.version }, 'Organization name updated.'); }}><label className="form-label">Organization name<input value={name} required minLength={2} maxLength={120} disabled={busy} onChange={e => setName(e.target.value)}/></label><button className="button button-dark" disabled={busy || name.trim().length < 2 || name.trim() === selected.name}>Save name</button></form>}
            {allowed('ownership.transfer') && <form className="organization-separator" onSubmit={e => { e.preventDefault(); if (window.confirm(`Transfer ownership to ${successor.trim()}? You will become an admin.`)) mutate(`/v1/organizations/${selected.id}/ownership`, 'POST', { accountId: successor.trim(), version: selected.version }, 'Ownership transferred.'); }}><h3>Transfer ownership</h3><p>The successor must already be an active member. Your role will become Admin.</p><label className="form-label">Successor account<input value={successor} required maxLength={64} disabled={busy} placeholder="member.testnet" onChange={e => setSuccessor(e.target.value)}/></label><button className="button button-outline" disabled={busy || !successor.trim()}>Review ownership transfer</button></form>}
            {selected.role !== 'owner' && <div className="organization-separator"><h3>Leave organization</h3><p>You will lose access immediately.</p><button className="button button-outline" disabled={busy} onClick={() => { if (window.confirm(`Leave ${selected.name}?`)) mutate(`/v1/organizations/${selected.id}/members/${session.accountId}`, 'DELETE', { version: selected.membershipVersion }, 'You left the organization.', ''); }}>Leave organization</button></div>}
          </>}
          {view === 'Members' && <><div className="organization-section-title"><div><h2>Members</h2><p>Each member is linked to a NEAR testnet account.</p></div><Users size={22}/></div>{!allowed('members.read') ? <p>Your Viewer role does not include the member directory.</p> : <div className="organization-list">{lists.members.map(member => <div className="organization-row" key={member.accountId}><div><strong>{member.accountId}</strong><span>{title(member.role)}{member.accountId === session.accountId ? ' · You' : ''}</span></div>{allowed('members.manage') && grantable(member.role) && <MemberActions key={`${member.accountId}:${member.version}`} member={member} busy={busy} grants={ORGANIZATION_ROLES.filter((r): r is GrantRole => r !== 'owner' && grantable(r))} onRole={r => mutate(`/v1/organizations/${selected.id}/members/${member.accountId}`, 'PATCH', { role: r, version: member.version }, 'Member role updated.')} onRemove={() => { if (window.confirm(`Remove ${member.accountId} from ${selected.name}?`)) mutate(`/v1/organizations/${selected.id}/members/${member.accountId}`, 'DELETE', { version: member.version }, 'Member removed.'); }}/>}</div>)}</div>}</>}
          {view === 'Invitations' && <><div className="organization-section-title"><div><h2>Invitations</h2><p>Invite a wallet account. The person signs in and accepts from their inbox.</p></div><UserPlus size={22}/></div>{!allowed('invitations.manage') ? <p>Your role does not include invitation management.</p> : <>
            <form className="organization-invite-form" onSubmit={e => { e.preventDefault(); mutate(`/v1/organizations/${selected.id}/invitations`, 'POST', { accountId: account.trim(), role }, 'Invitation created. The recipient can accept after signing in.'); setAccount(''); }}><label className="form-label">Member account<input value={account} required maxLength={64} disabled={busy} placeholder="colleague.testnet" onChange={e => setAccount(e.target.value)}/></label><label className="form-label">Invitation role<select value={role} disabled={busy} onChange={e => setRole(e.target.value as GrantRole)}>{ORGANIZATION_ROLES.filter(r => r !== 'owner' && grantable(r)).map(r => <option key={r} value={r}>{title(r)}</option>)}</select></label><button className="button button-dark" disabled={busy || !account.trim()}>Create invitation</button></form>
            <div className="organization-list">{lists.invites.length === 0 && <p>No pending invitations.</p>}{lists.invites.map(invite => <div className="organization-row" key={invite.id}><div><strong>{invite.accountId}</strong><span>{title(invite.role)} · Expires {new Date(invite.expiresAt).toLocaleDateString()}</span></div><button className="button button-outline" disabled={busy || !grantable(invite.role)} onClick={() => mutate(`/v1/organizations/${selected.id}/invitations/${invite.id}`, 'DELETE', { version: invite.version }, 'Invitation revoked.')}>Revoke invitation</button></div>)}</div>
          </>}</>}
          {view === 'Roles & permissions' && <><h2>Roles & permissions</h2><p>Fixed workspace roles. Organization access does not grant wallet signing authority.</p><div className="organization-table-scroll"><table className="organization-permissions"><caption className="sr-only">Permissions for each organization role</caption><thead><tr><th scope="col">Permission</th>{ORGANIZATION_ROLES.map(r => <th scope="col" key={r}>{title(r)}</th>)}</tr></thead><tbody>{ORGANIZATION_PERMISSIONS.map(p => <tr key={p}><th scope="row">{permissionLabels[p]}</th>{ORGANIZATION_ROLES.map(r => <td key={r}>{ORGANIZATION_ROLE_PERMISSIONS[r].includes(p) ? <Check size={16} aria-label="Allowed"/> : <span aria-label="Not allowed">—</span>}</td>)}</tr>)}</tbody></table></div><p className="organization-footnote">Admins can manage Operators, Viewers and Auditors. Only Owners can manage Admins or transfer ownership.</p></>}
          {view === 'Audit log' && <><h2>Audit log</h2><p>Organization changes, recorded with actor and time.</p>{!allowed('audit.read') ? <p>Your role does not include the audit log.</p> : <><div className="organization-list">{lists.audit.map(item => <div className="organization-row organization-audit" key={item.sequence}><div><strong>{item.action.replaceAll('.', ' · ').replaceAll('_', ' ')}</strong><span>{item.actor} → {item.target}</span><time dateTime={item.occurredAt}>{new Date(item.occurredAt).toLocaleString()}</time><details><summary>Change details</summary><pre>{JSON.stringify(item.detail, null, 2)}</pre></details></div></div>)}</div>{lists.cursor !== null && <button className="button button-outline" disabled={busy} onClick={() => void run(async (c, s, check) => { const page = await c.request<{ items: OrganizationAudit[]; nextCursor: number | null }>(`/v1/organizations/${selected.id}/audit?before=${lists.cursor}`, 'GET', undefined, s); check(); setLists(current => ({ ...current, audit: [...current.audit, ...page.items], cursor: page.nextCursor })); })}>Load earlier changes</button>}</>}</>}
        </section>
      </>}
    </>}
    <p className="organization-footnote">Workspace access and business verification are separate. Organization roles do not authorize on-chain payments. Learn more in <a href="/docs/organizations/">Organization Docs</a>.</p>
  </div></MerchantShell>;
}
function MemberActions({ member, grants, busy, onRole, onRemove }: { member: OrganizationMember; grants: GrantRole[]; busy: boolean; onRole(role: GrantRole): void; onRemove(): void }) {
  const [role, setRole] = useState(member.role as GrantRole);
  return <div className="organization-member-actions"><label className="sr-only" htmlFor={`role-${member.accountId}`}>Role for {member.accountId}</label><select id={`role-${member.accountId}`} value={role} disabled={busy} onChange={e => setRole(e.target.value as GrantRole)}>{grants.map(r => <option key={r} value={r}>{title(r)}</option>)}</select><button className="button button-outline" disabled={busy || role === member.role} onClick={() => onRole(role)}>Save role</button><button className="button button-outline" disabled={busy} onClick={onRemove}>Remove</button></div>;
}
