import { test, expect, type Page } from '@playwright/test';
import { ORGANIZATION_ROLE_PERMISSIONS, organizationLoginMessage, type OrganizationRole } from '../../src/vendor/core-client/index.js';

const api = 'https://organization-api.example', accountId = 'owner.testnet';
const id = '11111111-1111-4111-8111-111111111111', betaId = '22222222-2222-4222-8222-222222222222';
async function setup(page: Page, initialRole: OrganizationRole = 'owner', delayedSigning = false) {
  await page.route('https://raw.githubusercontent.com/hot-dao/**/manifest.json', r => r.fulfill({ json: { wallets: [], version: '1.0.0' } }));
  await page.addInitScript(({ accountId, delayedSigning }) => {
    const w = window as unknown as { organizationSignatures: unknown[]; releaseOrganizationSignature?: () => void };
    w.organizationSignatures = [];
    const wallet = {
      manifest: { id: 'organization-fixture-wallet', name: 'Organization Fixture Wallet', type: 'injected', platform: ['web'], icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>', description: 'Test provider', website: 'https://example.com', version: '1', executor: '', permissions: {}, features: { testnet: true, mainnet: false, signMessage: true, signAndSendTransaction: true, signInWithoutAddKey: true } },
      signIn: async () => [{ accountId }], signOut: async () => {}, getAccounts: async () => [{ accountId }],
      signMessage: async (params: unknown) => {
        w.organizationSignatures.push(params);
        if (delayedSigning) await new Promise<void>(resolve => { w.releaseOrganizationSignature = resolve; });
        return { accountId, publicKey: 'ed25519:' + '1'.repeat(32), signature: 'a'.repeat(86) + '==' };
      },
    };
    window.addEventListener('near-selector-ready', () => window.dispatchEvent(new CustomEvent('near-wallet-injected', { detail: wallet })));
  }, { accountId, delayedSigning });
  const state = { role: initialRole, revoked: false, failure: 'none' as 'none' | 'network' | 'html' | 'conflict', invites: [] as Record<string, unknown>[], memberRole: 'operator', memberVersion: 1, loginCalls: 0, memberReads: 0, inbox: false, accepted: false, mutations: [] as { path: string; body: unknown }[] };
  function org(beta = false) { const role = beta ? 'operator' : state.role; return { id: beta ? betaId : id, name: beta ? 'Beta organization' : 'Example organization', ownerAccount: beta ? 'beta-owner.testnet' : accountId, version: 1, membershipVersion: 1, role, permissions: ORGANIZATION_ROLE_PERMISSIONS[role], createdAt: new Date().toISOString(), claims: { kybVerified: false, walletSigningAuthorityGranted: false } }; }
  await page.route(api + '/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname, method = request.method(), body = request.postData() ? request.postDataJSON() : undefined;
    if (path === '/v1/organizations' && state.failure === 'network') { await route.abort('failed'); return; }
    if (path === '/v1/organizations' && state.failure === 'html') { await route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Upstream failure</h1>' }); return; }
    if (path.endsWith('/members/colleague.testnet') && method === 'PATCH' && state.failure === 'conflict') { await route.fulfill({ status: 409, json: { error: 'VERSION_CONFLICT' } }); return; }
    let json: unknown = {}, status = 200;
    if (path === '/v1/auth/challenge') {
      const origin = request.headers().origin, fields = { accountId, audience: api, origin, expiresAt: new Date(Date.now() + 299_000).toISOString() };
      json = { ...fields, id: betaId, network: 'testnet', nonce: 'ab'.repeat(32), recipient: new URL(api).host, message: organizationLoginMessage(fields) };
    } else if (path === '/v1/auth/login') { state.loginCalls++; json = { accountId, token: 's'.repeat(43), expiresAt: new Date(Date.now() + 3599_000).toISOString() }; }
    else if (state.revoked) { status = 404; json = { error: 'ORGANIZATION_NOT_FOUND' }; }
    else if (path === '/v1/organizations') json = { items: [org(), ...(state.accepted ? [org(true)] : [])] };
    else if (path === '/v1/me/invitations') json = { items: state.inbox && !state.accepted ? [{ id: betaId, organizationId: betaId, organizationName: 'Beta organization', accountId, role: 'operator', version: 1, status: 'pending', expiresAt: new Date(Date.now() + 86400_000).toISOString(), createdAt: new Date().toISOString(), createdBy: 'beta-owner.testnet' }] : [] };
    else if (path.endsWith('/accept')) { state.accepted = true; json = { organization: org(true) }; }
    else if (path.endsWith('/decline')) { state.inbox = false; json = { organization: null }; }
    else if (path.endsWith('/members') && method === 'GET') { state.memberReads++; json = { items: [{ accountId, role: 'owner', version: 1, joinedAt: new Date().toISOString(), status: 'active' }, { accountId: 'colleague.testnet', role: state.memberRole, version: state.memberVersion, joinedAt: new Date().toISOString(), status: 'active' }] }; }
    else if (path.endsWith('/members/colleague.testnet') && method === 'PATCH') { state.memberRole = body.role; state.memberVersion++; state.mutations.push({ path, body }); json = { updated: true }; }
    else if (path.endsWith('/invitations') && method === 'GET') json = { items: state.invites };
    else if (path.endsWith('/invitations') && method === 'POST') { state.invites.push({ ...body, id: betaId, organizationId: id, organizationName: 'Example organization', version: 1, status: 'pending', expiresAt: new Date(Date.now() + 86400_000).toISOString(), createdAt: new Date().toISOString(), createdBy: accountId }); state.mutations.push({ path, body }); json = state.invites.at(-1); }
    else if (path.endsWith('/invitations/' + betaId) && method === 'DELETE') { state.invites = []; json = { revoked: true }; }
    else if (path.endsWith('/audit')) json = { items: [{ sequence: 1, actor: accountId, target: 'colleague.testnet', action: 'member.role_changed', occurredAt: new Date().toISOString(), detail: { previousRole: 'operator', role: 'auditor' } }], nextCursor: null };
    else if (path === '/v1/organizations/' + id) json = org();
    else if (path === '/v1/organizations/' + betaId) json = org(true);
    await route.fulfill({ status, json, headers: { 'access-control-allow-origin': request.headers().origin ?? '*' } }).catch(() => {});
  });
  await page.goto('/organization/'); await page.getByLabel('Organization API origin').fill(api);
  return state;
}
async function signIn(page: Page) {
  await page.getByRole('button', { name: 'Sign in with testnet wallet' }).click();
  await page.getByText('Organization Fixture Wallet', { exact: true }).click();
}
async function enter(page: Page) { await signIn(page); await page.getByLabel('Active organization').selectOption(id); await expect(page.locator('.organization-current h2')).toHaveText('Example organization'); }

test('owner can invite, assign a permitted role and inspect the audit log', async ({ page }) => {
  const state = await setup(page); await enter(page);
  await page.getByRole('button', { name: 'Invitations', exact: true }).click();
  await page.getByLabel('Member account', { exact: true }).fill('new-member.testnet');
  await page.getByLabel('Invitation role').selectOption('auditor'); await page.getByRole('button', { name: 'Create invitation', exact: true }).click();
  await expect(page.getByText('new-member.testnet', { exact: true })).toBeVisible();
  expect(state.mutations.at(-1)?.body).toEqual({ accountId: 'new-member.testnet', role: 'auditor' });
  await page.getByRole('button', { name: 'Members', exact: true }).click();
  await page.getByLabel('Role for colleague.testnet', { exact: true }).selectOption('auditor'); await page.getByRole('button', { name: 'Save role', exact: true }).click();
  await expect(page.getByLabel('Role for colleague.testnet', { exact: true })).toHaveValue('auditor'); expect(state.mutations.at(-1)?.body).toEqual({ role: 'auditor', version: 1 });
  await page.getByRole('button', { name: 'Audit log', exact: true }).click(); await expect(page.getByText('member · role changed', { exact: true })).toBeVisible();
});
test('viewer sees only allowed controls and roles table fits within the viewport', async ({ page }) => {
  const state = await setup(page, 'viewer'); await enter(page);
  await expect(page.getByRole('button', { name: 'Save name' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Members', exact: true }).click(); await expect(page.getByText('Your Viewer role does not include the member directory.')).toBeVisible();
  expect(state.memberReads).toBe(0);
  await page.getByRole('button', { name: 'Roles & permissions', exact: true }).click();
  await expect(page.getByRole('table')).toBeVisible();
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); expect(widths[0]).toBeLessThanOrEqual(widths[1]);
});
test('targeted inbox invitation is accepted explicitly and selects the joined organization', async ({ page }) => {
  const state = await setup(page); state.inbox = true; await signIn(page);
  await expect(page.getByRole('heading', { name: 'Your invitations' })).toBeVisible();
  await page.getByRole('button', { name: 'Accept invitation', exact: true }).click();
  await expect(page.locator('.organization-current h2')).toHaveText('Beta organization'); expect(state.accepted).toBe(true);
});
test('membership revocation clears cached names, directory and write controls', async ({ page }) => {
  const state = await setup(page); await enter(page); await page.getByRole('button', { name: 'Members', exact: true }).click();
  await expect(page.getByText('colleague.testnet', { exact: true })).toBeVisible(); state.revoked = true;
  await page.getByRole('button', { name: 'Refresh access', exact: true }).click();
  await expect(page.locator('.organization-workspace [role="alert"]')).toContainText('Organization access is unavailable');
  await expect(page.getByText('colleague.testnet', { exact: true })).toHaveCount(0); await expect(page.locator('.organization-current')).toHaveCount(0);
});
test('page-hide during wallet signature prevents late login and private view restoration', async ({ page }) => {
  const state = await setup(page, 'owner', true); await signIn(page);
  await expect.poll(() => page.evaluate(() => (window as any).organizationSignatures.length)).toBe(1);
  await page.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); (window as any).releaseOrganizationSignature(); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  await expect(page.getByRole('button', { name: 'Sign in with testnet wallet' })).toBeEnabled(); expect(state.loginCalls).toBe(0);
  await expect(page.getByLabel('Active organization')).toHaveCount(0);
});
test('changing service origin clears the session without forwarding its bearer to another origin', async ({ page }) => {
  await setup(page); await enter(page); const forwarded: string[] = [];
  await page.route('https://other-organization.example/**', route => { forwarded.push(route.request().headers().authorization ?? 'none'); return route.fulfill({ status: 503, json: { error: 'UNAVAILABLE' } }); });
  await page.getByLabel('Organization API origin').fill('https://other-organization.example');
  await expect(page.getByRole('button', { name: 'Sign in with testnet wallet' })).toBeVisible(); await expect(page.locator('.organization-current')).toHaveCount(0); expect(forwarded).toEqual([]);
  const storage = await page.evaluate(() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage)); expect(storage).not.toContain('s'.repeat(43));
});
test('page-hide clears loaded member and audit views with no automatic sign-in on return', async ({ page }) => {
  const state = await setup(page); await enter(page); await page.getByRole('button', { name: 'Members', exact: true }).click();
  await expect(page.getByText('colleague.testnet', { exact: true })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await expect(page.getByText('colleague.testnet', { exact: true })).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.getByRole('button', { name: 'Sign in with testnet wallet' })).toBeVisible(); expect(state.loginCalls).toBe(1);
});
for (const failure of ['network', 'html'] as const) {
  test(`failed access refresh clears member data and owner controls: ${failure}`, async ({ page }) => {
    const state = await setup(page); await enter(page);
    await page.getByRole('button', { name: 'Members', exact: true }).click();
    await expect(page.getByText('colleague.testnet', { exact: true })).toBeVisible();
    state.failure = failure; await page.getByRole('button', { name: 'Refresh access', exact: true }).click();
    await expect(page.locator('.organization-workspace [role="alert"]')).toBeVisible();
    await expect(page.getByText('colleague.testnet', { exact: true })).toHaveCount(0);
    await expect(page.locator('.organization-current')).toHaveCount(0);
    state.failure = 'none'; await page.getByRole('button', { name: 'Refresh access', exact: true }).click();
    await page.getByLabel('Active organization').selectOption(id);
    await expect(page.locator('.organization-current h2')).toHaveText('Example organization');
  });
}
test('stale mutation version clears the old role snapshot without replaying the write', async ({ page }) => {
  const state = await setup(page); await enter(page);
  await page.getByRole('button', { name: 'Members', exact: true }).click();
  await page.getByLabel('Role for colleague.testnet').selectOption('auditor'); state.failure = 'conflict';
  await page.getByRole('button', { name: 'Save role', exact: true }).click();
  await expect(page.locator('.organization-workspace [role="alert"]')).toContainText('This record changed');
  await expect(page.locator('.organization-current')).toHaveCount(0);
  expect(state.mutations).toEqual([]);
});
test('failed initial access loading clears a partially established login session', async ({ page }) => {
  const state = await setup(page); state.failure = 'network'; await signIn(page);
  await expect(page.locator('.organization-workspace [role="alert"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with testnet wallet', exact: true })).toBeEnabled();
  await expect(page.getByLabel('Active organization')).toHaveCount(0); expect(state.loginCalls).toBe(1);
});
