// sdk/client/crypto.ts
function canonical(value2) {
  if (value2 === null || typeof value2 === "string" || typeof value2 === "boolean")
    return JSON.stringify(value2);
  if (typeof value2 === "number" && Number.isSafeInteger(value2))
    return String(value2);
  if (Array.isArray(value2)) return `[${value2.map(canonical).join(",")}]`;
  if (typeof value2 === "object" && value2 && Object.getPrototypeOf(value2) === Object.prototype)
    return `{${Object.keys(value2).sort().map(
      (k) => `${JSON.stringify(k)}:${canonical(value2[k])}`
    ).join(",")}}`;
  throw new Error("Unsupported public JSON value");
}
var hex = (bytes2) => [...bytes2].map((b) => b.toString(16).padStart(2, "0")).join("");
async function sha256(value2) {
  return hex(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value2))
    )
  );
}
async function shaField(value2) {
  const bytes2 = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value2))
  );
  bytes2[0] &= 31;
  return BigInt(`0x${hex(bytes2)}`).toString();
}
function base64(bytes2) {
  let s = "";
  for (const b of bytes2) s += String.fromCharCode(b);
  return btoa(s);
}
function bytes(value2, max) {
  if (typeof value2 !== "string" || value2.length > max * 2 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
    value2
  ))
    throw new Error("Invalid encrypted journal encoding");
  const b = Uint8Array.from(atob(value2), (c) => c.charCodeAt(0));
  if (b.length > max) throw new Error("Journal is too large");
  return b;
}
var ITERATIONS = 25e4;
function storageContext(format) {
  const contexts = { "core-operation-journal": "core:operation-journal:v1", "core-invoice-library": "core:invoice-library:v1", "core-private-note": "core:private-note:v1", "core-private-receipt": "core:private-receipt:v1" };
  if (!Object.hasOwn(contexts, format)) throw new Error("Unsupported encrypted storage format");
  return new TextEncoder().encode(contexts[format]);
}
async function key(password, salt) {
  if (password.length < 12 || password.length > 1024)
    throw new Error("Use a passphrase of 12\u20131024 characters");
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function seal(value2, password, format = "core-operation-journal") {
  const plaintext = new TextEncoder().encode(canonical(value2));
  if (plaintext.length > 2e6) throw new Error("Encrypted storage exceeds 2 MB");
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: storageContext(format) },
    await key(password, salt),
    plaintext
  );
  return JSON.stringify({
    format,
    version: 1,
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: base64(salt),
    iv: base64(iv),
    ciphertext: base64(new Uint8Array(encrypted))
  });
}
async function unseal(envelope, password, format = "core-operation-journal") {
  if (envelope.length > 3e6) throw new Error("Encrypted backup exceeds 3 MB");
  const e = JSON.parse(envelope);
  if (!e || typeof e !== "object" || Array.isArray(e) || Object.keys(e).sort().join("|") !== "ciphertext|format|iterations|iv|kdf|salt|version" || e.format !== format || e.version !== 1 || e.kdf !== "PBKDF2-SHA256" || e.iterations !== ITERATIONS)
    throw new Error("Unsupported encrypted storage envelope");
  const salt = bytes(e.salt, 16), iv = bytes(e.iv, 12);
  if (salt.length !== 16 || iv.length !== 12)
    throw new Error("Invalid journal salt or IV");
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: storageContext(format) },
    await key(password, salt),
    bytes(e.ciphertext, 2000016)
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

// sdk/client/payment.ts
var GAS = "300000000000000";
var STORAGE = 20000000000000000000000n;
var BOND = 5000000000000000000000n;
var FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
function object(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2))
    throw new Error("Expected a public JSON object");
  return value2;
}
function account(value2) {
  if (typeof value2 !== "string" || value2.length < 2 || value2.length > 64 || !/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(value2))
    throw new Error("Invalid NEAR account");
  return value2;
}
function scalar(value2) {
  if (typeof value2 !== "string" || value2.length > 77 || !/^(0|[1-9][0-9]*)$/.test(value2) || BigInt(value2) >= FIELD)
    throw new Error("Invalid scalar");
  return value2;
}
function atomic(value2) {
  if (typeof value2 !== "string" || value2.length > 39 || !/^(0|[1-9][0-9]*)$/.test(value2) || BigInt(value2) >= 1n << 128n)
    throw new Error("Invalid atomic amount");
  return value2;
}
function hash(value2) {
  if (typeof value2 !== "string" || !/^[a-f0-9]{64}$/.test(value2))
    throw new Error("Invalid hash");
  return value2;
}
function exact(value2, keys) {
  if (Object.keys(value2).sort().join("|") !== keys.sort().join("|"))
    throw new Error("Unexpected fields in public call");
}
function parsePolicy(input) {
  const p = object(input);
  const allowed = [
    "network",
    "registry",
    "denomination",
    "feeRecipient",
    "registryWasmSha256",
    "vaultWasmSha256",
    "verifierSha256",
    ...p.tokenId !== void 0 ? ["tokenId"] : []
  ];
  exact(p, allowed);
  if (p.network !== "sandbox" && p.network !== "testnet")
    throw new Error("Unsupported network");
  const registry = account(p.registry);
  if (registry.length > 30) throw new Error("Registry is too long");
  const denomination = atomic(p.denomination);
  if (BigInt(denomination) <= 0n || BigInt(denomination) > ((1n << 128n) - 1n) / 256n)
    throw new Error("Invalid denomination");
  return {
    network: p.network,
    registry,
    denomination,
    feeRecipient: account(p.feeRecipient),
    registryWasmSha256: hash(p.registryWasmSha256),
    vaultWasmSha256: hash(p.vaultWasmSha256),
    verifierSha256: hash(p.verifierSha256),
    ...p.tokenId !== void 0 ? { tokenId: account(p.tokenId) } : {}
  };
}
function parseCall(input) {
  const c = object(input);
  exact(c, ["contract", "method", "args", "attachedYoctoNear", "gas"]);
  if (typeof c.method !== "string" || c.method.length > 64 || c.gas !== GAS)
    throw new Error("Unsupported function call or gas");
  return {
    contract: account(c.contract),
    method: c.method,
    args: object(c.args),
    attachedYoctoNear: atomic(c.attachedYoctoNear),
    gas: GAS
  };
}
function vault(value2, policy) {
  const v = account(value2);
  if (!new RegExp(
    `^v[a-f0-9]{32}\\.${policy.registry.replaceAll(".", "\\.")}$`
  ).test(v))
    throw new Error("Vault must be a direct protocol child");
  return v;
}
function feeQuote(policy) {
  const d = BigInt(policy.denomination), fee = d * 15n / 10000n;
  if (!policy.tokenId || fee === 0n)
    throw new Error("Use an FT shared group with a nonzero fee");
  return {
    principalTokens: d.toString(),
    feeTokens: fee.toString(),
    depositTokens: (d + fee).toString(),
    storageYoctoNear: STORAGE.toString()
  };
}
async function preparedPayment(input, policyInput, payerInput) {
  const policy = parsePolicy(policyInput), payer = account(payerInput), plan = object(input);
  if (Object.keys(plan).some(
    (k) => ![
      "quote",
      "storageTarget",
      "tokenCall",
      "completion",
      "checkedAtBlock",
      "prerequisite"
    ].includes(k)
  ))
    throw new Error(
      "Only a public Core FT call plan is accepted. Never import a private note or key."
    );
  const call = parseCall(plan.tokenCall), q = feeQuote(policy);
  exact(call.args, ["receiver_id", "amount", "msg"]);
  if (call.contract !== policy.tokenId || call.method !== "ft_transfer_call" || call.attachedYoctoNear !== "1" || typeof call.args.msg !== "string" || call.args.msg.length > 4096)
    throw new Error("Wrong token call");
  const msg = object(JSON.parse(call.args.msg));
  const receipt = hash(msg.disclosure_root);
  if (call.args.receiver_id !== policy.registry) {
    const destination2 = vault(call.args.receiver_id, policy);
    exact(msg, ["commitment", "disclosure_root"]);
    const commitment = scalar(msg.commitment);
    if (commitment === "0" || call.args.amount !== q.depositTokens)
      throw new Error("Wrong deposit principal or add-on fee");
    return {
      payment: {
        ...call,
        args: {
          receiver_id: destination2,
          amount: q.depositTokens,
          msg: JSON.stringify({ commitment, disclosure_root: receipt })
        }
      },
      reference: {
        kind: "deposit",
        vault: destination2,
        commitment,
        expectedOwner: payer,
        expectedDisclosureRoot: receipt
      }
    };
  }
  exact(msg, [
    "vault",
    "recipient",
    "disclosure_root",
    "proof",
    "public_inputs"
  ]);
  const destination = vault(msg.vault, policy), recipient = account(msg.recipient);
  if (recipient === policy.registry || recipient.endsWith(`.${policy.registry}`) || call.args.amount !== q.feeTokens)
    throw new Error("Wrong withdrawal destination or fee");
  if (typeof msg.proof !== "string" || !/^[A-Za-z0-9+/]{342}==$/.test(msg.proof) || atob(msg.proof).length !== 256)
    throw new Error("Invalid proof encoding");
  if (!Array.isArray(msg.public_inputs) || msg.public_inputs.length !== 5)
    throw new Error("Expected five proof inputs");
  const inputs = msg.public_inputs.map(scalar);
  const domain = await shaField(
    `core:ft:v3|${policy.network}|${policy.registry}|${policy.tokenId}|${policy.denomination}`
  );
  const context = await shaField(
    `core:action:ft:v3|${domain}|withdraw|${destination}|${recipient}|${receipt}`
  );
  if (inputs[4] !== domain || inputs[3] !== context)
    throw new Error(
      "Proof does not bind this asset, vault, recipient and receipt"
    );
  return {
    payment: {
      ...call,
      args: {
        receiver_id: policy.registry,
        amount: q.feeTokens,
        msg: JSON.stringify({
          vault: destination,
          recipient,
          disclosure_root: receipt,
          proof: msg.proof,
          public_inputs: inputs
        })
      }
    },
    reference: {
      kind: "withdrawal",
      nullifier: inputs[0],
      expectedVault: destination,
      expectedRecipient: recipient,
      expectedDisclosureRoot: receipt
    }
  };
}
function validatePrerequisite(input, policy, payer, ref) {
  const c = parseCall(input), targets = ref.kind === "deposit" ? [ref.vault] : [ref.expectedVault, policy.registry, ref.expectedRecipient];
  if (c.method === "storage_deposit" && c.contract === policy.tokenId) {
    exact(c.args, ["account_id", "registration_only"]);
    if (c.args.registration_only !== true || !targets.includes(account(c.args.account_id)) || BigInt(c.attachedYoctoNear) > 10n ** 24n)
      throw new Error("Registration is outside the reviewed payment");
    return c;
  }
  const target = ref.kind === "deposit" ? ref.vault : policy.registry;
  if (c.method === "prepay_storage" && c.contract === target) {
    exact(c.args, ["account_id"]);
    if (c.args.account_id !== payer || BigInt(c.attachedYoctoNear) <= 0n || BigInt(c.attachedYoctoNear) > STORAGE + BOND)
      throw new Error("Storage credit is outside the reviewed payment");
    return c;
  }
  throw new Error("Unapproved prerequisite call");
}
function validateRecovery(input, policy, ref) {
  const c = parseCall(input), args = ref.kind === "deposit" ? { commitment: ref.commitment } : { nullifier: ref.nullifier };
  if (c.contract !== (ref.kind === "deposit" ? ref.vault : policy.registry) || canonical(c.args) !== canonical(args))
    throw new Error("Recovery binding mismatch");
  if (c.method === (ref.kind === "deposit" ? "retry_deposit" : "retry_withdrawal") && c.attachedYoctoNear === STORAGE.toString())
    return c;
  if (ref.kind === "deposit" && c.method === "claim_deposit_refund" && c.attachedYoctoNear === "1")
    return c;
  throw new Error("Unapproved recovery call");
}

// sdk/client/organizations.ts
var ORGANIZATION_ROLES = Object.freeze(["owner", "admin", "operator", "viewer", "auditor"]);
var ORGANIZATION_PERMISSIONS = Object.freeze(["organization.read", "organization.update", "members.read", "members.manage", "invitations.manage", "audit.read", "ownership.transfer", "payments.read", "payments.create", "payments.approve", "payments.execute", "invoices.read", "invoices.create"]);
var ORGANIZATION_ROLE_PERMISSIONS = Object.freeze({
  owner: ORGANIZATION_PERMISSIONS,
  admin: Object.freeze(["organization.read", "organization.update", "members.read", "members.manage", "invitations.manage", "audit.read", "payments.read", "payments.create", "payments.approve", "payments.execute", "invoices.read", "invoices.create"]),
  operator: Object.freeze(["organization.read", "members.read", "payments.read", "payments.create", "payments.execute", "invoices.read", "invoices.create"]),
  viewer: Object.freeze(["organization.read"]),
  auditor: Object.freeze(["organization.read", "members.read", "audit.read", "payments.read", "invoices.read"])
});
function organizationOrigin(value2) {
  const u = new URL(value2);
  if (u.origin !== value2 || u.username || u.password || u.protocol !== "https:" && !(u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname))) throw new Error("Use an exact HTTPS service origin or loopback HTTP origin");
  return value2;
}
function organizationLoginMessage(c) {
  return canonical({ purpose: "Sign in to Core Organizations", version: 1, network: "testnet", ...c });
}
function parseOrganizationChallenge(value2, accountId, audience, origin, now = Date.now()) {
  const c = value2;
  if (!c || typeof c !== "object" || Object.keys(c).sort().join("|") !== "accountId|audience|expiresAt|id|message|network|nonce|origin|recipient" || typeof c.id !== "string" || !/^[a-f0-9-]{36}$/.test(c.id) || c.accountId !== account(accountId) || c.audience !== organizationOrigin(audience) || c.origin !== organizationOrigin(origin) || c.network !== "testnet" || typeof c.nonce !== "string" || c.nonce.length !== 64 || !/^[a-f0-9]{64}$/.test(c.nonce) || c.recipient !== new URL(audience).host || !Number.isFinite(Date.parse(c.expiresAt)) || Date.parse(c.expiresAt) <= now || Date.parse(c.expiresAt) > now + 36e4 || c.message !== organizationLoginMessage({ accountId, audience, origin, expiresAt: c.expiresAt })) throw new Error("Organization login challenge binding mismatch");
  return c;
}
async function organizationSigningDigest(c) {
  const str = (value2) => {
    const b = new TextEncoder().encode(value2), n = new Uint8Array(4);
    new DataView(n.buffer).setUint32(0, b.length, true);
    return [...n, ...b];
  };
  const tag = new Uint8Array(4);
  new DataView(tag.buffer).setUint32(0, 2147484061, true);
  const nonce = Uint8Array.from(c.nonce.match(/../g).map((v) => parseInt(v, 16)));
  return new Uint8Array(await crypto.subtle.digest("SHA-256", Uint8Array.from([...tag, ...str(c.message), ...nonce, ...str(c.recipient), 0])));
}
var OrganizationApiError = class extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
  status;
  code;
};
var OrganizationClient = class {
  constructor(origin, token) {
    this.token = token;
    this.origin = organizationOrigin(origin);
  }
  token;
  origin;
  async request(path, method = "GET", body, signal) {
    const url = new URL(path, this.origin);
    if (!path.startsWith("/") || url.origin !== this.origin || !/^\/(?:v1\/(?:auth|me|organizations)(?:\/[a-zA-Z0-9_.-]+)*|healthz)$/.test(url.pathname) || url.hash || url.search && !(/\/(audit|invoices)$/.test(url.pathname) && /^\?before=[1-9][0-9]{0,15}$/.test(url.search))) throw new Error("Invalid organization API path");
    const response = await fetch(this.origin + path, { method, credentials: "omit", redirect: "error", cache: "no-store", headers: {
      ...body !== void 0 ? { "content-type": "application/json" } : {},
      ...this.token ? { authorization: `Bearer ${this.token}` } : {}
    }, signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(25e3)]) : AbortSignal.timeout(25e3), ...body !== void 0 ? { body: JSON.stringify(body) } : {} });
    let value2;
    try {
      value2 = await response.json();
    } catch (error) {
      if (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name)) throw error;
      throw new OrganizationApiError(response.ok ? 502 : response.status, response.ok ? "INVALID_RESPONSE" : "ORGANIZATION_REQUEST_FAILED");
    }
    if (!response.ok) throw new OrganizationApiError(response.status, typeof value2?.error === "string" ? value2.error : "ORGANIZATION_REQUEST_FAILED");
    return value2;
  }
};

// sdk/client/corporate-payments.ts
function exact2(value2, keys) {
  if (Object.keys(value2).sort().join("|") !== keys.sort().join("|")) throw new Error("Unsupported corporate payment fields");
}
function corporateId(value2) {
  if (typeof value2 !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value2)) throw new Error("Invalid corporate payment ID");
  return value2;
}
async function corporateContent(input) {
  const raw = JSON.parse(canonical(input)), c = object(raw);
  exact2(c, ["format", "title", "policy", "payer", "payment", "prerequisites"]);
  if (c.format !== "core-corporate-payment-v1" || typeof c.title !== "string" || c.title.trim() !== c.title || c.title.length < 2 || c.title.length > 120 || /[\u0000-\u001f\u007f]/.test(c.title)) throw new Error("Use a payment title of 2\u2013120 characters");
  const policy = parsePolicy(c.policy), payer = account(c.payer);
  if (policy.network !== "testnet" || !policy.tokenId) throw new Error("Corporate payments support testnet FT withdrawals");
  const prepared = await preparedPayment({ tokenCall: c.payment }, policy, payer);
  if (prepared.reference.kind !== "withdrawal") throw new Error("Corporate payment must be a withdrawal");
  if (!Array.isArray(c.prerequisites) || c.prerequisites.length > 8) throw new Error("At most eight reviewed prerequisites are supported");
  const prerequisites = c.prerequisites.map((call) => validatePrerequisite(call, policy, payer, prepared.reference));
  if (new Set(prerequisites.map(canonical)).size !== prerequisites.length) throw new Error("Duplicate reviewed prerequisite");
  return { format: "core-corporate-payment-v1", title: c.title, policy, payer, payment: prepared.payment, prerequisites };
}
async function verifyCorporatePayment(input, organizationId) {
  const value2 = JSON.parse(canonical(input)), p = value2?.payload;
  if (!p) throw new Error("Invalid corporate payment");
  exact2(object(p), ["format", "organizationId", "paymentId", "creatorAccount", "creatorMembershipVersion", "expiresAt", "content"]);
  corporateId(p.organizationId);
  corporateId(p.paymentId);
  account(p.creatorAccount);
  if (p.format !== "core-corporate-approval-v1" || organizationId !== void 0 && p.organizationId !== organizationId || !Number.isSafeInteger(p.creatorMembershipVersion) || p.creatorMembershipVersion < 1 || !Number.isFinite(Date.parse(p.expiresAt)) || p.expiresAt !== new Date(p.expiresAt).toISOString() || p.creatorAccount !== p.content.payer) throw new Error("Corporate approval binding mismatch");
  const content = await corporateContent(p.content);
  if (canonical(content) !== canonical(p.content) || value2.contentHash !== await sha256(canonical(p)) || !["pending", "approved", "rejected", "cancelled", "dispatched", "invalidated"].includes(value2.state) || !Number.isSafeInteger(value2.version) || value2.version < 1 || typeof value2.approvalValid !== "boolean" || !Array.isArray(value2.dispatches) || value2.dispatches.length > 9) throw new Error("Corporate payment content or checksum mismatch");
  if (value2.approvedBy !== null) account(value2.approvedBy);
  if (value2.approvalValid && (!value2.approvedBy || value2.approvedBy === p.creatorAccount || !Number.isSafeInteger(value2.approverMembershipVersion) || value2.approverMembershipVersion < 1 || value2.state !== "approved")) throw new Error("Invalid independent approval");
  return value2;
}
function corporateQuote(content) {
  const q = feeQuote(content.policy);
  return {
    principalTokens: q.principalTokens,
    feeTokens: q.feeTokens,
    maximumAttachedYoctoNear: [...content.prerequisites, content.payment].reduce((sum, c) => sum + BigInt(c.attachedYoctoNear), 0n).toString()
  };
}
function corporateSettlementGuards(client, approved) {
  const selected = JSON.parse(canonical(approved)), base = `/v1/organizations/${corporateId(selected.payload.organizationId)}/payments/${corporateId(selected.payload.paymentId)}`;
  const bind = async (operation) => {
    const fixed = await verifyCorporatePayment(selected), c = fixed.payload.content;
    if (canonical(operation.policy) !== canonical(c.policy) || operation.payer !== c.payer || canonical(operation.payment) !== canonical(c.payment)) throw new Error("Payment differs from the independently approved corporate content");
    return fixed;
  };
  const current = async () => {
    const value2 = await verifyCorporatePayment(await client.request(base), selected.payload.organizationId);
    if (value2.contentHash !== selected.contentHash || canonical(value2.payload) !== canonical(selected.payload) || !value2.approvalValid || value2.state !== "approved" || Date.now() >= Date.parse(value2.payload.expiresAt)) throw new Error("Independent corporate approval is unavailable or no longer current");
    return value2;
  };
  return {
    async beforeImport(payment, payer) {
      await bind({ payment: payment.payment, payer, policy: selected.payload.content.policy });
      await current();
    },
    async beforeSubmit(operation, review) {
      await bind(operation);
      if (review.kind === "retry" || review.kind === "refund") return () => {
      };
      await current();
      const checked = Date.now();
      return () => {
        if (Date.now() < checked || Date.now() - checked > 15e3 || Date.now() >= Date.parse(selected.payload.expiresAt)) throw new Error("Corporate approval check expired; review again");
      };
    },
    async beforeDispatch(operation, review) {
      await bind(operation);
      if (review.kind === "retry" || review.kind === "refund") return;
      if (!review.call || !review.callHash || !["payment", "prerequisite"].includes(review.kind ?? "")) throw new Error("Unsupported corporate dispatch");
      const permit = await client.request(base + "/authorize", "POST", { contentHash: selected.contentHash, kind: review.kind, call: review.call });
      if (permit.contentHash !== selected.contentHash || permit.callHash !== review.callHash || Date.now() >= Date.parse(permit.expiresAt) || Date.parse(permit.expiresAt) > Date.now() + 16e3 || !Number.isFinite(Date.parse(permit.expiresAt))) throw new Error("Invalid corporate dispatch authorization");
    }
  };
}

// sdk/client/journal.ts
function transactionRef(input) {
  const t = object(input);
  if (Object.keys(t).sort().join("|") !== "hash|signer" || typeof t.hash !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(t.hash))
    throw new Error("Invalid transaction reference");
  return { hash: t.hash, signer: account(t.signer) };
}
async function validate(input) {
  const data = object(input);
  if (Object.keys(data).sort().join("|") !== "operations|version" || data.version !== 1 || !Array.isArray(data.operations) || data.operations.length > 100)
    throw new Error("Invalid operation journal");
  const ids = /* @__PURE__ */ new Set();
  for (const raw of data.operations) {
    const o = object(raw);
    if (Object.keys(o).sort().join("|") !== "attempts|createdAt|id|outcome|payer|payment|policy|reference" || typeof o.id !== "string" || !/^[a-f0-9-]{36}$/.test(o.id) || ids.has(o.id) || typeof o.createdAt !== "string" || !Number.isFinite(Date.parse(o.createdAt)) || !["open", "complete", "refunded"].includes(o.outcome) || !Array.isArray(o.attempts) || o.attempts.length > 64)
      throw new Error("Invalid journal operation");
    ids.add(o.id);
    o.policy = parsePolicy(o.policy);
    account(o.payer);
    const prepared = await preparedPayment(
      { tokenCall: o.payment },
      o.policy,
      o.payer
    );
    if (canonical(prepared.payment) !== canonical(o.payment) || canonical(prepared.reference) !== canonical(o.reference))
      throw new Error("Journal payment binding mismatch");
    for (const a of o.attempts) {
      if (Object.keys(a).some(
        (k) => ![
          "kind",
          "call",
          "callHash",
          "recordHash",
          "state",
          "transaction"
        ].includes(k)
      ) || ![
        "signing",
        "submitted",
        "confirmed",
        "observed",
        "uncertain",
        "not-accepted"
      ].includes(a.state) || typeof a.recordHash !== "string" || !/^[a-f0-9]{64}$/.test(a.recordHash))
        throw new Error("Invalid journal attempt");
      if (a.state === "observed" && a.kind !== "payment")
        throw new Error("Only payment acceptance can be observed");
      if (a.kind === "prerequisite")
        validatePrerequisite(a.call, o.policy, o.payer, o.reference);
      else if (a.kind === "payment") {
        if (canonical(a.call) !== canonical(o.payment))
          throw new Error("Journal payment changed");
      } else if (a.kind === "retry" || a.kind === "refund") {
        validateRecovery(a.call, o.policy, o.reference);
        if (a.kind === "refund" !== (a.call.method === "claim_deposit_refund"))
          throw new Error("Recovery kind mismatch");
      } else throw new Error("Invalid attempt kind");
      if (a.callHash !== await sha256(canonical(a.call)))
        throw new Error("Journal call hash mismatch");
      if (a.transaction && transactionRef(a.transaction).signer !== o.payer)
        throw new Error("Journal transaction signer mismatch");
      if (["submitted", "confirmed", "not-accepted"].includes(a.state) && !a.transaction)
        throw new Error("Transaction reference is required");
    }
  }
  return data.operations;
}
var OperationJournal = class {
  constructor(storage, password) {
    this.storage = storage;
    this.password = password;
  }
  storage;
  password;
  generation = 0;
  lock() {
    this.generation++;
    this.password = "";
  }
  async access(action) {
    const password = this.password, generation = this.generation;
    let active = true;
    const check = () => {
      if (!active || !password || !this.password || generation !== this.generation) throw new Error("Journal is locked");
    };
    try {
      check();
      return await this.storage.exclusive(async () => {
        check();
        const result = await action(password, check);
        check();
        return result;
      });
    } finally {
      active = false;
    }
  }
  async read(password, check) {
    const e = await this.storage.read();
    check();
    if (e === null)
      throw new Error("Create or restore an encrypted journal first");
    const decoded = await unseal(e, password);
    check();
    const operations = await validate(decoded);
    check();
    return operations;
  }
  async create() {
    return this.access(async (password, check) => {
      const existing = await this.storage.read();
      check();
      if (existing !== null)
        throw new Error("A journal already exists; unlock it instead");
      const envelope = await seal({ version: 1, operations: [] }, password);
      check();
      await this.storage.write(envelope);
      check();
    });
  }
  async list() {
    return this.access((password, check) => this.read(password, check));
  }
  async export() {
    return this.access(async (password, check) => {
      await this.read(password, check);
      const envelope = await this.storage.read();
      check();
      return envelope;
    });
  }
  async restore(envelope) {
    return this.access(async (password, check) => {
      const existing = await this.storage.read();
      check();
      if (existing !== null)
        throw new Error(
          "Restore into an empty journal storage to preserve existing operations"
        );
      const decoded = await unseal(envelope, password);
      check();
      await validate(decoded);
      check();
      await this.storage.write(envelope);
      check();
    });
  }
  async update(fn) {
    return this.access(async (password, check) => {
      const operations = await this.read(password, check);
      const persist = async () => {
        check();
        await validate({ version: 1, operations });
        check();
        const envelope = await seal({ version: 1, operations }, password);
        check();
        await this.storage.write(envelope);
        check();
      };
      return fn(operations, persist, check);
    });
  }
};
function browserJournalStorage(key2 = "core-live-journal-v1", label = "Journal") {
  return {
    read: async () => localStorage.getItem(key2),
    write: async (e) => {
      localStorage.setItem(key2, e);
      if (localStorage.getItem(key2) !== e)
        throw new Error(`${label} persistence failed`);
    },
    exclusive: async (fn) => {
      if (!navigator.locks)
        throw new Error("This browser needs Web Locks for encrypted storage");
      return navigator.locks.request(
        key2,
        { mode: "exclusive", ifAvailable: true },
        async (lock) => {
          if (!lock)
            throw new Error(
              `${label} is in use by another tab or request`
            );
          return fn();
        }
      );
    }
  };
}

// sdk/client/invoices.ts
var INVOICE_SIGNING_RECIPIENT = "core.invoice.v1";
function exact3(o, keys) {
  if (Object.keys(o).sort().join("|") !== keys.sort().join("|"))
    throw new Error("Unexpected invoice fields");
}
function hex2(value2) {
  if (typeof value2 !== "string" || !/^[a-f0-9]{64}$/.test(value2))
    throw new Error("Invalid invoice digest or nonce");
  return value2;
}
function text(value2, max) {
  if (typeof value2 !== "string" || value2.length < 1 || value2.length > max || /[\u0000-\u001f\u007f]/.test(value2))
    throw new Error("Invalid invoice text");
  return value2;
}
function date(value2) {
  if (typeof value2 !== "string" || !Number.isFinite(Date.parse(value2)) || new Date(value2).toISOString() !== value2)
    throw new Error("Use a canonical UTC invoice time");
  return value2;
}
function parseInvoice(input) {
  const o = object(input);
  exact3(o, [
    "version",
    "id",
    "merchantAccount",
    "recipient",
    "title",
    "reference",
    "policy",
    "units",
    "createdAt",
    "expiresAt",
    "nonce",
    ...o.version === 2 ? ["paymentNonces"] : []
  ]);
  if (o.version !== 1 && o.version !== 2 || typeof o.id !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
    o.id
  ) || typeof o.units !== "number" || !Number.isInteger(o.units) || o.units < 1 || o.units > 32)
    throw new Error("Invoice requires 1\u201332 fixed-denomination notes");
  const policy = parsePolicy(o.policy);
  feeQuote(policy);
  const createdAt = date(o.createdAt), expiresAt = date(o.expiresAt);
  if (Date.parse(expiresAt) <= Date.parse(createdAt) || Date.parse(expiresAt) - Date.parse(createdAt) > 90 * 864e5)
    throw new Error("Invoice expiry must be within 90 days of issue");
  const recipient = account(o.recipient);
  if (recipient === policy.registry || recipient.endsWith("." + policy.registry))
    throw new Error("Invoice must pay an external recipient");
  const terms = {
    id: o.id,
    merchantAccount: account(o.merchantAccount),
    recipient,
    title: text(o.title, 120),
    reference: text(o.reference, 80),
    policy,
    units: o.units,
    createdAt,
    expiresAt,
    nonce: hex2(o.nonce)
  };
  if (o.version === 1) return { ...terms, version: 1 };
  const paymentNonces = parsePaymentNonces(o.paymentNonces, terms.units);
  if (paymentNonces.includes(terms.nonce)) throw new Error("Invoice signing and payment nonces must differ");
  return { ...terms, version: 2, paymentNonces };
}
function parsePaymentNonces(input, units) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 32 || units !== void 0 && input.length !== units)
    throw new Error("Provide one unique nonce per invoice payment unit");
  const values = input.map(hex2);
  if (new Set(values).size !== values.length) throw new Error("Invoice payment nonces must be distinct");
  return values;
}
function createInvoice(input) {
  if (!Number.isInteger(input.units) || input.units < 1 || input.units > 32) throw new Error("Invoice requires 1\u201332 fixed-denomination notes");
  const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
  return parseInvoice({ ...input, version: 2, id: crypto.randomUUID(), nonce: random(), paymentNonces: Array.from({ length: input.units }, random) });
}
function parseSignedInvoice(input) {
  const o = object(input);
  exact3(o, ["invoice", "signature"]);
  const invoice = parseInvoice(o.invoice), s = object(o.signature);
  exact3(s, ["accountId", "publicKey", "signature"]);
  if (s.accountId !== invoice.merchantAccount || typeof s.publicKey !== "string" || !/^ed25519:[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s.publicKey) || typeof s.signature !== "string" || !/^[A-Za-z0-9+/]{86}==$/.test(s.signature) || atob(s.signature).length !== 64)
    throw new Error("Invalid invoice merchant signature");
  return {
    invoice,
    signature: {
      accountId: account(s.accountId),
      publicKey: s.publicKey,
      signature: s.signature
    }
  };
}
async function invoiceHash(invoice) {
  const i = parseInvoice(invoice);
  return sha256(`core:invoice:v${i.version}|` + canonical(i));
}
async function invoiceRootsFromHash(hash4, nonces) {
  hex2(hash4);
  return Promise.all(parsePaymentNonces(nonces).map((nonce) => sha256(`core:invoice:payment:v2|${hash4}|${nonce}`)));
}
async function invoicePaymentRoots(invoice) {
  const i = parseInvoice(invoice), digest4 = await invoiceHash(i);
  return i.version === 1 ? [await sha256("core:invoice:settlement:v1|" + digest4)] : invoiceRootsFromHash(digest4, i.paymentNonces);
}
async function invoiceRoot(invoice, paymentIndex) {
  const roots = await invoicePaymentRoots(invoice);
  if (invoice.version === 2 && roots.length > 1 && paymentIndex === void 0) throw new Error("Choose a payment index for this v2 invoice");
  const index = paymentIndex ?? 0;
  if (!Number.isInteger(index) || index < 0 || index >= roots.length) throw new Error("Invalid invoice payment index");
  return roots[index];
}
async function invoiceStatusRequest(invoice) {
  const i = parseInvoice(invoice);
  return {
    invoiceHash: await invoiceHash(i),
    recipient: i.recipient,
    units: i.units,
    expiresAt: i.expiresAt,
    ...i.version === 2 ? { version: 2, paymentNonces: [...i.paymentNonces] } : {}
  };
}
async function assertInvoiceReferenceAvailable(invoice, root, status) {
  const roots = await invoicePaymentRoots(invoice);
  if (status.invoiceHash !== await invoiceHash(invoice) || !roots.includes(root)) throw new Error("Payment reference is not bound to this invoice");
  if (invoice.version === 2 ? status.settlementRoot !== null || canonical(status.settlementRoots) !== canonical(roots) : status.settlementRoot !== roots[0]) throw new Error("Invoice reference set differs from signed terms");
  validateInvoiceStatus(status, invoice);
  if (invoice.version === 2 && status.confirmations.some((c) => c.settlementRoot === root))
    throw new Error("This payment reference already has an indexed payment; choose an unused reference");
}
function invoiceMessage(hash4, network) {
  return `Core invoice v1
Network: ${network}
Digest: ${hex2(hash4)}`;
}
function nonceBytes(nonce) {
  return Uint8Array.from(hex2(nonce).match(/../g), (v) => parseInt(v, 16));
}
function base58(input) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let n = 0n;
  for (const c of input) {
    const i = alphabet.indexOf(c);
    if (i < 0) throw new Error("Invalid merchant key");
    n = n * 58n + BigInt(i);
  }
  const out = [];
  while (n > 0n) {
    out.unshift(Number(n & 255n));
    n >>= 8n;
  }
  for (const c of input) {
    if (c !== "1") break;
    out.unshift(0);
  }
  return Uint8Array.from(out);
}
async function invoiceSigningDigest(hash4, network, nonce) {
  const str = (s) => {
    const b = new TextEncoder().encode(s), length = new Uint8Array(4);
    new DataView(length.buffer).setUint32(0, b.length, true);
    return [...length, ...b];
  }, tag = new Uint8Array(4);
  new DataView(tag.buffer).setUint32(0, 2147484061, true);
  const data = Uint8Array.from([
    ...tag,
    ...str(invoiceMessage(hash4, network)),
    ...nonceBytes(nonce),
    ...str(INVOICE_SIGNING_RECIPIENT),
    0
  ]);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}
async function verifyInvoiceProofSignature(proof, network) {
  const raw = base58(proof.publicKey.replace(/^ed25519:/, ""));
  if (raw.length !== 32) throw new Error("Invalid Ed25519 invoice key");
  const key2 = await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "Ed25519" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify(
    "Ed25519",
    key2,
    Uint8Array.from(atob(proof.signature), (c) => c.charCodeAt(0)),
    await invoiceSigningDigest(proof.invoiceHash, network, proof.nonce)
  );
}
async function invoiceProof(input) {
  const s = parseSignedInvoice(input);
  return {
    invoiceHash: await invoiceHash(s.invoice),
    merchantAccount: s.invoice.merchantAccount,
    nonce: s.invoice.nonce,
    publicKey: s.signature.publicKey,
    signature: s.signature.signature
  };
}
async function verifySignedInvoice(input) {
  const s = parseSignedInvoice(input);
  if (!await verifyInvoiceProofSignature(
    await invoiceProof(s),
    s.invoice.policy.network
  ))
    throw new Error("Invoice signature does not match its terms");
  return s;
}
function invoiceQuote(invoice) {
  const i = parseInvoice(invoice), q = feeQuote(i.policy), units = BigInt(i.units);
  return {
    principalTokens: (BigInt(i.policy.denomination) * units).toString(),
    withdrawalFeeTokens: (BigInt(q.feeTokens) * units).toString(),
    units: i.units,
    storageYoctoNearPerAttempt: q.storageYoctoNear
  };
}
function requireOpenInvoice(invoice, now = Date.now()) {
  const i = parseInvoice(invoice);
  if (now < Date.parse(i.createdAt) - 3e5 || now >= Date.parse(i.expiresAt))
    throw new Error("This invoice is expired or not yet valid");
}
async function matchInvoicePlan(input, invoice, payer, paymentIndex) {
  requireOpenInvoice(invoice);
  const p = await preparedPayment(input, invoice.policy, payer);
  if (p.reference.kind !== "withdrawal" || p.reference.expectedRecipient !== invoice.recipient || !(await invoicePaymentRoots(invoice)).includes(p.reference.expectedDisclosureRoot ?? "") || paymentIndex !== void 0 && p.reference.expectedDisclosureRoot !== await invoiceRoot(invoice, paymentIndex))
    throw new Error("Payment proof must bind this invoice root and recipient");
  return p;
}
function invoiceLink(origin, signed) {
  const url = new URL("/pay/", origin);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))
    throw new Error("Use an HTTPS checkout origin");
  let bytes2 = "";
  for (const b of new TextEncoder().encode(
    canonical(parseSignedInvoice(signed))
  ))
    bytes2 += String.fromCharCode(b);
  url.hash = "invoice=" + btoa(bytes2).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return url.toString();
}
function invoiceFromFragment(fragment) {
  const p = new URLSearchParams(fragment.replace(/^#/, "")), v = p.get("invoice");
  if ([...p.keys()].join("|") !== "invoice" || !v || v.length > 16e3 || !/^[A-Za-z0-9_-]+$/.test(v))
    throw new Error("Invalid invoice link");
  const bytes2 = Uint8Array.from(
    atob(v.replaceAll("-", "+").replaceAll("_", "/")),
    (c) => c.charCodeAt(0)
  );
  return parseSignedInvoice(
    JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes2))
  );
}
function validateInvoiceStatus(input, invoice) {
  const s = object(input), p = invoiceQuote(invoice), expected = BigInt(p.principalTokens);
  const amount = (key2) => {
    const v = s[key2];
    if (typeof v !== "string" || !/^(0|[1-9][0-9]*)$/.test(v) || v.length > 42)
      throw new Error("Invalid invoice totals");
    return BigInt(v);
  };
  const paid = amount("paidTokens"), remaining = amount("remainingTokens"), over = amount("overpaidTokens"), late = amount("lateTokens"), unit = BigInt(invoice.policy.denomination);
  if (s.expectedTokens !== p.principalTokens || paid % unit !== 0n || remaining !== (paid < expected ? expected - paid : 0n) || over !== (paid > expected ? paid - expected : 0n) || late > paid || s.confirmedPayments !== Number(paid / unit) || typeof s.coverageLimited !== "boolean" || s.chainFreshnessChecked !== false || !Array.isArray(s.confirmations) || s.confirmations.length !== s.confirmedPayments || s.confirmations.length > 1e3)
    throw new Error("Inconsistent invoice settlement totals");
  const valid = s.state === "review_required" ? s.coverageLimited === true : s.coverageLimited === false && (s.state === "paid" ? paid === expected && late === 0n : s.state === "paid_late" ? paid === expected && late > 0n : s.state === "overpaid" ? paid > expected : s.state === "partial" || s.state === "partial_expired" ? paid > 0n && paid < expected : s.state === "awaiting_payment" || s.state === "expired" ? paid === 0n : false);
  if (!valid)
    throw new Error("Invoice state does not match confirmed principal");
  const c = object(s.checkedAt);
  if (typeof c.hash !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(c.hash) || typeof c.height !== "number" || !Number.isSafeInteger(c.height) || c.height < 0 || typeof c.updatedAt !== "string" || !Number.isFinite(Date.parse(c.updatedAt)))
    throw new Error("Invalid invoice checkpoint");
  if (invoice.version === 2 && (s.settlementRoot !== null || !Array.isArray(s.settlementRoots) || s.settlementRoots.length !== invoice.units || s.settlementRoots.some((r) => typeof r !== "string" || !/^[a-f0-9]{64}$/.test(r)) || new Set(s.settlementRoots).size !== invoice.units))
    throw new Error("Invalid per-payment invoice references");
  const nullifiers = /* @__PURE__ */ new Set(), recordIndices = /* @__PURE__ */ new Set();
  let latePayments = 0;
  for (const entry of s.confirmations) {
    const r = object(entry);
    if (typeof r.nullifier !== "string" || !/^(0|[1-9][0-9]*)$/.test(r.nullifier) || nullifiers.has(r.nullifier) || typeof r.recordIndex !== "number" || !Number.isSafeInteger(r.recordIndex) || r.recordIndex < 0 || recordIndices.has(r.recordIndex) || invoice.version === 2 && !s.settlementRoots.includes(String(r.settlementRoot)) || typeof r.blockHeight !== "number" || !Number.isSafeInteger(r.blockHeight) || r.blockHeight < 0 || r.blockHeight > c.height || typeof r.late !== "boolean")
      throw new Error("Invalid invoice confirmation");
    nullifiers.add(r.nullifier);
    recordIndices.add(r.recordIndex);
    if (r.late) latePayments++;
  }
  if (late !== BigInt(latePayments) * unit)
    throw new Error("Invoice late total differs from confirmed payments");
  if (invoice.version === 2) {
    const unique = new Set(s.confirmations.map((entry) => object(entry).settlementRoot)).size;
    if (s.reusedPaymentReferences !== s.confirmations.length - unique) throw new Error("Invalid invoice reference reuse count");
  }
  return input;
}

// sdk/client/library.ts
var FORMAT = "core-invoice-library";
function exact4(value2, fields) {
  if (Object.keys(value2).sort().join("|") !== [...fields].sort().join("|")) throw new Error("Unexpected invoice library fields");
}
function identity(raw) {
  const value2 = object(raw);
  exact4(value2, ["network", "accountId"]);
  if (value2.network !== "testnet" && value2.network !== "sandbox") throw new Error("Invalid library network");
  return { network: value2.network, accountId: account(value2.accountId) };
}
function digest(value2) {
  if (typeof value2 !== "string" || !/^[a-f0-9]{64}$/.test(value2)) throw new Error("Invalid library invoice hash");
  return value2;
}
async function validate2(raw, owner) {
  const value2 = object(raw);
  exact4(value2, ["version", "owner", "invoices"]);
  if (value2.version !== 1 || canonical(identity(value2.owner)) !== canonical(owner) || !Array.isArray(value2.invoices))
    throw new Error("Invalid invoice library or different merchant/network");
  if (value2.invoices.length > 100) throw new Error("Invoice library supports at most 100 saved requests; keep a backup before removing local copies");
  const invoices = [], ids = /* @__PURE__ */ new Set(), hashes = /* @__PURE__ */ new Set();
  for (const rawEntry of value2.invoices) {
    const entry = object(rawEntry);
    exact4(entry, ["hash", "signed", "savedAt"]);
    const signed = await verifySignedInvoice(entry.signed), hash4 = digest(entry.hash);
    if (signed.invoice.merchantAccount !== owner.accountId || signed.invoice.policy.network !== owner.network || await invoiceHash(signed.invoice) !== hash4 || ids.has(signed.invoice.id) || hashes.has(hash4))
      throw new Error("Invoice library identity, integrity or uniqueness mismatch");
    if (typeof entry.savedAt !== "string" || !Number.isFinite(Date.parse(entry.savedAt)) || new Date(entry.savedAt).toISOString() !== entry.savedAt) throw new Error("Invalid invoice save time");
    ids.add(signed.invoice.id);
    hashes.add(hash4);
    invoices.push({ hash: hash4, signed, savedAt: entry.savedAt });
  }
  return { version: 1, owner: identity(owner), invoices };
}
var InvoiceLibrary = class {
  constructor(storage, password, owner) {
    this.storage = storage;
    this.password = password;
    this.owner = Object.freeze(identity(owner));
  }
  storage;
  password;
  owner;
  generation = 0;
  lock() {
    this.generation++;
    this.password = "";
  }
  async access(action) {
    const current = this.generation, password = this.password;
    const check = () => {
      if (!password || !this.password || current !== this.generation) throw new Error("Invoice library is locked");
    };
    check();
    return this.storage.exclusive(async () => {
      check();
      return action(password, check);
    });
  }
  async read(password, check) {
    const envelope = await this.storage.read();
    check();
    if (envelope === null) throw new Error("Create or restore an encrypted invoice library first");
    const data = await this.decode(envelope, password);
    check();
    return { envelope, data };
  }
  async decode(envelope, password) {
    try {
      return await validate2(await unseal(envelope, password, FORMAT), this.owner);
    } catch (error) {
      if (error && typeof error === "object" && "name" in error && error.name === "OperationError") throw new Error("Could not decrypt invoice library. Check the passphrase and backup integrity.");
      throw error;
    }
  }
  async write(data, password, check) {
    const validated = await validate2(data, this.owner);
    check();
    const envelope = await seal(validated, password, FORMAT);
    check();
    await this.storage.write(envelope);
    check();
  }
  create() {
    return this.access(async (password, check) => {
      if (await this.storage.read() !== null) throw new Error("A library already exists; unlock or merge a backup instead");
      check();
      await this.write({ version: 1, owner: identity(this.owner), invoices: [] }, password, check);
    });
  }
  list() {
    return this.access(async (password, check) => {
      const { data } = await this.read(password, check);
      return data.invoices.sort((a, b) => b.savedAt.localeCompare(a.savedAt) || a.hash.localeCompare(b.hash));
    });
  }
  add(raw) {
    return this.access(async (password, check) => {
      const { data } = await this.read(password, check), signed = await verifySignedInvoice(raw), hash4 = await invoiceHash(signed.invoice);
      check();
      if (signed.invoice.merchantAccount !== this.owner.accountId || signed.invoice.policy.network !== this.owner.network) throw new Error("Invoice belongs to a different merchant or network");
      const existing = data.invoices.find((e) => e.signed.invoice.id === signed.invoice.id || e.hash === hash4);
      if (existing) {
        if (existing.hash !== hash4 || canonical(existing.signed) !== canonical(signed)) throw new Error("Invoice ID already has different signed terms or signature");
        return existing;
      }
      const entry = { hash: hash4, signed, savedAt: (/* @__PURE__ */ new Date()).toISOString() };
      data.invoices.push(entry);
      await this.write(data, password, check);
      return entry;
    });
  }
  remove(hash4) {
    return this.access(async (password, check) => {
      digest(hash4);
      const { data } = await this.read(password, check), remaining = data.invoices.filter((e) => e.hash !== hash4);
      if (remaining.length === data.invoices.length) throw new Error("Invoice is not in this library");
      data.invoices = remaining;
      await this.write(data, password, check);
    });
  }
  export() {
    return this.access(async (password, check) => (await this.read(password, check)).envelope);
  }
  restore(envelope) {
    return this.access(async (password, check) => {
      if (await this.storage.read() !== null) throw new Error("Restore requires empty storage; unlock the existing library and merge instead");
      const data = await this.decode(envelope, password);
      check();
      await this.write(data, password, check);
    });
  }
  merge(envelope, backupPassword) {
    return this.access(async (password, check) => {
      const { data } = await this.read(password, check), incoming = await this.decode(envelope, backupPassword ?? password);
      for (const entry of incoming.invoices) {
        const existing = data.invoices.find((e) => e.signed.invoice.id === entry.signed.invoice.id || e.hash === entry.hash);
        if (existing) {
          if (existing.hash !== entry.hash || canonical(existing.signed) !== canonical(entry.signed)) throw new Error("Backup conflicts with an immutable saved invoice");
        } else data.invoices.push(entry);
      }
      await this.write(data, password, check);
    });
  }
};
function browserInvoiceLibraryStorage(owner) {
  const parsed = identity(owner);
  return browserJournalStorage(`core-invoice-library-v1:${parsed.network}:${parsed.accountId}`, "Invoice library");
}

// sdk/client/session.ts
var SettlementSession = class {
  constructor(journal, gateway, wallet, policy, guards = {}) {
    this.journal = journal;
    this.gateway = gateway;
    this.wallet = wallet;
    this.guards = guards;
    this.policy = parsePolicy(policy);
  }
  journal;
  gateway;
  wallet;
  guards;
  policy;
  async trusted() {
    if (canonical(parsePolicy(await this.gateway.policy())) !== canonical(this.policy))
      throw new Error(
        "API policy differs from the independently trusted policy"
      );
  }
  async identity(payer) {
    const identity2 = await this.wallet.identity();
    if (identity2.network !== this.policy.network || identity2.accountId !== payer)
      throw new Error("Connect the reviewed payer on the correct network");
  }
  async importPlan(plan) {
    await this.trusted();
    const identity2 = await this.wallet.identity();
    account(identity2.accountId);
    await this.identity(identity2.accountId);
    const prepared = await preparedPayment(
      plan,
      this.policy,
      identity2.accountId
    );
    return this.journal.update(async (operations, persist) => {
      await this.guards.beforeImport?.(prepared, identity2.accountId, operations);
      if (operations.length >= 100)
        throw new Error(
          "Journal capacity reached; preserve a backup and start another journal"
        );
      const duplicate = operations.find(
        (o) => canonical(o.policy) === canonical(this.policy) && canonical(o.reference) === canonical(prepared.reference)
      );
      if (duplicate) return duplicate;
      const op = {
        id: crypto.randomUUID(),
        policy: this.policy,
        payer: identity2.accountId,
        ...prepared,
        attempts: [],
        outcome: "open",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      operations.push(op);
      await persist();
      return op;
    });
  }
  operation(operations, id2) {
    const o = operations.find((o2) => o2.id === id2);
    if (!o || canonical(o.policy) !== canonical(this.policy))
      throw new Error("Operation not found in this trusted group");
    return o;
  }
  async next(o, persist) {
    await this.trusted();
    const observation = await this.gateway.observe(o.reference), recordHash = await sha256(canonical(observation.record));
    const result = (action, message, kind, call) => Promise.resolve({
      operationId: o.id,
      action,
      message,
      observation,
      recordHash,
      ...kind ? { kind } : {},
      ...call ? { call } : {}
    }).then(async (r2) => ({
      ...r2,
      ...call ? { callHash: await sha256(canonical(call)) } : {}
    }));
    if (observation.complete || observation.refunded) {
      o.outcome = observation.complete ? "complete" : "refunded";
      await persist();
      return result(o.outcome, "Confirmed by finalized contract state");
    }
    if (o.outcome !== "open")
      return result(
        "wait",
        "Previously finalized operation; current read is inconsistent"
      );
    const last = o.attempts.at(-1);
    if (last && ["signing", "submitted", "uncertain"].includes(last.state)) {
      if (last.kind === "payment" && observation.record !== null) {
        last.state = "observed";
        await persist();
      } else if (last.transaction) {
        const checked = await this.gateway.verify(last.transaction, last.call);
        if (checked.status === "final" && checked.effect !== "unknown") {
          if (checked.transaction.hash !== last.transaction.hash || checked.transaction.signer !== o.payer)
            throw new Error("Transaction verification binding mismatch");
          last.state = checked.effect === "accepted" ? "confirmed" : "not-accepted";
          await persist();
        } else
          return result(
            "reconcile",
            checked.status === "pending" ? "Transaction is not final yet; refresh before continuing" : "Transaction effect is uncertain; do not resend"
          );
      } else
        return result(
          "reconcile",
          "Signature outcome is unknown. Supply the transaction hash; do not resend"
        );
    }
    if (observation.record !== null) {
      if (observation.refundAvailable && observation.refundCall) {
        if (o.attempts.some(
          (a) => a.kind === "refund" && a.state === "confirmed" && a.recordHash === recordHash
        ))
          return result(
            "wait",
            "Confirmed refund claim is awaiting a new contract state"
          );
        const call = validateRecovery(
          observation.refundCall,
          this.policy,
          o.reference
        );
        return result(
          "sign",
          "Claim the failed deposit refund",
          "refund",
          call
        );
      }
      if (observation.retryAvailable && observation.retryCall) {
        if (o.attempts.some(
          (a) => a.kind === "retry" && a.state === "confirmed" && a.recordHash === recordHash
        ))
          return result(
            "wait",
            "Confirmed recovery is awaiting a new contract state"
          );
        return result(
          "sign",
          "Retry the original fixed destination; storage attachment is additional",
          "retry",
          validateRecovery(observation.retryCall, this.policy, o.reference)
        );
      }
      return result(
        "wait",
        "Token acceptance recorded; settlement is still processing"
      );
    }
    if (o.attempts.some(
      (a) => a.kind === "payment" && ["confirmed", "observed"].includes(a.state)
    ))
      return result(
        "wait",
        "Token call accepted; waiting for the bound contract record"
      );
    const r = o.reference;
    const preflight = await this.gateway.preflight({
      operation: r.kind === "deposit" ? "deposit" : "withdraw",
      payer: o.payer,
      vault: r.kind === "deposit" ? r.vault : r.expectedVault,
      ...r.kind === "withdrawal" ? { recipient: r.expectedRecipient } : {}
    });
    if (!preflight.canPrepare || preflight.blockers.length)
      return result(
        "blocked",
        preflight.blockers.map((b) => `${b.code}: ${b.accountId}`).join("; ") || "Prerequisites cannot be prepared"
      );
    const first = preflight.prerequisites[0];
    if (first) {
      const call = validatePrerequisite(first, this.policy, o.payer, r), hash4 = await sha256(canonical(call));
      if (o.attempts.some(
        (a) => a.kind === "prerequisite" && a.state === "confirmed" && a.callHash === hash4
      ))
        return result(
          "wait",
          "Confirmed prerequisite still appears in preflight; wait for a fresh chain read"
        );
      return result(
        "sign",
        "Approve this prerequisite, then review the next step",
        "prerequisite",
        call
      );
    }
    if (!preflight.prerequisitesSatisfied)
      return result("blocked", "Preflight is incomplete");
    return result(
      "sign",
      "Approve the token payment with the 0.15% add-on fee",
      "payment",
      o.payment
    );
  }
  async review(id2) {
    return this.journal.update(
      async (operations, persist) => this.next(this.operation(operations, id2), persist)
    );
  }
  async submitReviewed(id2, reviewedCallHash) {
    return this.journal.update(async (operations, persist, check) => {
      const o = this.operation(operations, id2);
      await this.identity(o.payer);
      const review = await this.next(o, persist);
      if (review.action !== "sign" || !review.call || !review.kind || review.callHash !== reviewedCallHash)
        throw new Error(
          "The next step changed. Review it again before signing"
        );
      if (o.attempts.length >= 64)
        throw new Error(
          "Attempt limit reached; reconcile existing transactions"
        );
      if (this.guards.beforeDispatch && !this.wallet.supportsBeforeDispatch) throw new Error("This wallet adapter cannot enforce corporate dispatch authorization");
      const authorize = await this.guards.beforeSubmit?.(o, review, operations);
      check();
      const a = {
        kind: review.kind,
        call: review.call,
        callHash: review.callHash,
        recordHash: review.recordHash,
        state: "signing"
      };
      o.attempts.push(a);
      await persist();
      check();
      try {
        authorize?.();
      } catch (error) {
        o.attempts.pop();
        await persist();
        throw error;
      }
      try {
        let dispatched = false;
        const tx = await this.wallet.sign(a.call, {
          operationId: id2,
          attempt: o.attempts.length - 1,
          identity: { network: this.policy.network, accountId: o.payer },
          authorize: () => {
            check();
            authorize?.();
          },
          ...this.guards.beforeDispatch ? { beforeDispatch: async () => {
            check();
            authorize?.();
            if (dispatched) throw new Error("Dispatch authorization was already used");
            dispatched = true;
            await this.guards.beforeDispatch(o, review);
            check();
            authorize?.();
          } } : {}
        });
        if (this.guards.beforeDispatch && !dispatched) throw new Error("Wallet adapter omitted dispatch authorization");
        if (tx) {
          a.transaction = transactionRef(tx);
          if (a.transaction.signer !== o.payer)
            throw new Error("Wallet returned a different signer");
          a.state = "submitted";
        } else a.state = "uncertain";
        await persist();
      } catch (error) {
        a.state = "uncertain";
        await persist();
        throw error;
      }
      return { state: a.state, transaction: a.transaction };
    });
  }
  async reconcile(id2, transaction) {
    return this.journal.update(async (operations, persist) => {
      const o = this.operation(operations, id2), a = o.attempts.at(-1), tx = transactionRef(transaction);
      await this.trusted();
      if (!a || !["signing", "submitted", "uncertain"].includes(a.state) || tx.signer !== o.payer)
        throw new Error("No matching uncertain attempt");
      if (a.transaction && a.transaction.hash !== tx.hash)
        throw new Error("An existing transaction hash cannot be replaced");
      const checked = await this.gateway.verify(tx, a.call);
      if (checked.status !== "final")
        throw new Error("Transaction is not final; try again later");
      if (checked.transaction.hash !== tx.hash || checked.transaction.signer !== tx.signer)
        throw new Error("Transaction verification mismatch");
      a.transaction = tx;
      a.state = checked.effect === "accepted" ? "confirmed" : checked.effect === "not-accepted" ? "not-accepted" : "uncertain";
      await persist();
      return a.state;
    });
  }
};

// sdk/client/poseidon-constants.ts
var parameters = {
  "2": {
    "C": [
      "0x0ee9a592ba9a9518d05986d656f40c2114c4993c11bb29938d21d47304cd8e6e",
      "0x00f1445235f2148c5986587169fc1bcd887b08d4d00868df5696fff40956e864",
      "0x08dff3487e8ac99e1f29a058d0fa80b930c728730b7ab36ce879f3890ecf73f5",
      "0x2f27be690fdaee46c3ce28f7532b13c856c35342c84bda6e20966310fadc01d0",
      "0x2b2ae1acf68b7b8d2416bebf3d4f6234b763fe04b8043ee48b8327bebca16cf2",
      "0x0319d062072bef7ecca5eac06f97d4d55952c175ab6b03eae64b44c7dbf11cfa",
      "0x28813dcaebaeaa828a376df87af4a63bc8b7bf27ad49c6298ef7b387bf28526d",
      "0x2727673b2ccbc903f181bf38e1c1d40d2033865200c352bc150928adddf9cb78",
      "0x234ec45ca27727c2e74abd2b2a1494cd6efbd43e340587d6b8fb9e31e65cc632",
      "0x15b52534031ae18f7f862cb2cf7cf760ab10a8150a337b1ccd99ff6e8797d428",
      "0x0dc8fad6d9e4b35f5ed9a3d186b79ce38e0e8a8d1b58b132d701d4eecf68d1f6",
      "0x1bcd95ffc211fbca600f705fad3fb567ea4eb378f62e1fec97805518a47e4d9c",
      "0x10520b0ab721cadfe9eff81b016fc34dc76da36c2578937817cb978d069de559",
      "0x1f6d48149b8e7f7d9b257d8ed5fbbaf42932498075fed0ace88a9eb81f5627f6",
      "0x1d9655f652309014d29e00ef35a2089bfff8dc1c816f0dc9ca34bdb5460c8705",
      "0x04df5a56ff95bcafb051f7b1cd43a99ba731ff67e47032058fe3d4185697cc7d",
      "0x0672d995f8fff640151b3d290cedaf148690a10a8c8424a7f6ec282b6e4be828",
      "0x099952b414884454b21200d7ffafdd5f0c9a9dcc06f2708e9fc1d8209b5c75b9",
      "0x052cba2255dfd00c7c483143ba8d469448e43586a9b4cd9183fd0e843a6b9fa6",
      "0x0b8badee690adb8eb0bd74712b7999af82de55707251ad7716077cb93c464ddc",
      "0x119b1590f13307af5a1ee651020c07c749c15d60683a8050b963d0a8e4b2bdd1",
      "0x03150b7cd6d5d17b2529d36be0f67b832c4acfc884ef4ee5ce15be0bfb4a8d09",
      "0x2cc6182c5e14546e3cf1951f173912355374efb83d80898abe69cb317c9ea565",
      "0x005032551e6378c450cfe129a404b3764218cadedac14e2b92d2cd73111bf0f9",
      "0x233237e3289baa34bb147e972ebcb9516469c399fcc069fb88f9da2cc28276b5",
      "0x05c8f4f4ebd4a6e3c980d31674bfbe6323037f21b34ae5a4e80c2d4c24d60280",
      "0x0a7b1db13042d396ba05d818a319f25252bcf35ef3aeed91ee1f09b2590fc65b",
      "0x2a73b71f9b210cf5b14296572c9d32dbf156e2b086ff47dc5df542365a404ec0",
      "0x1ac9b0417abcc9a1935107e9ffc91dc3ec18f2c4dbe7f22976a760bb5c50c460",
      "0x12c0339ae08374823fabb076707ef479269f3e4d6cb104349015ee046dc93fc0",
      "0x0b7475b102a165ad7f5b18db4e1e704f52900aa3253baac68246682e56e9a28e",
      "0x037c2849e191ca3edb1c5e49f6e8b8917c843e379366f2ea32ab3aa88d7f8448",
      "0x05a6811f8556f014e92674661e217e9bd5206c5c93a07dc145fdb176a716346f",
      "0x29a795e7d98028946e947b75d54e9f044076e87a7b2883b47b675ef5f38bd66e",
      "0x20439a0c84b322eb45a3857afc18f5826e8c7382c8a1585c507be199981fd22f",
      "0x2e0ba8d94d9ecf4a94ec2050c7371ff1bb50f27799a84b6d4a2a6f2a0982c887",
      "0x143fd115ce08fb27ca38eb7cce822b4517822cd2109048d2e6d0ddcca17d71c8",
      "0x0c64cbecb1c734b857968dbbdcf813cdf8611659323dbcbfc84323623be9caf1",
      "0x028a305847c683f646fca925c163ff5ae74f348d62c2b670f1426cef9403da53",
      "0x2e4ef510ff0b6fda5fa940ab4c4380f26a6bcb64d89427b824d6755b5db9e30c",
      "0x0081c95bc43384e663d79270c956ce3b8925b4f6d033b078b96384f50579400e",
      "0x2ed5f0c91cbd9749187e2fade687e05ee2491b349c039a0bba8a9f4023a0bb38",
      "0x30509991f88da3504bbf374ed5aae2f03448a22c76234c8c990f01f33a735206",
      "0x1c3f20fd55409a53221b7c4d49a356b9f0a1119fb2067b41a7529094424ec6ad",
      "0x10b4e7f3ab5df003049514459b6e18eec46bb2213e8e131e170887b47ddcb96c",
      "0x2a1982979c3ff7f43ddd543d891c2abddd80f804c077d775039aa3502e43adef",
      "0x1c74ee64f15e1db6feddbead56d6d55dba431ebc396c9af95cad0f1315bd5c91",
      "0x07533ec850ba7f98eab9303cace01b4b9e4f2e8b82708cfa9c2fe45a0ae146a0",
      "0x21576b438e500449a151e4eeaf17b154285c68f42d42c1808a11abf3764c0750",
      "0x2f17c0559b8fe79608ad5ca193d62f10bce8384c815f0906743d6930836d4a9e",
      "0x2d477e3862d07708a79e8aae946170bc9775a4201318474ae665b0b1b7e2730e",
      "0x162f5243967064c390e095577984f291afba2266c38f5abcd89be0f5b2747eab",
      "0x2b4cb233ede9ba48264ecd2c8ae50d1ad7a8596a87f29f8a7777a70092393311",
      "0x2c8fbcb2dd8573dc1dbaf8f4622854776db2eece6d85c4cf4254e7c35e03b07a",
      "0x1d6f347725e4816af2ff453f0cd56b199e1b61e9f601e9ade5e88db870949da9",
      "0x204b0c397f4ebe71ebc2d8b3df5b913df9e6ac02b68d31324cd49af5c4565529",
      "0x0c4cb9dc3c4fd8174f1149b3c63c3c2f9ecb827cd7dc25534ff8fb75bc79c502",
      "0x174ad61a1448c899a25416474f4930301e5c49475279e0639a616ddc45bc7b54",
      "0x1a96177bcf4d8d89f759df4ec2f3cde2eaaa28c177cc0fa13a9816d49a38d2ef",
      "0x066d04b24331d71cd0ef8054bc60c4ff05202c126a233c1a8242ace360b8a30a",
      "0x2a4c4fc6ec0b0cf52195782871c6dd3b381cc65f72e02ad527037a62aa1bd804",
      "0x13ab2d136ccf37d447e9f2e14a7cedc95e727f8446f6d9d7e55afc01219fd649",
      "0x1121552fca26061619d24d843dc82769c1b04fcec26f55194c2e3e869acc6a9a",
      "0x00ef653322b13d6c889bc81715c37d77a6cd267d595c4a8909a5546c7c97cff1",
      "0x0e25483e45a665208b261d8ba74051e6400c776d652595d9845aca35d8a397d3",
      "0x29f536dcb9dd7682245264659e15d88e395ac3d4dde92d8c46448db979eeba89",
      "0x2a56ef9f2c53febadfda33575dbdbd885a124e2780bbea170e456baace0fa5be",
      "0x1c8361c78eb5cf5decfb7a2d17b5c409f2ae2999a46762e8ee416240a8cb9af1",
      "0x151aff5f38b20a0fc0473089aaf0206b83e8e68a764507bfd3d0ab4be74319c5",
      "0x04c6187e41ed881dc1b239c88f7f9d43a9f52fc8c8b6cdd1e76e47615b51f100",
      "0x13b37bd80f4d27fb10d84331f6fb6d534b81c61ed15776449e801b7ddc9c2967",
      "0x01a5c536273c2d9df578bfbd32c17b7a2ce3664c2a52032c9321ceb1c4e8a8e4",
      "0x2ab3561834ca73835ad05f5d7acb950b4a9a2c666b9726da832239065b7c3b02",
      "0x1d4d8ec291e720db200fe6d686c0d613acaf6af4e95d3bf69f7ed516a597b646",
      "0x041294d2cc484d228f5784fe7919fd2bb925351240a04b711514c9c80b65af1d",
      "0x154ac98e01708c611c4fa715991f004898f57939d126e392042971dd90e81fc6",
      "0x0b339d8acca7d4f83eedd84093aef51050b3684c88f8b0b04524563bc6ea4da4",
      "0x0955e49e6610c94254a4f84cfbab344598f0e71eaff4a7dd81ed95b50839c82e",
      "0x06746a6156eba54426b9e22206f15abca9a6f41e6f535c6f3525401ea0654626",
      "0x0f18f5a0ecd1423c496f3820c549c27838e5790e2bd0a196ac917c7ff32077fb",
      "0x04f6eeca1751f7308ac59eff5beb261e4bb563583ede7bc92a738223d6f76e13",
      "0x2b56973364c4c4f5c1a3ec4da3cdce038811eb116fb3e45bc1768d26fc0b3758",
      "0x123769dd49d5b054dcd76b89804b1bcb8e1392b385716a5d83feb65d437f29ef",
      "0x2147b424fc48c80a88ee52b91169aacea989f6446471150994257b2fb01c63e9",
      "0x0fdc1f58548b85701a6c5505ea332a29647e6f34ad4243c2ea54ad897cebe54d",
      "0x12373a8251fea004df68abcf0f7786d4bceff28c5dbbe0c3944f685cc0a0b1f2",
      "0x21e4f4ea5f35f85bad7ea52ff742c9e8a642756b6af44203dd8a1f35c1a90035",
      "0x16243916d69d2ca3dfb4722224d4c462b57366492f45e90d8a81934f1bc3b147",
      "0x1efbe46dd7a578b4f66f9adbc88b4378abc21566e1a0453ca13a4159cac04ac2",
      "0x07ea5e8537cf5dd08886020e23a7f387d468d5525be66f853b672cc96a88969a",
      "0x05a8c4f9968b8aa3b7b478a30f9a5b63650f19a75e7ce11ca9fe16c0b76c00bc",
      "0x20f057712cc21654fbfe59bd345e8dac3f7818c701b9c7882d9d57b72a32e83f",
      "0x04a12ededa9dfd689672f8c67fee31636dcd8e88d01d49019bd90b33eb33db69",
      "0x27e88d8c15f37dcee44f1e5425a51decbd136ce5091a6767e49ec9544ccd101a",
      "0x2feed17b84285ed9b8a5c8c5e95a41f66e096619a7703223176c41ee433de4d1",
      "0x1ed7cc76edf45c7c404241420f729cf394e5942911312a0d6972b8bd53aff2b8",
      "0x15742e99b9bfa323157ff8c586f5660eac6783476144cdcadf2874be45466b1a",
      "0x1aac285387f65e82c895fc6887ddf40577107454c6ec0317284f033f27d0c785",
      "0x25851c3c845d4790f9ddadbdb6057357832e2e7a49775f71ec75a96554d67c77",
      "0x15a5821565cc2ec2ce78457db197edf353b7ebba2c5523370ddccc3d9f146a67",
      "0x2411d57a4813b9980efa7e31a1db5966dcf64f36044277502f15485f28c71727",
      "0x002e6f8d6520cd4713e335b8c0b6d2e647e9a98e12f4cd2558828b5ef6cb4c9b",
      "0x2ff7bc8f4380cde997da00b616b0fcd1af8f0e91e2fe1ed7398834609e0315d2",
      "0x00b9831b948525595ee02724471bcd182e9521f6b7bb68f1e93be4febb0d3cbe",
      "0x0a2f53768b8ebf6a86913b0e57c04e011ca408648a4743a87d77adbf0c9c3512",
      "0x00248156142fd0373a479f91ff239e960f599ff7e94be69b7f2a290305e1198d",
      "0x171d5620b87bfb1328cf8c02ab3f0c9a397196aa6a542c2350eb512a2b2bcda9",
      "0x170a4f55536f7dc970087c7c10d6fad760c952172dd54dd99d1045e4ec34a808",
      "0x29aba33f799fe66c2ef3134aea04336ecc37e38c1cd211ba482eca17e2dbfae1",
      "0x1e9bc179a4fdd758fdd1bb1945088d47e70d114a03f6a0e8b5ba650369e64973",
      "0x1dd269799b660fad58f7f4892dfb0b5afeaad869a9c4b44f9c9e1c43bdaf8f09",
      "0x22cdbc8b70117ad1401181d02e15459e7ccd426fe869c7c95d1dd2cb0f24af38",
      "0x0ef042e454771c533a9f57a55c503fcefd3150f52ed94a7cd5ba93b9c7dacefd",
      "0x11609e06ad6c8fe2f287f3036037e8851318e8b08a0359a03b304ffca62e8284",
      "0x1166d9e554616dba9e753eea427c17b7fecd58c076dfe42708b08f5b783aa9af",
      "0x2de52989431a859593413026354413db177fbf4cd2ac0b56f855a888357ee466",
      "0x3006eb4ffc7a85819a6da492f3a8ac1df51aee5b17b8e89d74bf01cf5f71e9ad",
      "0x2af41fbb61ba8a80fdcf6fff9e3f6f422993fe8f0a4639f962344c8225145086",
      "0x119e684de476155fe5a6b41a8ebc85db8718ab27889e85e781b214bace4827c3",
      "0x1835b786e2e8925e188bea59ae363537b51248c23828f047cff784b97b3fd800",
      "0x28201a34c594dfa34d794996c6433a20d152bac2a7905c926c40e285ab32eeb6",
      "0x083efd7a27d1751094e80fefaf78b000864c82eb571187724a761f88c22cc4e7",
      "0x0b6f88a3577199526158e61ceea27be811c16df7774dd8519e079564f61fd13b",
      "0x0ec868e6d15e51d9644f66e1d6471a94589511ca00d29e1014390e6ee4254f5b",
      "0x2af33e3f866771271ac0c9b3ed2e1142ecd3e74b939cd40d00d937ab84c98591",
      "0x0b520211f904b5e7d09b5d961c6ace7734568c547dd6858b364ce5e47951f178",
      "0x0b2d722d0919a1aad8db58f10062a92ea0c56ac4270e822cca228620188a1d40",
      "0x1f790d4d7f8cf094d980ceb37c2453e957b54a9991ca38bbe0061d1ed6e562d4",
      "0x0171eb95dfbf7d1eaea97cd385f780150885c16235a2a6a8da92ceb01e504233",
      "0x0c2d0e3b5fd57549329bf6885da66b9b790b40defd2c8650762305381b168873",
      "0x1162fb28689c27154e5a8228b4e72b377cbcafa589e283c35d3803054407a18d",
      "0x2f1459b65dee441b64ad386a91e8310f282c5a92a89e19921623ef8249711bc0",
      "0x1e6ff3216b688c3d996d74367d5cd4c1bc489d46754eb712c243f70d1b53cfbb",
      "0x01ca8be73832b8d0681487d27d157802d741a6f36cdc2a0576881f9326478875",
      "0x1f7735706ffe9fc586f976d5bdf223dc680286080b10cea00b9b5de315f9650e",
      "0x2522b60f4ea3307640a0c2dce041fba921ac10a3d5f096ef4745ca838285f019",
      "0x23f0bee001b1029d5255075ddc957f833418cad4f52b6c3f8ce16c235572575b",
      "0x2bc1ae8b8ddbb81fcaac2d44555ed5685d142633e9df905f66d9401093082d59",
      "0x0f9406b8296564a37304507b8dba3ed162371273a07b1fc98011fcd6ad72205f",
      "0x2360a8eb0cc7defa67b72998de90714e17e75b174a52ee4acb126c8cd995f0a8",
      "0x15871a5cddead976804c803cbaef255eb4815a5e96df8b006dcbbc2767f88948",
      "0x193a56766998ee9e0a8652dd2f3b1da0362f4f54f72379544f957ccdeefb420f",
      "0x2a394a43934f86982f9be56ff4fab1703b2e63c8ad334834e4309805e777ae0f",
      "0x1859954cfeb8695f3e8b635dcb345192892cd11223443ba7b4166e8876c0d142",
      "0x04e1181763050e58013444dbcb99f1902b11bc25d90bbdca408d3819f4fed32b",
      "0x0fdb253dee83869d40c335ea64de8c5bb10eb82db08b5e8b1f5e5552bfd05f23",
      "0x058cbe8a9a5027bdaa4efb623adead6275f08686f1c08984a9d7c5bae9b4f1c0",
      "0x1382edce9971e186497eadb1aeb1f52b23b4b83bef023ab0d15228b4cceca59a",
      "0x03464990f045c6ee0819ca51fd11b0be7f61b8eb99f14b77e1e6634601d9e8b5",
      "0x23f7bfc8720dc296fff33b41f98ff83c6fcab4605db2eb5aaa5bc137aeb70a58",
      "0x0a59a158e3eec2117e6e94e7f0e9decf18c3ffd5e1531a9219636158bbaf62f2",
      "0x06ec54c80381c052b58bf23b312ffd3ce2c4eba065420af8f4c23ed0075fd07b",
      "0x118872dc832e0eb5476b56648e867ec8b09340f7a7bcb1b4962f0ff9ed1f9d01",
      "0x13d69fa127d834165ad5c7cba7ad59ed52e0b0f0e42d7fea95e1906b520921b1",
      "0x169a177f63ea681270b1c6877a73d21bde143942fb71dc55fd8a49f19f10c77b",
      "0x04ef51591c6ead97ef42f287adce40d93abeb032b922f66ffb7e9a5a7450544d",
      "0x256e175a1dc079390ecd7ca703fb2e3b19ec61805d4f03ced5f45ee6dd0f69ec",
      "0x30102d28636abd5fe5f2af412ff6004f75cc360d3205dd2da002813d3e2ceeb2",
      "0x10998e42dfcd3bbf1c0714bc73eb1bf40443a3fa99bef4a31fd31be182fcc792",
      "0x193edd8e9fcf3d7625fa7d24b598a1d89f3362eaf4d582efecad76f879e36860",
      "0x18168afd34f2d915d0368ce80b7b3347d1c7a561ce611425f2664d7aa51f0b5d",
      "0x29383c01ebd3b6ab0c017656ebe658b6a328ec77bc33626e29e2e95b33ea6111",
      "0x10646d2f2603de39a1f4ae5e7771a64a702db6e86fb76ab600bf573f9010c711",
      "0x0beb5e07d1b27145f575f1395a55bf132f90c25b40da7b3864d0242dcb1117fb",
      "0x16d685252078c133dc0d3ecad62b5c8830f95bb2e54b59abdffbf018d96fa336",
      "0x0a6abd1d833938f33c74154e0404b4b40a555bbbec21ddfafd672dd62047f01a",
      "0x1a679f5d36eb7b5c8ea12a4c2dedc8feb12dffeec450317270a6f19b34cf1860",
      "0x0980fb233bd456c23974d50e0ebfde4726a423eada4e8f6ffbc7592e3f1b93d6",
      "0x161b42232e61b84cbf1810af93a38fc0cece3d5628c9282003ebacb5c312c72b",
      "0x0ada10a90c7f0520950f7d47a60d5e6a493f09787f1564e5d09203db47de1a0b",
      "0x1a730d372310ba82320345a29ac4238ed3f07a8a2b4e121bb50ddb9af407f451",
      "0x2c8120f268ef054f817064c369dda7ea908377feaba5c4dffbda10ef58e8c556",
      "0x1c7c8824f758753fa57c00789c684217b930e95313bcb73e6e7b8649a4968f70",
      "0x2cd9ed31f5f8691c8e39e4077a74faa0f400ad8b491eb3f7b47b27fa3fd1cf77",
      "0x23ff4f9d46813457cf60d92f57618399a5e022ac321ca550854ae23918a22eea",
      "0x09945a5d147a4f66ceece6405dddd9d0af5a2c5103529407dff1ea58f180426d",
      "0x188d9c528025d4c2b67660c6b771b90f7c7da6eaa29d3f268a6dd223ec6fc630",
      "0x3050e37996596b7f81f68311431d8734dba7d926d3633595e0c0d8ddf4f0f47f",
      "0x15af1169396830a91600ca8102c35c426ceae5461e3f95d89d829518d30afd78",
      "0x1da6d09885432ea9a06d9f37f873d985dae933e351466b2904284da3320d8acc",
      "0x2796ea90d269af29f5f8acf33921124e4e4fad3dbe658945e546ee411ddaa9cb",
      "0x202d7dd1da0f6b4b0325c8b3307742f01e15612ec8e9304a7cb0319e01d32d60",
      "0x096d6790d05bb759156a952ba263d672a2d7f9c788f4c831a29dace4c0f8be5f",
      "0x054efa1f65b0fce283808965275d877b438da23ce5b13e1963798cb1447d25a4",
      "0x1b162f83d917e93edb3308c29802deb9d8aa690113b2e14864ccf6e18e4165f1",
      "0x21e5241e12564dd6fd9f1cdd2a0de39eedfefc1466cc568ec5ceb745a0506edc",
      "0x1cfb5662e8cf5ac9226a80ee17b36abecb73ab5f87e161927b4349e10e4bdf08",
      "0x0f21177e302a771bbae6d8d1ecb373b62c99af346220ac0129c53f666eb24100",
      "0x1671522374606992affb0dd7f71b12bec4236aede6290546bcef7e1f515c2320",
      "0x0fa3ec5b9488259c2eb4cf24501bfad9be2ec9e42c5cc8ccd419d2a692cad870",
      "0x193c0e04e0bd298357cb266c1506080ed36edce85c648cc085e8c57b1ab54bba",
      "0x102adf8ef74735a27e9128306dcbc3c99f6f7291cd406578ce14ea2adaba68f8",
      "0x0fe0af7858e49859e2a54d6f1ad945b1316aa24bfbdd23ae40a6d0cb70c3eab1",
      "0x216f6717bbc7dedb08536a2220843f4e2da5f1daa9ebdefde8a5ea7344798d22",
      "0x1da55cc900f0d21f4a3e694391918a1b3c23b2ac773c6b3ef88e2e4228325161"
    ],
    "M": [
      [
        "0x109b7f411ba0e4c9b2b70caf5c36a7b194be7c11ad24378bfedb68592ba8118b",
        "0x16ed41e13bb9c0c66ae119424fddbcbc9314dc9fdbdeea55d6c64543dc4903e0",
        "0x2b90bba00fca0589f617e7dcbfe82e0df706ab640ceb247b791a93b74e36736d"
      ],
      [
        "0x2969f27eed31a480b9c36c764379dbca2cc8fdd1415c3dded62940bcde0bd771",
        "0x2e2419f9ec02ec394c9871c832963dc1b89d743c8c7b964029b2311687b1fe23",
        "0x101071f0032379b697315876690f053d148d4e109f5fb065c8aacc55a0f89bfa"
      ],
      [
        "0x143021ec686a3f330d5f9e654638065ce6cd79e28c5b3753326244ee65a1b1a7",
        "0x176cc029695ad02582a70eff08a6fd99d057e12e58e7d7b6b16cdfabc8ee2911",
        "0x19a3fc0a56702bf417ba7fee3802593fa644470307043f7773279cd71d25d5e0"
      ]
    ]
  },
  "3": {
    "C": [
      "0x19b849f69450b06848da1d39bd5e4a4302bb86744edc26238b0878e269ed23e5",
      "0x265ddfe127dd51bd7239347b758f0a1320eb2cc7450acc1dad47f80c8dcf34d6",
      "0x199750ec472f1809e0f66a545e1e51624108ac845015c2aa3dfc36bab497d8aa",
      "0x157ff3fe65ac7208110f06a5f74302b14d743ea25067f0ffd032f787c7f1cdf8",
      "0x2e49c43c4569dd9c5fd35ac45fca33f10b15c590692f8beefe18f4896ac94902",
      "0x0e35fb89981890520d4aef2b6d6506c3cb2f0b6973c24fa82731345ffa2d1f1e",
      "0x251ad47cb15c4f1105f109ae5e944f1ba9d9e7806d667ffec6fe723002e0b996",
      "0x13da07dc64d428369873e97160234641f8beb56fdd05e5f3563fa39d9c22df4e",
      "0x0c009b84e650e6d23dc00c7dccef7483a553939689d350cd46e7b89055fd4738",
      "0x011f16b1c63a854f01992e3956f42d8b04eb650c6d535eb0203dec74befdca06",
      "0x0ed69e5e383a688f209d9a561daa79612f3f78d0467ad45485df07093f367549",
      "0x04dba94a7b0ce9e221acad41472b6bbe3aec507f5eb3d33f463672264c9f789b",
      "0x0a3f2637d840f3a16eb094271c9d237b6036757d4bb50bf7ce732ff1d4fa28e8",
      "0x259a666f129eea198f8a1c502fdb38fa39b1f075569564b6e54a485d1182323f",
      "0x28bf7459c9b2f4c6d8e7d06a4ee3a47f7745d4271038e5157a32fdf7ede0d6a1",
      "0x0a1ca941f057037526ea200f489be8d4c37c85bbcce6a2aeec91bd6941432447",
      "0x0c6f8f958be0e93053d7fd4fc54512855535ed1539f051dcb43a26fd926361cf",
      "0x123106a93cd17578d426e8128ac9d90aa9e8a00708e296e084dd57e69caaf811",
      "0x26e1ba52ad9285d97dd3ab52f8e840085e8fa83ff1e8f1877b074867cd2dee75",
      "0x1cb55cad7bd133de18a64c5c47b9c97cbe4d8b7bf9e095864471537e6a4ae2c5",
      "0x1dcd73e46acd8f8e0e2c7ce04bde7f6d2a53043d5060a41c7143f08e6e9055d0",
      "0x011003e32f6d9c66f5852f05474a4def0cda294a0eb4e9b9b12b9bb4512e5574",
      "0x2b1e809ac1d10ab29ad5f20d03a57dfebadfe5903f58bafed7c508dd2287ae8c",
      "0x2539de1785b735999fb4dac35ee17ed0ef995d05ab2fc5faeaa69ae87bcec0a5",
      "0x0c246c5a2ef8ee0126497f222b3e0a0ef4e1c3d41c86d46e43982cb11d77951d",
      "0x192089c4974f68e95408148f7c0632edbb09e6a6ad1a1c2f3f0305f5d03b527b",
      "0x1eae0ad8ab68b2f06a0ee36eeb0d0c058529097d91096b756d8fdc2fb5a60d85",
      "0x179190e5d0e22179e46f8282872abc88db6e2fdc0dee99e69768bd98c5d06bfb",
      "0x29bb9e2c9076732576e9a81c7ac4b83214528f7db00f31bf6cafe794a9b3cd1c",
      "0x225d394e42207599403efd0c2464a90d52652645882aac35b10e590e6e691e08",
      "0x064760623c25c8cf753d238055b444532be13557451c087de09efd454b23fd59",
      "0x10ba3a0e01df92e87f301c4b716d8a394d67f4bf42a75c10922910a78f6b5b87",
      "0x0e070bf53f8451b24f9c6e96b0c2a801cb511bc0c242eb9d361b77693f21471c",
      "0x1b94cd61b051b04dd39755ff93821a73ccd6cb11d2491d8aa7f921014de252fb",
      "0x1d7cb39bafb8c744e148787a2e70230f9d4e917d5713bb050487b5aa7d74070b",
      "0x2ec93189bd1ab4f69117d0fe980c80ff8785c2961829f701bb74ac1f303b17db",
      "0x2db366bfdd36d277a692bb825b86275beac404a19ae07a9082ea46bd83517926",
      "0x062100eb485db06269655cf186a68532985275428450359adc99cec6960711b8",
      "0x0761d33c66614aaa570e7f1e8244ca1120243f92fa59e4f900c567bf41f5a59b",
      "0x20fc411a114d13992c2705aa034e3f315d78608a0f7de4ccf7a72e494855ad0d",
      "0x25b5c004a4bdfcb5add9ec4e9ab219ba102c67e8b3effb5fc3a30f317250bc5a",
      "0x23b1822d278ed632a494e58f6df6f5ed038b186d8474155ad87e7dff62b37f4b",
      "0x22734b4c5c3f9493606c4ba9012499bf0f14d13bfcfcccaa16102a29cc2f69e0",
      "0x26c0c8fe09eb30b7e27a74dc33492347e5bdff409aa3610254413d3fad795ce5",
      "0x070dd0ccb6bd7bbae88eac03fa1fbb26196be3083a809829bbd626df348ccad9",
      "0x12b6595bdb329b6fb043ba78bb28c3bec2c0a6de46d8c5ad6067c4ebfd4250da",
      "0x248d97d7f76283d63bec30e7a5876c11c06fca9b275c671c5e33d95bb7e8d729",
      "0x1a306d439d463b0816fc6fd64cc939318b45eb759ddde4aa106d15d9bd9baaaa",
      "0x28a8f8372e3c38daced7c00421cb4621f4f1b54ddc27821b0d62d3d6ec7c56cf",
      "0x0094975717f9a8a8bb35152f24d43294071ce320c829f388bc852183e1e2ce7e",
      "0x04d5ee4c3aa78f7d80fde60d716480d3593f74d4f653ae83f4103246db2e8d65",
      "0x2a6cf5e9aa03d4336349ad6fb8ed2269c7bef54b8822cc76d08495c12efde187",
      "0x2304d31eaab960ba9274da43e19ddeb7f792180808fd6e43baae48d7efcba3f3",
      "0x03fd9ac865a4b2a6d5e7009785817249bff08a7e0726fcb4e1c11d39d199f0b0",
      "0x00b7258ded52bbda2248404d55ee5044798afc3a209193073f7954d4d63b0b64",
      "0x159f81ada0771799ec38fca2d4bf65ebb13d3a74f3298db36272c5ca65e92d9a",
      "0x1ef90e67437fbc8550237a75bc28e3bb9000130ea25f0c5471e144cf4264431f",
      "0x1e65f838515e5ff0196b49aa41a2d2568df739bc176b08ec95a79ed82932e30d",
      "0x2b1b045def3a166cec6ce768d079ba74b18c844e570e1f826575c1068c94c33f",
      "0x0832e5753ceb0ff6402543b1109229c165dc2d73bef715e3f1c6e07c168bb173",
      "0x02f614e9cedfb3dc6b762ae0a37d41bab1b841c2e8b6451bc5a8e3c390b6ad16",
      "0x0e2427d38bd46a60dd640b8e362cad967370ebb777bedff40f6a0be27e7ed705",
      "0x0493630b7c670b6deb7c84d414e7ce79049f0ec098c3c7c50768bbe29214a53a",
      "0x22ead100e8e482674decdab17066c5a26bb1515355d5461a3dc06cc85327cea9",
      "0x25b3e56e655b42cdaae2626ed2554d48583f1ae35626d04de5084e0b6d2a6f16",
      "0x1e32752ada8836ef5837a6cde8ff13dbb599c336349e4c584b4fdc0a0cf6f9d0",
      "0x2fa2a871c15a387cc50f68f6f3c3455b23c00995f05078f672a9864074d412e5",
      "0x2f569b8a9a4424c9278e1db7311e889f54ccbf10661bab7fcd18e7c7a7d83505",
      "0x044cb455110a8fdd531ade530234c518a7df93f7332ffd2144165374b246b43d",
      "0x227808de93906d5d420246157f2e42b191fe8c90adfe118178ddc723a5319025",
      "0x02fcca2934e046bc623adead873579865d03781ae090ad4a8579d2e7a6800355",
      "0x0ef915f0ac120b876abccceb344a1d36bad3f3c5ab91a8ddcbec2e060d8befac",
      "0x1797130f4b7a3e1777eb757bc6f287f6ab0fb85f6be63b09f3b16ef2b1405d38",
      "0x0a76225dc04170ae3306c85abab59e608c7f497c20156d4d36c668555decc6e5",
      "0x1fffb9ec1992d66ba1e77a7b93209af6f8fa76d48acb664796174b5326a31a5c",
      "0x25721c4fc15a3f2853b57c338fa538d85f8fbba6c6b9c6090611889b797b9c5f",
      "0x0c817fd42d5f7a41215e3d07ba197216adb4c3790705da95eb63b982bfcaf75a",
      "0x13abe3f5239915d39f7e13c2c24970b6df8cf86ce00a22002bc15866e52b5a96",
      "0x2106feea546224ea12ef7f39987a46c85c1bc3dc29bdbd7a92cd60acb4d391ce",
      "0x21ca859468a746b6aaa79474a37dab49f1ca5a28c748bc7157e1b3345bb0f959",
      "0x05ccd6255c1e6f0c5cf1f0df934194c62911d14d0321662a8f1a48999e34185b",
      "0x0f0e34a64b70a626e464d846674c4c8816c4fb267fe44fe6ea28678cb09490a4",
      "0x0558531a4e25470c6157794ca36d0e9647dbfcfe350d64838f5b1a8a2de0d4bf",
      "0x09d3dca9173ed2faceea125157683d18924cadad3f655a60b72f5864961f1455",
      "0x0328cbd54e8c0913493f866ed03d218bf23f92d68aaec48617d4c722e5bd4335",
      "0x2bf07216e2aff0a223a487b1a7094e07e79e7bcc9798c648ee3347dd5329d34b",
      "0x1daf345a58006b736499c583cb76c316d6f78ed6a6dffc82111e11a63fe412df",
      "0x176563472456aaa746b694c60e1823611ef39039b2edc7ff391e6f2293d2c404",
      "0x2ef1e0fad9f08e87a3bb5e47d7e33538ca964d2b7d1083d4fb0225035bd3f8db",
      "0x226c9b1af95babcf17b2b1f57c7310179c1803dec5ae8f0a1779ed36c817ae2a",
      "0x14bce3549cc3db7428126b4c3a15ae0ff8148c89f13fb35d35734eb5d4ad0def",
      "0x2debff156e276bb5742c3373f2635b48b8e923d301f372f8e550cfd4034212c7",
      "0x2d4083cf5a87f5b6fc2395b22e356b6441afe1b6b29c47add7d0432d1d4760c7",
      "0x0c225b7bcd04bf9c34b911262fdc9c1b91bf79a10c0184d89c317c53d7161c29",
      "0x03152169d4f3d06ec33a79bfac91a02c99aa0200db66d5aa7b835265f9c9c8f3",
      "0x0b61811a9210be78b05974587486d58bddc8f51bfdfebbb87afe8b7aa7d3199c",
      "0x203e000cad298daaf7eba6a5c5921878b8ae48acf7048f16046d637a533b6f78",
      "0x1a44bf0937c722d1376672b69f6c9655ba7ee386fda1112c0757143d1bfa9146",
      "0x0376b4fae08cb03d3500afec1a1f56acb8e0fde75a2106d7002f59c5611d4daa",
      "0x00780af2ca1cad6465a2171250fdfc32d6fc241d3214177f3d553ef363182185",
      "0x10774d9ab80c25bdeb808bedfd72a8d9b75dbe18d5221c87e9d857079bdc31d5",
      "0x10dc6e9c006ea38b04b1e03b4bd9490c0d03f98929ca1d7fb56821fd19d3b6e8",
      "0x00544b8338791518b2c7645a50392798b21f75bb60e3596170067d00141cac16",
      "0x222c01175718386f2e2e82eb122789e352e105a3b8fa852613bc534433ee428c",
      "0x2840d045e9bc22b259cfb8811b1e0f45b77f7bdb7f7e2b46151a1430f608e3c5",
      "0x062752f86eebe11a009c937e468c335b04554574c2990196508e01fa5860186b",
      "0x06041bdac48205ac87adb87c20a478a71c9950c12a80bc0a55a8e83eaaf04746",
      "0x04a533f236c422d1ff900a368949b0022c7a2ae092f308d82b1dcbbf51f5000d",
      "0x13e31d7a67232fd811d6a955b3d4f25dfe066d1e7dc33df04bde50a2b2d05b2a",
      "0x011c2683ae91eb4dfbc13d6357e8599a9279d1648ff2c95d2f79905bb13920f1",
      "0x0b0d219346b8574525b1a270e0b4cba5d56c928e3e2c2bd0a1ecaed015aaf6ae",
      "0x14abdec8db9c6dc970291ee638690209b65080781ef9fd13d84c7a726b5f1364",
      "0x1a0b70b4b26fdc28fcd32aa3d266478801eb12202ef47ced988d0376610be106",
      "0x278543721f96d1307b6943f9804e7fe56401deb2ef99c4d12704882e7278b607",
      "0x16eb59494a9776cf57866214dbd1473f3f0738a325638d8ba36535e011d58259",
      "0x2567a658a81ffb444f240088fa5524c69a9e53eeab6b7f8c41c3479dcf8c644a",
      "0x29aa1d7c151e9ad0a7ab39f1abd9cf77ab78e0215a5715a6b882ade840bb13d8",
      "0x15c091233e60efe0d4bbfce2b36415006a4f017f9a85388ce206b91f99f2c984",
      "0x16bd7d22ff858e5e0882c2c999558d77e7673ad5f1915f9feb679a8115f014cf",
      "0x02db50480a07be0eb2c2e13ed6ef4074c0182d9b668b8e08ffe6769250042025",
      "0x05e4a220e6a3bc9f7b6806ec9d6cdba186330ef2bf7adb4c13ba866343b73119",
      "0x1dda05ebc30170bc98cbf2a5ee3b50e8b5f70bc424d39fa4104d37f1cbcf7a42",
      "0x0184bef721888187f645b6fee3667f3c91da214414d89ba5cd301f22b0de8990",
      "0x1498a307e68900065f5e8276f62aef1c37414b84494e1577ad1a6d64341b78ec",
      "0x25f40f82b31dacc4f4939800b9d2c3eacef737b8fab1f864fe33548ad46bd49d",
      "0x09d317cc670251943f6f5862a30d2ea9e83056ce4907bfbbcb1ff31ce5bb9650",
      "0x2f77d77786d979b23ba4ce4a4c1b3bd0a41132cd467a86ab29b913b6cf3149d0",
      "0x0f53dafd535a9f4473dc266b6fccc6841bbd336963f254c152f89e785f729bbf",
      "0x25c1fd72e223045265c3a099e17526fa0e6976e1c00baf16de96de85deef2fa2",
      "0x2a902c8980c17faae368d385d52d16be41af95c84eaea3cf893e65d6ce4a8f62",
      "0x1ce1580a3452ecf302878c8976b82be96676dd114d1dc8d25527405762f83529",
      "0x24a6073f91addc33a49a1fa306df008801c5ec569609034d2fc50f7f0f4d0056",
      "0x25e52dbd6124530d9fc27fe306d71d4583e07ca554b5d1577f256c68b0be2b74",
      "0x23dffae3c423fa7a93468dbccfb029855974be4d0a7b29946796e5b6cd70f15d",
      "0x06342da370cc0d8c49b77594f6b027c480615d50be36243a99591bc9924ed6f5",
      "0x2754114281286546b75f09f115fc751b4778303d0405c1b4cc7df0d8e9f63925",
      "0x15c19e8534c5c1a8862c2bc1d119eddeabf214153833d7bdb59ee197f8187cf5",
      "0x265fe062766d08fab4c78d0d9ef3cabe366f3be0a821061679b4b3d2d77d5f3e",
      "0x13ccf689d67a3ec9f22cb7cd0ac3a327d377ac5cd0146f048debfd098d3ec7be",
      "0x17662f7456789739f81cd3974827a887d92a5e05bdf3fe6b9fbccca4524aaebd",
      "0x21b29c76329b31c8ef18631e515f7f2f82ca6a5cca70cee4e809fd624be7ad5d",
      "0x18137478382aadba441eb97fe27901989c06738165215319939eb17b01fa975c",
      "0x2bc07ea2bfad68e8dc724f5fef2b37c2d34f761935ffd3b739ceec4668f37e88",
      "0x2ddb2e376f54d64a563840480df993feb4173203c2bd94ad0e602077aef9a03e",
      "0x277eb50f2baa706106b41cb24c602609e8a20f8d72f613708adb25373596c3f7",
      "0x0d4de47e1aba34269d0c620904f01a56b33fc4b450c0db50bb7f87734c9a1fe5",
      "0x0b8442bfe9e4a1b4428673b6bd3eea6f9f445697058f134aae908d0279a29f0c",
      "0x11fe5b18fbbea1a86e06930cb89f7d4a26e186a65945e96574247fddb720f8f5",
      "0x224026f6dfaf71e24d25d8f6d9f90021df5b774dcad4d883170e4ad89c33a0d6",
      "0x0b2ca6a999fe6887e0704dad58d03465a96bc9e37d1091f61bc9f9c62bbeb824",
      "0x221b63d66f0b45f9d40c54053a28a06b1d0a4ce41d364797a1a7e0c96529f421",
      "0x30185c48b7b2f1d53d4120801b047d087493bce64d4d24aedce2f4836bb84ad4",
      "0x23f5d372a3f0e3cba989e223056227d3533356f0faa48f27f8267318632a61f0",
      "0x2716683b32c755fd1bf8235ea162b1f388e1e0090d06162e8e6dfbe4328f3e3b",
      "0x0977545836866fa204ca1d853ec0909e3d140770c80ac67dc930c69748d5d4bc",
      "0x1444e8f592bdbfd8025d91ab4982dd425f51682d31472b05e81c43c0f9434b31",
      "0x26e04b65e9ca8270beb74a1c5cb8fee8be3ffbfe583f7012a00f874e7718fbe3",
      "0x22a5c2fa860d11fe34ee47a5cd9f869800f48f4febe29ad6df69816fb1a914d2",
      "0x174b54d9907d8f5c6afd672a738f42737ec338f3a0964c629f7474dd44c5c8d7",
      "0x1db1db8aa45283f31168fa66694cf2808d2189b87c8c8143d56c871907b39b87",
      "0x1530bf0f46527e889030b8c7b7dfde126f65faf8cce0ab66387341d813d1bfd1",
      "0x0b73f613993229f59f01c1cec8760e9936ead9edc8f2814889330a2f2bade457",
      "0x29c25a22fe2164604552aaea377f448d587ab977fc8227787bd2dc0f36bcf41e",
      "0x2b30d53ed1759bfb8503da66c92cf4077abe82795dc272b377df57d77c875526",
      "0x12f6d703b5702aab7b7b7e69359d53a2756c08c85ede7227cf5f0a2916787cd2",
      "0x2520e18300afda3f61a40a0b8837293a55ad01071028d4841ffa9ac706364113",
      "0x1ec9daea860971ecdda8ed4f346fa967ac9bc59278277393c68f09fa03b8b95f",
      "0x0a99b3e178db2e2e432f5cd5bef8fe4483bf5cbf70ed407c08aae24b830ad725",
      "0x07cda9e63db6e39f086b89b601c2bbe407ee0abac3c817a1317abad7c5778492",
      "0x08c9c65a4f955e8952d571b191bb0adb49bd8290963203b35d48aab38f8fc3a3",
      "0x2737f8ce1d5a67b349590ddbfbd709ed9af54a2a3f2719d33801c9c17bdd9c9e",
      "0x1049a6c65ff019f0d28770072798e8b7909432bd0c129813a9f179ba627f7d6a",
      "0x18b4fe968732c462c0ea5a9beb27cecbde8868944fdf64ee60a5122361daeddb",
      "0x2ff2b6fd22df49d2440b2eaeeefa8c02a6f478cfcf11f1b2a4f7473483885d19",
      "0x2ec5f2f1928fe932e56c789b8f6bbcb3e8be4057cbd8dbd18a1b352f5cef42ff",
      "0x265a5eccd8b92975e33ad9f75bf3426d424a4c6a7794ee3f08c1d100378e545e",
      "0x2405eaa4c0bde1129d6242bb5ada0e68778e656cfcb366bf20517da1dfd4279c",
      "0x094c97d8c194c42e88018004cbbf2bc5fdb51955d8b2d66b76dd98a2dbf60417",
      "0x2c30d5f33bb32c5c22b9979a605bf64d508b705221e6a686330c9625c2afe0b8",
      "0x01a75666f6241f6825d01cc6dcb1622d4886ea583e87299e6aa2fc716fdb6cf5",
      "0x0a3290e8398113ea4d12ac091e87be7c6d359ab9a66979fcf47bf2e87d382fcb",
      "0x154ade9ca36e268dfeb38461425bb0d8c31219d8fa0dfc75ecd21bf69aa0cc74",
      "0x27aa8d3e25380c0b1b172d79c6f22eee99231ef5dc69d8dc13a4b5095d028772",
      "0x2cf4051e6cab48301a8b2e3bca6099d756bbdf485afa1f549d395bbcbd806461",
      "0x301e70f729f3c94b1d3f517ddff9f2015131feab8afa5eebb0843d7f84b23e71",
      "0x298beb64f812d25d8b4d9620347ab02332dc4cef113ae60d17a8d7a4c91f83bc",
      "0x1b362e72a5f847f84d03fd291c3c471ed1c14a15b221680acf11a3f02e46aa95",
      "0x0dc8a2146110c0b375432902999223d5aa1ef6e78e1e5ebcbc1d9ba41dc1c737",
      "0x0a48663b34ce5e1c05dc93092cb69778cb21729a72ddc03a08afa1eb922ff279",
      "0x0a87391fb1cd8cdf6096b64a82f9e95f0fe46f143b702d74545bb314881098ee",
      "0x1b5b2946f7c28975f0512ff8e6ca362f8826edd7ea9c29f382ba8a2a0892fd5d",
      "0x01001cf512ac241d47ebe2239219bc6a173a8bbcb8a5b987b4eac1f533315b6b",
      "0x2fd977c70f645db4f704fa7d7693da727ac093d3fb5f5febc72beb17d8358a32",
      "0x23c0039a3fab4ad3c2d7cc688164f39e761d5355c05444d99be763a97793a9c4",
      "0x19d43ee0c6081c052c9c0df6161eaac1aec356cf435888e79f27f22ff03fa25d",
      "0x2d9b10c2f2e7ac1afddccffd94a563028bf29b646d020830919f9d5ca1cefe59",
      "0x2457ca6c2f2aa30ec47e4aff5a66f5ce2799283e166fc81cdae2f2b9f83e4267",
      "0x0abc392fe85eda855820592445094022811ee8676ed6f0c3044dfb54a7c10b35",
      "0x19d2cc5ca549d1d40cebcd37f3ea54f31161ac3993acf3101d2c2bc30eac1eb0",
      "0x0f97ae3033ffa01608aafb26ae13cd393ee0e4ec041ba644a3d3ab546e98c9c8",
      "0x16dbc78fd28b7fb8260e404cf1d427a7fa15537ea4e168e88a166496e88cfeca",
      "0x240faf28f11499b916f085f73bc4f22eef8344e576f8ad3d1827820366d5e07b",
      "0x0a1bb075aa37ff0cfe6c8531e55e1770eaba808c8fdb6dbf46f8cab58d9ef1af",
      "0x2e47e15ea4a47ff1a6a853aaf3a644ca38d5b085ac1042fdc4a705a7ce089f4d",
      "0x166e5bf073378348860ca4a9c09d39e1673ab059935f4df35fb14528375772b6",
      "0x18b42d7ffdd2ea4faf235902f057a2740cacccd027233001ed10f96538f0916f",
      "0x089cb1b032238f5e4914788e3e3c7ead4fc368020b3ed38221deab1051c37702",
      "0x242acd3eb3a2f72baf7c7076dd165adf89f9339c7b971921d9e70863451dd8d1",
      "0x174fbb104a4ee302bf47f2bd82fce896eac9a068283f326474af860457245c3b",
      "0x17340e71d96f466d61f3058ce092c67d2891fb2bb318613f780c275fe1116c6b",
      "0x1e8e40ac853b7d42f00f2e383982d024f098b9f8fd455953a2fd380c4df7f6b2",
      "0x0529898dc0649907e1d4d5e284b8d1075198c55cad66e8a9bf40f92938e2e961",
      "0x2162754db0baa030bf7de5bb797364dce8c77aa017ee1d7bf65f21c4d4e5df8f",
      "0x12c7553698c4bf6f3ceb250ae00c58c2a9f9291efbde4c8421bef44741752ec6",
      "0x292643e3ba2026affcb8c5279313bd51a733c93353e9d9c79cb723136526508e",
      "0x00ccf13e0cb6f9d81d52951bea990bd5b6c07c5d98e66ff71db6e74d5b87d158",
      "0x185d1e20e23b0917dd654128cf2f3aaab6723873cb30fc22b0f86c15ab645b4b",
      "0x14c61c836d55d3df742bdf11c60efa186778e3de0f024c0f13fe53f8d8764e1f",
      "0x0f356841b3f556fce5dbe4680457691c2919e2af53008184d03ee1195d72449e",
      "0x1b8fd9ff39714e075df124f887bf40b383143374fd2080ba0c0a6b6e8fa5b3e8",
      "0x0e86a8c2009c140ca3f873924e2aaa14fc3c8ae04e9df0b3e9103418796f6024",
      "0x2e6c5e898f5547770e5462ad932fcdd2373fc43820ca2b16b0861421e79155c8",
      "0x05d797f1ab3647237c14f9d1df032bc9ff9fe1a0ecd377972ce5fd5a0c014604",
      "0x29a3110463a5aae76c3d152875981d0c1daf2dcd65519ef5ca8929851da8c008",
      "0x2974da7bc074322273c3a4b91c05354cdc71640a8bbd1f864b732f8163883314",
      "0x1ed0fb06699ba249b2a30621c05eb12ca29cb91aa082c8bfcce9c522889b47dc",
      "0x1c793ef0dcc51123654ff26d8d863feeae29e8c572eca912d80c8ae36e40fe9b",
      "0x1e6aac1c6d3dd3157956257d3d234ef18c91e82589a78169fbb4a8770977dc2f",
      "0x1a20ada7576234eee6273dd6fa98b25ed037748080a47d948fcda33256fb6bf5",
      "0x191033d6d85ceaa6fc7a9a23a6fd9996642d772045ece51335d49306728af96c",
      "0x006e5979da7e7ef53a825aa6fddc3abfc76f200b3740b8b232ef481f5d06297b",
      "0x0b0d7e69c651910bbef3e68d417e9fa0fbd57f596c8f29831eff8c0174cdb06d",
      "0x25caf5b0c1b93bc516435ec084e2ecd44ac46dbbb033c5112c4b20a25c9cdf9d",
      "0x12c1ea892cc31e0d9af8b796d9645872f7f77442d62fd4c8085b2f150f72472a",
      "0x16af29695157aba9b8bbe3afeb245feee5a929d9f928b9b81de6dadc78c32aae",
      "0x0136df457c80588dd687fb2f3be18691705b87ec5a4cfdc168d31084256b67dc",
      "0x1639a28c5b4c81166aea984fba6e71479e07b1efbc74434db95a285060e7b089",
      "0x03d62fbf82fd1d4313f8e650f587ec06816c28b700bdc50f7e232bd9b5ca9b76",
      "0x11aeeb527dc8ce44b4d14aaddca3cfe2f77a1e40fc6da97c249830de1edfde54",
      "0x13f9b9a41274129479c5e6138c6c8ee36a670e6bc68c7a49642b645807bfc824",
      "0x0e4772fa3d75179dc8484cd26c7c1f635ddeeed7a939440c506cae8b7ebcd15b",
      "0x1b39a00cbc81e427de4bdec58febe8d8b5971752067a612b39fc46a68c5d4db4",
      "0x2bedb66e1ad5a1d571e16e2953f48731f66463c2eb54a245444d1c0a3a25707e",
      "0x2cf0a09a55ca93af8abd068f06a7287fb08b193b608582a27379ce35da915dec",
      "0x2d1bd78fa90e77aa88830cabfef2f8d27d1a512050ba7db0753c8fb863efb387",
      "0x065610c6f4f92491f423d3071eb83539f7c0d49c1387062e630d7fd283dc3394",
      "0x2d933ff19217a5545013b12873452bebcc5f9969033f15ec642fb464bd607368",
      "0x1aa9d3fe4c644910f76b92b3e13b30d500dae5354e79508c3c49c8aa99e0258b",
      "0x027ef04869e482b1c748638c59111c6b27095fa773e1aca078cea1f1c8450bdd",
      "0x2b7d524c5172cbbb15db4e00668a8c449f67a2605d9ec03802e3fa136ad0b8fb",
      "0x0c7c382443c6aa787c8718d86747c7f74693ae25b1e55df13f7c3c1dd735db0f",
      "0x00b4567186bc3f7c62a7b56acf4f76207a1f43c2d30d0fe4a627dcdd9bd79078",
      "0x1e41fc29b825454fe6d61737fe08b47fb07fe739e4c1e61d0337490883db4fd5",
      "0x12507cd556b7bbcc72ee6dafc616584421e1af872d8c0e89002ae8d3ba0653b6",
      "0x13d437083553006bcef312e5e6f52a5d97eb36617ef36fe4d77d3e97f71cb5db",
      "0x163ec73251f85443687222487dda9a65467d90b22f0b38664686077c6a4486d5"
    ],
    "M": [
      [
        "0x236d13393ef85cc48a351dd786dd7a1de5e39942296127fd87947223ae5108ad",
        "0x277686494f7644bbc4a9b194e10724eb967f1dc58718e59e3cedc821b2a7ae19",
        "0x023db68784e3f0cc0b85618826a9b3505129c16479973b0a84a4529e66b09c62",
        "0x1d359d245f286c12d50d663bae733f978af08cdbd63017c57b3a75646ff382c1"
      ],
      [
        "0x2a75a171563b807db525be259699ab28fe9bc7fb1f70943ff049bc970e841a0c",
        "0x083abff5e10051f078e2827d092e1ae808b4dd3e15ccc3706f38ce4157b6770e",
        "0x1a5ad71bbbecd8a97dc49cfdbae303ad24d5c4741eab8b7568a9ff8253a1eb6f",
        "0x0d745fd00dd167fb86772133640f02ce945004a7bc2c59e8790f725c5d84f0af"
      ],
      [
        "0x2070679e798782ef592a52ca9cef820d497ad2eecbaa7e42f366b3e521c4ed42",
        "0x2e18c8570d20bf5df800739a53da75d906ece318cd224ab6b3a2be979e2d7eab",
        "0x0fa86f0f27e4d3dd7f3367ce86f684f1f2e4386d3e5b9f38fa283c6aa723b608",
        "0x03f3e6fab791f16628168e4b14dbaeb657035ee3da6b2ca83f0c2491e0b403eb"
      ],
      [
        "0x2f545e578202c9732488540e41f783b68ff0613fd79375f8ba8b3d30958e7677",
        "0x23810bf82877fc19bff7eefeae3faf4bb8104c32ba4cd701596a15623d01476e",
        "0x014fcd5eb0be6d5beeafc4944034cf321c068ef930f10be2207ed58d2a34cdd6",
        "0x00c15fc3a1d5733dd835eae0823e377f8ba4a8b627627cc2bb661c25d20fb52a"
      ]
    ]
  }
};

// sdk/client/notes.ts
var FIELD2 = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
var FORMAT2 = "core-private-note";
function exact5(value2, fields) {
  if (Object.keys(value2).sort().join("|") !== [...fields].sort().join("|")) throw new Error("Unexpected private note fields");
}
var constants = Object.fromEntries([2, 3].map((n) => [n, { C: parameters[n].C.map(BigInt), M: parameters[n].M.map((row) => row.map(BigInt)) }]));
function noteHash(inputs) {
  if (inputs.length !== 2 && inputs.length !== 3) throw new Error("Poseidon supports two or three inputs");
  const n = inputs.length, { C, M } = constants[n], partial = n === 2 ? 57 : 56;
  let state = [0n, ...inputs.map((value2) => BigInt(scalar(value2)))];
  const pow5 = (x) => {
    const square = x * x % FIELD2;
    return square * square % FIELD2 * x % FIELD2;
  };
  for (let round = 0; round < 8 + partial; round++) {
    state = state.map((value2, i) => (value2 + C[round * (n + 1) + i]) % FIELD2);
    state = state.map((value2, i) => round < 4 || round >= partial + 4 || i === 0 ? pow5(value2) : value2);
    state = M.map((row) => row.reduce((sum, coefficient, i) => (sum + coefficient * state[i]) % FIELD2, 0n));
  }
  return state[0].toString();
}
async function noteDomain(input) {
  const policy = parsePolicy(input);
  feeQuote(policy);
  return shaField(`core:ft:v3|${policy.network}|${policy.registry}|${policy.tokenId}|${policy.denomination}`);
}
function randomField() {
  const bytes2 = crypto.getRandomValues(new Uint8Array(32));
  bytes2[0] &= 31;
  return BigInt("0x" + [...bytes2].map((b) => b.toString(16).padStart(2, "0")).join("")).toString();
}
async function createPrivateNote(policy) {
  const domain = await noteDomain(policy), secret = randomField(), nullifier = randomField();
  return { version: 1, domain, secret, nullifier, commitment: noteHash([secret, nullifier, domain]) };
}
async function validatePrivateNote(policy, raw) {
  const note = object(raw);
  exact5(note, ["version", "domain", "secret", "nullifier", "commitment"]);
  const domain = scalar(note.domain), secret = scalar(note.secret), nullifier = scalar(note.nullifier), commitment = scalar(note.commitment);
  if (note.version !== 1 || commitment === "0" || domain !== await noteDomain(policy) || commitment !== noteHash([secret, nullifier, domain])) throw new Error("Invalid note or different settlement group");
  return { version: 1, domain, secret, nullifier, commitment };
}
async function encryptNoteBackup(input, raw, password) {
  const policy = parsePolicy(input), note = await validatePrivateNote(policy, raw);
  return seal({ version: 1, policy, note }, password, FORMAT2);
}
async function openNoteBackup(envelope, password, expectedPolicy) {
  if (envelope.length > 16e3) throw new Error("Private note backup exceeds 16 KB");
  const expected = expectedPolicy === void 0 ? void 0 : parsePolicy(expectedPolicy);
  let decoded;
  try {
    decoded = await unseal(envelope, password, FORMAT2);
  } catch (error) {
    if (error && typeof error === "object" && "name" in error && error.name === "OperationError") throw new Error("Could not decrypt private note. Check the passphrase and backup integrity.");
    throw error;
  }
  const payload = object(decoded);
  exact5(payload, ["version", "policy", "note"]);
  const policy = parsePolicy(payload.policy);
  if (payload.version !== 1 || expected && canonical(policy) !== canonical(expected)) throw new Error("Backup differs from the trusted policy");
  return { policy, note: await validatePrivateNote(policy, payload.note) };
}

// sdk/client/prover.ts
var HASH = /^[a-f0-9]{64}$/;
var Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;
function exact6(o, keys) {
  if (Object.keys(o).sort().join("|") !== [...keys].sort().join("|")) throw new Error("Unexpected proving fields");
}
function hash2(value2) {
  if (typeof value2 !== "string" || !HASH.test(value2)) throw new Error("Invalid proving digest");
  return value2;
}
function block(input) {
  const b = object(input);
  exact6(b, ["hash", "height"]);
  if (typeof b.hash !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(b.hash) || !Number.isSafeInteger(b.height) || Number(b.height) < 0) throw new Error("Invalid finalized snapshot");
  return { hash: b.hash, height: b.height };
}
function ft(input) {
  const policy = parsePolicy(input);
  feeQuote(policy);
  if (!policy.tokenId) throw new Error("Browser proving requires a trusted FT group");
  return policy;
}
function vaultFor(policy, value2) {
  const vault2 = account(value2);
  if (!new RegExp(`^v[a-f0-9]{32}\\.${policy.registry.replaceAll(".", "\\.")}$`).test(vault2)) throw new Error("Vault must be a direct protocol child in the original group");
  return vault2;
}
function parseProvingAction(input, policy) {
  const a = object(input);
  exact6(a, ["recipient", "disclosureRoot"]);
  const recipient = account(a.recipient);
  if (recipient === policy.registry || recipient.endsWith("." + policy.registry)) throw new Error("Choose an external recipient");
  return { recipient, disclosureRoot: hash2(a.disclosureRoot) };
}
function parseProvingContext(input, expected) {
  const c = object(input);
  exact6(c, ["version", "policy", "checkedAtBlock", "root", "commitments", "vault"]);
  const policy = ft(c.policy);
  if (c.version !== 1 || canonical(policy) !== canonical(ft(expected))) throw new Error("Proving context differs from the trusted policy");
  if (!Array.isArray(c.commitments) || c.commitments.length < 1 || c.commitments.length > 256) throw new Error("Expected 1\u2013256 ordered commitments");
  const commitments = c.commitments.map(scalar);
  if (commitments.includes("0") || new Set(commitments).size !== commitments.length) throw new Error("Empty or duplicate commitment");
  return { version: 1, policy, root: scalar(c.root), commitments, vault: vaultFor(policy, c.vault), checkedAtBlock: block(c.checkedAtBlock) };
}
async function withdrawalContext(policy, vault2, action) {
  return shaField(`core:action:ft:v3|${await noteDomain(policy)}|withdraw|${vault2}|${action.recipient}|${action.disclosureRoot}`);
}
async function digest2(bytes2) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes2))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function read(blob, max) {
  if (!(blob instanceof Blob) || blob.size < 1 || blob.size > max) throw new Error("Proving asset size is outside the supported limit");
  return new Uint8Array(await blob.arrayBuffer());
}
async function verifyProvingAssets(assets, expected) {
  const manifestBytes = await read(assets.manifest, 8192);
  if (await digest2(manifestBytes) !== hash2(assets.manifestSha256)) throw new Error("Artifact manifest hash mismatch");
  const manifest = object(JSON.parse(new TextDecoder().decode(manifestBytes)));
  exact6(manifest, ["protocol", "depth", "setup", "hashes"]);
  if (manifest.protocol !== "core-v1" || manifest.depth !== 8 || typeof manifest.setup !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(manifest.setup)) throw new Error("Unsupported proving manifest");
  const hashes = object(manifest.hashes);
  exact6(hashes, ["spend.r1cs", "spend_js/spend.wasm", "spend.zkey", "verification_key.json"]);
  Object.values(hashes).forEach(hash2);
  const wasm = await read(assets.wasm, 8 * 1024 * 1024), zkey = await read(assets.zkey, 16 * 1024 * 1024), key2 = await read(assets.verificationKey, 16384);
  if (await digest2(wasm) !== hashes["spend_js/spend.wasm"] || await digest2(zkey) !== hashes["spend.zkey"] || await digest2(key2) !== hashes["verification_key.json"]) throw new Error("Proving asset hash mismatch");
  const verificationKey = object(JSON.parse(new TextDecoder().decode(key2)));
  if (await digest2(encodeVerificationKeyBytes(verificationKey)) !== ft(expected).verifierSha256) throw new Error("Verification key differs from the trusted policy");
  return { wasm, zkey, verificationKey, setup: manifest.setup };
}
function limb(value2) {
  if (typeof value2 !== "string" || !/^(0|[1-9][0-9]*)$/.test(value2) || value2.length > 77 || BigInt(value2) >= Q) throw new Error("Invalid BN254 coordinate");
  let n = BigInt(value2);
  return Uint8Array.from({ length: 32 }, () => {
    const byte = Number(n & 255n);
    n >>= 8n;
    return byte;
  });
}
function g1(p) {
  if (!Array.isArray(p) || p.length !== 3 || p[2] !== "1") throw new Error("Invalid affine G1 point");
  return [limb(p[0]), limb(p[1])];
}
function g2(p) {
  if (!Array.isArray(p) || p.length !== 3 || !Array.isArray(p[0]) || p[0].length !== 2 || !Array.isArray(p[1]) || p[1].length !== 2 || canonical(p[2]) !== '["1","0"]') throw new Error("Invalid affine G2 point");
  return [limb(p[0][0]), limb(p[0][1]), limb(p[1][0]), limb(p[1][1])];
}
function concat(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}
function encodeVerificationKeyBytes(key2) {
  if (key2.protocol !== "groth16" || key2.curve !== "bn128" || key2.nPublic !== 5 || !Array.isArray(key2.IC) || key2.IC.length !== 6) throw new Error("Wrong circuit verification key");
  return concat([...g1(key2.vk_alpha_1), ...g2(key2.vk_beta_2), ...g2(key2.vk_gamma_2), ...g2(key2.vk_delta_2), ...key2.IC.flatMap(g1)]);
}
function parseSpend(input) {
  const p = object(input);
  exact6(p, ["proof", "public_inputs"]);
  if (typeof p.proof !== "string" || !/^[A-Za-z0-9+/]{342}==$/.test(p.proof) || atob(p.proof).length !== 256 || btoa(atob(p.proof)) !== p.proof || !Array.isArray(p.public_inputs) || p.public_inputs.length !== 5) throw new Error("Invalid spend proof");
  return { proof: p.proof, public_inputs: p.public_inputs.map(scalar) };
}
async function publicPlan(policy, action, spend, checkedAtBlock) {
  const q = feeQuote(policy);
  const tokenCall = { contract: policy.tokenId, method: "ft_transfer_call", args: {
    receiver_id: policy.registry,
    amount: q.feeTokens,
    msg: JSON.stringify({ vault: action.vault, recipient: action.recipient, disclosure_root: action.disclosureRoot, ...spend })
  }, attachedYoctoNear: "1", gas: "300000000000000" };
  await preparedPayment({ tokenCall, checkedAtBlock }, policy, action.recipient);
  return { tokenCall, checkedAtBlock };
}
async function parseProofBundle(raw, expected) {
  const b = object(raw);
  exact6(b, ["format", "version", "policy", "action", "checkedAtBlock", "artifactManifestSha256", "setup", "spend", "plan", "digest"]);
  const { digest: checksum, ...payload } = b;
  if (b.format !== "core-browser-proof" || b.version !== 1 || await sha256(canonical(payload)) !== hash2(checksum) || canonical(ft(b.policy)) !== canonical(ft(expected))) throw new Error("Proof file integrity or policy mismatch");
  const policy = ft(expected), a = object(b.action);
  exact6(a, ["vault", "recipient", "disclosureRoot"]);
  const action = { ...parseProvingAction({ recipient: a.recipient, disclosureRoot: a.disclosureRoot }, policy), vault: vaultFor(policy, a.vault) }, spend = parseSpend(b.spend), checkedAtBlock = block(b.checkedAtBlock);
  if (spend.public_inputs[4] !== await noteDomain(policy) || spend.public_inputs[3] !== await withdrawalContext(policy, action.vault, action)) throw new Error("Proof file does not bind this withdrawal");
  if (canonical(b.plan) !== canonical(await publicPlan(policy, action, spend, checkedAtBlock.hash)) || typeof b.setup !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(b.setup)) throw new Error("Proof plan or setup metadata mismatch");
  hash2(b.artifactManifestSha256);
  return b;
}
var stages = ["assets", "tree", "witness", "proving", "verifying"];
var errors = { ASSET_INVALID: "Proving files failed integrity or policy verification.", INPUT_INVALID: "The note, group snapshot or withdrawal details are invalid.", PROOF_INVALID: "Proof verification failed.", PROVING_FAILED: "Local proving failed. Check device memory and the proving files." };
var BrowserProver = class {
  constructor(worker) {
    this.worker = worker;
  }
  worker;
  prove(request, assets, options = {}) {
    return this.run({ operation: "prove", request, assets }, request.policy, options);
  }
  verify(bundle, policy, assets, options = {}) {
    return this.run({ operation: "verify", bundle, assets }, policy, options);
  }
  run(message, policy, options) {
    const timeout = options.timeoutMs ?? 18e4;
    if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 3e5) return Promise.reject(new Error("Invalid prover deadline"));
    return new Promise((resolve, reject) => {
      if (options.signal?.aborted) {
        reject(new DOMException("Proving cancelled", "AbortError"));
        return;
      }
      let worker;
      try {
        worker = this.worker();
      } catch {
        reject(new Error("This browser could not start a local prover worker."));
        return;
      }
      const id2 = crypto.randomUUID();
      let settled = false;
      const finish = (error, result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        options.signal?.removeEventListener("abort", abort);
        worker.removeEventListener("message", receive);
        worker.removeEventListener("error", failed);
        worker.removeEventListener("messageerror", failed);
        worker.terminate();
        if (error) reject(error);
        else resolve(result);
      };
      const abort = () => finish(new DOMException("Proving cancelled", "AbortError"));
      const failed = () => finish(new Error("The local prover worker stopped unexpectedly."));
      const receive = (event) => {
        const data = event.data;
        if (settled || !data || data.id !== id2) return;
        if (data.type === "progress" && stages.includes(data.stage)) {
          try {
            options.onProgress?.(data.stage);
          } catch {
            finish(new Error("Local proving was interrupted."));
          }
          return;
        }
        if (data.type === "error") {
          finish(new Error(errors[data.code] ?? errors.PROVING_FAILED));
          return;
        }
        if (data.type === "result") void (async () => {
          try {
            const bundle = await parseProofBundle(data.bundle, policy), metrics = object(data.metrics);
            if (Object.keys(metrics).sort().join("|") !== "elapsedMs|provingMs|verificationMs|witnessMs" || Object.values(metrics).some((v) => typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 3e5)) throw new Error("Invalid prover metrics");
            if (message.operation === "prove") {
              const request = message.request, note = await validatePrivateNote(policy, request.note), context = parseProvingContext(request.context, policy);
              const inputs = [noteHash([note.nullifier, note.domain]), noteHash([note.nullifier, bundle.spend.public_inputs[3]]), context.root];
              if (canonical(bundle.action) !== canonical({ ...parseProvingAction(request.action, policy), vault: context.vault }) || canonical(bundle.checkedAtBlock) !== canonical(context.checkedAtBlock) || canonical(inputs) !== canonical(bundle.spend.public_inputs.slice(0, 3))) throw new Error("Prover result differs from the requested note or destination");
            } else if (canonical(bundle) !== canonical(message.bundle)) throw new Error("Verification result differs from the selected proof file");
            if (bundle.artifactManifestSha256 !== message.assets.manifestSha256) throw new Error("Prover result uses different proving files");
            finish(void 0, { bundle, metrics });
          } catch {
            finish(new Error("The prover returned an invalid or substituted result."));
          }
        })();
      };
      const timer = setTimeout(() => finish(new DOMException("Local proving exceeded its deadline. Try a supported device.", "TimeoutError")), timeout);
      options.signal?.addEventListener("abort", abort, { once: true });
      worker.addEventListener("message", receive);
      worker.addEventListener("error", failed);
      worker.addEventListener("messageerror", failed);
      if (options.signal?.aborted) {
        abort();
        return;
      }
      try {
        worker.postMessage({ id: id2, ...message, policy });
      } catch {
        failed();
      }
    });
  }
};

// sdk/client/invoice-payment.ts
function copy(input) {
  return JSON.parse(canonical(parseSignedInvoice(input)));
}
function reference(root, signed, value2) {
  if (value2.kind !== "withdrawal" || value2.expectedRecipient !== signed.invoice.recipient || value2.expectedDisclosureRoot !== root) throw new Error("Payment is not bound to the selected invoice unit");
}
function localAvailability(signed, root, nullifier, operations, except, reuseExact = false) {
  for (const operation of operations) {
    if (operation.id === except || canonical(operation.policy) !== canonical(signed.invoice.policy) || operation.reference.kind !== "withdrawal") continue;
    const old = operation.reference;
    const exact10 = old.nullifier === nullifier && old.expectedRecipient === signed.invoice.recipient && old.expectedDisclosureRoot === root;
    if (exact10 && reuseExact) continue;
    if (old.nullifier === nullifier) throw new Error("This note already has a local withdrawal. Reconcile the existing operation; do not spend it again.");
    if (old.expectedRecipient === signed.invoice.recipient && old.expectedDisclosureRoot === root && (signed.invoice.version === 2 || operation.outcome === "open")) throw new Error("This invoice unit already has a local payment. Reconcile that operation before selecting another note.");
  }
}
async function available(gateway, signed, root, signal) {
  signal?.throwIfAborted();
  requireOpenInvoice(signed.invoice);
  const status = await gateway.invoiceStatus(copy(signed), { signal });
  signal?.throwIfAborted();
  await assertInvoiceReferenceAvailable(signed.invoice, root, status);
  signal?.throwIfAborted();
  requireOpenInvoice(signed.invoice);
  if (!["awaiting_payment", "partial"].includes(status.state) || BigInt(status.remainingTokens) < BigInt(signed.invoice.policy.denomination)) throw new Error("This invoice is already covered or needs merchant review");
  return status;
}
async function matchInvoiceProof(raw, input, paymentIndex, payer) {
  const signed = await verifySignedInvoice(copy(input)), bundle = await parseProofBundle(raw, signed.invoice.policy);
  const prepared = await matchInvoicePlan(bundle.plan, signed.invoice, payer, paymentIndex);
  const root = await invoiceRoot(signed.invoice, paymentIndex);
  reference(root, signed, prepared.reference);
  if (bundle.action.recipient !== signed.invoice.recipient || bundle.action.disclosureRoot !== root) throw new Error("Proof does not match the selected signed invoice unit");
  return { bundle, prepared, root };
}
async function prepareInvoiceProof(prover, gateway, input, paymentIndex, rawNote, assets, vault2, options = {}) {
  const signed = await verifySignedInvoice(copy(input));
  options.signal?.throwIfAborted();
  const policy = parsePolicy(signed.invoice.policy), root = await invoiceRoot(signed.invoice, paymentIndex), note = await validatePrivateNote(policy, rawNote);
  const nullifier = noteHash([note.nullifier, note.domain]);
  options.signal?.throwIfAborted();
  if (options.getOperations) localAvailability(signed, root, nullifier, await options.getOperations());
  await available(gateway, signed, root, options.signal);
  const context = parseProvingContext(await gateway.provingContext(parsePolicy(policy), vault2, { signal: options.signal }), policy);
  options.signal?.throwIfAborted();
  if (context.vault !== vault2) throw new Error("API substituted the selected payout vault");
  const action = { recipient: signed.invoice.recipient, disclosureRoot: root };
  const result = await prover.prove({ policy, note, context, action }, assets, { signal: options.signal, onProgress: options.onProgress });
  options.signal?.throwIfAborted();
  const matched = await matchInvoiceProof(result.bundle, signed, paymentIndex, signed.invoice.recipient);
  options.signal?.throwIfAborted();
  if (matched.bundle.spend.public_inputs[0] !== nullifier || matched.bundle.spend.public_inputs[2] !== context.root) throw new Error("Prover returned a different note or group root");
  await available(gateway, signed, root, options.signal);
  if (options.getOperations) localAvailability(signed, root, nullifier, await options.getOperations());
  options.signal?.throwIfAborted();
  return result;
}
function invoiceSettlementGuards(gateway, input) {
  const signed = copy(input);
  const binding = async (value2) => {
    const roots = await invoicePaymentRoots(signed.invoice), root = value2.kind === "withdrawal" ? value2.expectedDisclosureRoot : void 0;
    if (!root || !roots.includes(root)) throw new Error("Operation is not bound to this signed invoice");
    reference(root, signed, value2);
    return root;
  };
  return {
    async beforeImport(payment, _payer, operations) {
      await verifySignedInvoice(copy(signed));
      const root = await binding(payment.reference);
      if (payment.reference.kind !== "withdrawal") throw new Error("Invoice requires a withdrawal");
      localAvailability(signed, root, payment.reference.nullifier, operations, void 0, true);
      await available(gateway, signed, root);
    },
    async beforeSubmit(operation, review, operations) {
      const root = await binding(operation.reference);
      if (operation.reference.kind !== "withdrawal") throw new Error("Invoice requires a withdrawal");
      if (review.kind === "retry" || review.kind === "refund") return () => {
      };
      await verifySignedInvoice(copy(signed));
      localAvailability(signed, root, operation.reference.nullifier, operations, operation.id);
      await available(gateway, signed, root);
      const checked = Date.now();
      return () => {
        requireOpenInvoice(signed.invoice);
        const age = Date.now() - checked;
        if (age < 0 || age > 15e3) throw new Error("Invoice authorization is stale. Refresh and review before signing.");
        reference(root, signed, operation.reference);
      };
    }
  };
}

// sdk/client/groups.ts
function exact7(value2, keys) {
  if (Object.keys(value2).sort().join("|") !== [...keys].sort().join("|")) throw new Error("Unexpected group fields");
}
function count(value2) {
  if (typeof value2 !== "number" || !Number.isSafeInteger(value2) || value2 < 0) throw new Error("Invalid group count");
  return value2;
}
function boolean(value2) {
  if (typeof value2 !== "boolean") throw new Error("Invalid group flag");
  return value2;
}
function parseApprovedGroups(input) {
  const value2 = object(input);
  exact7(value2, ["version", "groups"]);
  if (value2.version !== 1 || !Array.isArray(value2.groups) || value2.groups.length < 1 || value2.groups.length > 8) throw new Error("Use an approved directory with 1\u20138 groups");
  const ids = /* @__PURE__ */ new Set(), registries = /* @__PURE__ */ new Set();
  const groups = value2.groups.map((raw) => {
    const g = object(raw);
    exact7(g, ["id", "depositsEnabled", "policy"]);
    if (typeof g.id !== "string" || !/^[a-z0-9][a-z0-9-]{0,31}$/.test(g.id)) throw new Error("Invalid group ID");
    const policy = parsePolicy(g.policy);
    if (ids.has(g.id) || registries.has(policy.registry)) throw new Error("Duplicate group ID or registry");
    ids.add(g.id);
    registries.add(policy.registry);
    return { id: g.id, depositsEnabled: boolean(g.depositsEnabled), policy };
  });
  const first = groups[0].policy;
  if (groups.some((g) => g.policy.network !== first.network || g.policy.tokenId !== first.tokenId || g.policy.denomination !== first.denomination))
    throw new Error("Approved groups must use the same network, asset and denomination");
  return { version: 1, groups };
}
function parseGroupCapacity(input, trusted) {
  const value2 = object(input), policy = parsePolicy(value2.policy), expected = parsePolicy(trusted);
  exact7(value2, ["policy", "checkedAtBlock", "capacity", "usedOutputs", "remainingOutputs", "outstandingNotes", "depositCapacityAvailable", "depositVaultObserved", "checkedVaults", "vaultScanComplete", "chainFreshnessChecked"]);
  if (canonical(policy) !== canonical(expected)) throw new Error("Group capacity policy differs from the trusted group");
  const block3 = object(value2.checkedAtBlock);
  exact7(block3, ["hash", "height"]);
  if (typeof block3.hash !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(block3.hash)) throw new Error("Invalid group block");
  const usedOutputs = count(value2.usedOutputs), remainingOutputs = count(value2.remainingOutputs), outstandingNotes = count(value2.outstandingNotes), checkedVaults = count(value2.checkedVaults);
  const depositCapacityAvailable = boolean(value2.depositCapacityAvailable), depositVaultObserved = boolean(value2.depositVaultObserved), vaultScanComplete = boolean(value2.vaultScanComplete);
  if (value2.capacity !== 256 || usedOutputs > 256 || remainingOutputs !== 256 - usedOutputs || outstandingNotes > usedOutputs || checkedVaults > 1 || depositCapacityAvailable !== remainingOutputs > 0 || depositVaultObserved && (!depositCapacityAvailable || checkedVaults === 0) || value2.chainFreshnessChecked !== false)
    throw new Error("Inconsistent group capacity snapshot");
  return { policy, checkedAtBlock: { hash: block3.hash, height: count(block3.height) }, capacity: 256, usedOutputs, remainingOutputs, outstandingNotes, depositCapacityAvailable, depositVaultObserved, checkedVaults, vaultScanComplete, chainFreshnessChecked: false };
}

// sdk/client/recipients.ts
function parseRecipientReadiness(raw, trusted, expectedRecipient) {
  const r = object(raw), policy = parsePolicy(r.policy), expected = parsePolicy(trusted), recipient = account(r.recipient), block3 = object(r.checkedAtBlock);
  const fields = ["policy", "recipient", "checkedAtBlock", "accountKind", "accountExists", "tokenRegistered", "state", "canReceiveTokens", "storageMinimumYoctoNear", "registrationCall", "activationAmountYoctoNear", "gasBudgetIncluded", "chainFreshnessChecked"];
  if (Object.keys(r).sort().join("|") !== fields.sort().join("|") || Object.keys(block3).sort().join("|") !== "hash|height") throw new Error("Unexpected recipient readiness fields");
  if (!policy.tokenId || canonical(policy) !== canonical(expected) || recipient !== account(expectedRecipient) || recipient === policy.registry || recipient.endsWith("." + policy.registry)) throw new Error("Recipient readiness differs from the trusted destination");
  if (typeof block3.hash !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(block3.hash) || typeof block3.height !== "number" || !Number.isSafeInteger(block3.height) || block3.height < 0) throw new Error("Invalid recipient readiness block");
  if (typeof r.accountExists !== "boolean" || typeof r.tokenRegistered !== "boolean") throw new Error("Invalid recipient readiness flags");
  const state = !r.accountExists ? "account_missing" : !r.tokenRegistered ? "registration_required" : "ready";
  const accountKind = /^[0-9a-f]{64}$/.test(recipient) ? "near_implicit" : /^0x[0-9a-f]{40}$/.test(recipient) ? "eth_implicit" : "named_or_other";
  if (r.state !== state || r.accountKind !== accountKind || r.canReceiveTokens !== (state === "ready") || r.activationAmountYoctoNear !== null || r.gasBudgetIncluded !== false || r.chainFreshnessChecked !== false) throw new Error("Inconsistent recipient readiness");
  if (typeof r.storageMinimumYoctoNear !== "string" || !/^[1-9][0-9]{0,24}$/.test(r.storageMinimumYoctoNear) || BigInt(r.storageMinimumYoctoNear) > 10n ** 24n) throw new Error("Invalid recipient registration minimum");
  const registrationCall = r.registrationCall === null ? null : parseCall(r.registrationCall);
  const expectedCall = state === "registration_required" ? { contract: policy.tokenId, method: "storage_deposit", args: { account_id: recipient, registration_only: true }, attachedYoctoNear: r.storageMinimumYoctoNear, gas: GAS } : null;
  if (canonical(registrationCall) !== canonical(expectedCall)) throw new Error("Recipient registration call is not bound to this account and token");
  return {
    policy,
    recipient,
    checkedAtBlock: { hash: block3.hash, height: block3.height },
    accountKind,
    accountExists: r.accountExists,
    tokenRegistered: r.tokenRegistered,
    state,
    canReceiveTokens: state === "ready",
    storageMinimumYoctoNear: r.storageMinimumYoctoNear,
    registrationCall,
    activationAmountYoctoNear: null,
    gasBudgetIncluded: false,
    chainFreshnessChecked: false
  };
}

// sdk/client/deposits.ts
function exact8(value2, keys) {
  if (Object.keys(value2).sort().join("|") !== [...keys].sort().join("|")) throw new Error("Unexpected public deposit fields");
}
function parseDepositRequest(raw) {
  const value2 = object(raw);
  exact8(value2, ["commitment", "disclosureRoot", ...value2.vault === void 0 ? [] : ["vault"]]);
  const commitment = scalar(value2.commitment);
  if (commitment === "0" || typeof value2.disclosureRoot !== "string" || !/^[a-f0-9]{64}$/.test(value2.disclosureRoot)) throw new Error("Invalid public deposit commitment or disclosure root");
  return { commitment, disclosureRoot: value2.disclosureRoot, ...value2.vault === void 0 ? {} : { vault: account(value2.vault) } };
}
async function parseDepositPlan(raw, trusted, expected) {
  const value2 = object(raw), policy = parsePolicy(value2.policy), request = parseDepositRequest(expected);
  exact8(value2, ["policy", "checkedAtBlock", "plan", "remainingOutputs", "checkedVaults", "vaultScanComplete"]);
  if (!policy.tokenId || canonical(policy) !== canonical(parsePolicy(trusted))) throw new Error("Deposit policy differs from the trusted group");
  const block3 = object(value2.checkedAtBlock), plan = object(value2.plan);
  exact8(block3, ["hash", "height"]);
  exact8(plan, ["tokenCall", "checkedAtBlock"]);
  if (typeof block3.hash !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(block3.hash) || typeof block3.height !== "number" || !Number.isSafeInteger(block3.height) || block3.height < 0 || plan.checkedAtBlock !== block3.hash) throw new Error("Invalid deposit block");
  const { payment, reference: reference2 } = await preparedPayment(plan, policy, "inspection.testnet");
  if (reference2.kind !== "deposit" || reference2.commitment !== request.commitment || reference2.expectedDisclosureRoot !== request.disclosureRoot || request.vault && reference2.vault !== request.vault || payment.gas !== GAS) throw new Error("Deposit call differs from the requested note and receipt");
  if (typeof value2.remainingOutputs !== "number" || !Number.isInteger(value2.remainingOutputs) || value2.remainingOutputs < 1 || value2.remainingOutputs > 256 || typeof value2.checkedVaults !== "number" || !Number.isInteger(value2.checkedVaults) || value2.checkedVaults < 1 || value2.checkedVaults > 20 || typeof value2.vaultScanComplete !== "boolean") throw new Error("Invalid deposit capacity snapshot");
  return { policy, checkedAtBlock: { hash: block3.hash, height: block3.height }, plan: { tokenCall: payment, checkedAtBlock: block3.hash }, remainingOutputs: value2.remainingOutputs, checkedVaults: value2.checkedVaults, vaultScanComplete: value2.vaultScanComplete };
}

// sdk/client/activity.ts
var activityKinds = [
  "deposit",
  "transfer",
  "withdrawal_requested",
  "withdrawal_failed",
  "withdrawal_retried",
  "withdrawal_succeeded"
];
var count2 = (v) => {
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 0)
    throw new Error("Invalid index count");
  return v;
};
var hash3 = (v) => {
  if (typeof v !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(v))
    throw new Error("Invalid chain hash");
  return v;
};
var block2 = (v) => {
  const b = object(v);
  return { hash: hash3(b.hash), height: count2(b.height) };
};
var time = (v) => {
  if (typeof v !== "string" || !Number.isFinite(Date.parse(v)))
    throw new Error("Invalid index timestamp");
  return v;
};
var atomic2 = (v) => {
  if (typeof v !== "string" || !/^(0|[1-9][0-9]*)$/.test(v) || v.length > 39 || BigInt(v) >= 1n << 128n)
    throw new Error("Invalid indexed amount");
  return v;
};
function parseIndexStatus(input, policy) {
  const s = object(input);
  if (s.enabled !== true || s.scope !== "configured_registry_records" || s.chainFreshnessChecked !== false || canonical(parsePolicy(s.policy)) !== canonical(policy))
    throw new Error("Index policy or scope mismatch");
  const claims = object(s.claims);
  if (claims.completeBusinessHistory !== false || claims.taxFilingAccepted !== false)
    throw new Error("Unsupported index claim");
  const indexedRecords = count2(s.indexedRecords), linkedRecords = count2(s.linkedRecords), c = s.checkpoint === null ? null : object(s.checkpoint), checkpoint = c ? {
    block: block2(c.block),
    nextIndex: count2(c.nextIndex),
    sourceRecordCount: count2(c.sourceRecordCount),
    updatedAt: time(c.updatedAt)
  } : null;
  if (linkedRecords > indexedRecords || checkpoint && (checkpoint.nextIndex !== indexedRecords || checkpoint.sourceRecordCount < indexedRecords) || !checkpoint && indexedRecords !== 0 || s.remainingRecords !== (checkpoint ? checkpoint.sourceRecordCount - indexedRecords : null))
    throw new Error("Inconsistent index coverage");
  const candidates = {};
  for (const [k, v] of Object.entries(object(s.candidates))) {
    if (!["pending", "linked", "unrelated", "invalid"].includes(k))
      throw new Error("Invalid provenance queue state");
    candidates[k] = count2(v);
  }
  let discovery;
  if (s.discovery !== void 0) {
    const d = object(s.discovery);
    if (typeof d.enabled !== "boolean" || d.enabled !== (d.state !== null))
      throw new Error("Invalid discovery status");
    let state = null;
    if (d.state !== null) {
      const x = object(d.state), cur = x.current === null ? null : object(x.current);
      state = {
        startHeight: count2(x.startHeight),
        lastComplete: x.lastComplete === null ? null : block2(x.lastComplete),
        current: cur ? {
          block: block2(cur.block),
          offset: count2(cur.offset),
          total: count2(cur.total)
        } : null,
        scannedTransactions: count2(x.scannedTransactions),
        candidatesFound: count2(x.candidatesFound),
        updatedAt: time(x.updatedAt),
        blocked: x.blocked === null ? null : typeof x.blocked === "string" && /^[A-Z_]{1,64}$/.test(x.blocked) ? x.blocked : (() => {
          throw new Error("Invalid discovery error");
        })()
      };
      if (state.current && state.current.offset > state.current.total)
        throw new Error("Invalid discovery offset");
    }
    discovery = { enabled: d.enabled, state };
  }
  return {
    enabled: true,
    policy,
    checkpoint,
    indexedRecords,
    linkedRecords,
    remainingRecords: s.remainingRecords,
    candidates,
    ...discovery ? { discovery } : {},
    scope: "configured_registry_records",
    claims: { completeBusinessHistory: false, taxFilingAccepted: false },
    chainFreshnessChecked: false
  };
}
function parseActivityPage(input, policy) {
  const p = object(input), index = parseIndexStatus(p.index, policy), upper = count2(object(p.snapshot).upperExclusive);
  if (p.scope !== "configured_registry_records" || upper > index.indexedRecords || !Array.isArray(p.items) || p.items.length > 50 || p.nextCursor !== null && (typeof p.nextCursor !== "string" || p.nextCursor.length > 1024 || !/^[A-Za-z0-9_-]+$/.test(p.nextCursor)))
    throw new Error("Invalid activity page");
  const items = p.items.map((value2) => {
    const item = object(value2), r = object(item.record), kind = r.kind;
    if (!activityKinds.includes(kind))
      throw new Error("Unsupported journal event");
    const root = r.disclosure_root;
    if (typeof root !== "string" || !/^[a-f0-9]{64}$/.test(root))
      throw new Error("Invalid receipt root");
    const record = {
      index: count2(r.index),
      kind,
      commitment: r.commitment === null ? null : scalar(r.commitment),
      nullifier: r.nullifier === null ? null : scalar(r.nullifier),
      vault: r.vault === null ? null : account(r.vault),
      recipient: r.recipient === null ? null : account(r.recipient),
      disclosure_root: root,
      block_height: count2(r.block_height),
      timestamp_ns: atomic2(r.timestamp_ns),
      amount: atomic2(r.amount),
      asset_token_id: r.asset_token_id === null ? null : account(r.asset_token_id),
      protocol_fee_charged: atomic2(r.protocol_fee_charged),
      protocol_fee_earned: atomic2(r.protocol_fee_earned),
      storage_fee_charged: atomic2(r.storage_fee_charged)
    };
    if (record.amount !== policy.denomination || record.asset_token_id !== (policy.tokenId ?? null) || record.index >= upper)
      throw new Error("Activity asset or snapshot mismatch");
    const fee = (BigInt(policy.denomination) * 15n / 10000n).toString();
    if (record.protocol_fee_charged !== (["deposit", "withdrawal_requested"].includes(kind) ? fee : "0") || record.protocol_fee_earned !== (["deposit", "withdrawal_succeeded"].includes(kind) ? fee : "0") || record.storage_fee_charged !== ([
      "deposit",
      "transfer",
      "withdrawal_requested",
      "withdrawal_retried"
    ].includes(kind) ? "20000000000000000000000" : "0"))
      throw new Error("Indexed fee policy mismatch");
    if (kind === "deposit" ? record.commitment === null || record.nullifier !== null || record.vault === null || record.recipient !== null : kind === "transfer" ? record.commitment === null || record.nullifier === null || record.vault !== null || record.recipient !== null : record.commitment !== null || record.nullifier === null || record.vault === null || record.recipient === null)
      throw new Error("Indexed action binding mismatch");
    if (record.vault && !new RegExp(
      `^v[a-f0-9]{32}\\.${policy.registry.replaceAll(".", "\\.")}$`
    ).test(record.vault))
      throw new Error("Indexed vault is outside the trusted group");
    const observedAt = block2(item.observedAt);
    if (record.block_height > observedAt.height || index.checkpoint && observedAt.height > index.checkpoint.block.height)
      throw new Error("Activity is outside its observed final block");
    let provenance = null;
    if (item.provenance !== null) {
      const a = object(item.provenance), t = object(a.transaction);
      if (!["succeeded", "failed"].includes(String(a.outerOutcome)) || !Array.isArray(a.receipts) || a.receipts.length < 1 || a.receipts.length > 50)
        throw new Error("Invalid provenance");
      provenance = {
        transaction: { hash: hash3(t.hash), signer: account(t.signer) },
        outerOutcome: a.outerOutcome,
        receipts: a.receipts.map((v) => {
          const x = object(v);
          return { id: hash3(x.id), blockHash: hash3(x.blockHash) };
        }),
        verifiedAt: block2(a.verifiedAt)
      };
    }
    return { record, observedAt, provenance };
  });
  if (items.some(
    (item, i) => i > 0 && item.record.index >= items[i - 1].record.index
  ))
    throw new Error("Activity page is not in descending order");
  return {
    items,
    nextCursor: p.nextCursor,
    snapshot: { upperExclusive: upper },
    index,
    scope: "configured_registry_records"
  };
}

// sdk/client/http.ts
var HttpGateway = class {
  url;
  constructor(url) {
    const u = new URL(url);
    if (u.username || u.password || u.search || u.hash || u.pathname !== "/" || !(u.protocol === "https:" || u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)))
      throw new Error("Use an HTTPS API origin (HTTP is allowed on localhost)");
    this.url = u.origin;
  }
  async request(path, body, signal) {
    const r = await fetch(this.url + path, {
      method: body === void 0 ? "GET" : "POST",
      headers: body === void 0 ? {} : { "content-type": "application/json" },
      ...body === void 0 ? {} : { body: JSON.stringify(body) },
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(25e3)]) : AbortSignal.timeout(25e3)
    });
    if (!r.ok) {
      let code;
      try {
        const e = await r.json();
        if ([
          "INDEX_DISABLED",
          "INDEX_NOT_READY",
          "INDEX_READ_FAILED",
          "INVALID_CURSOR",
          "RATE_LIMITED",
          "TOO_MANY_REQUESTS",
          "RPC_BUDGET_EXCEEDED",
          "RATE_LIMIT_CAPACITY",
          "REQUEST_TIMEOUT"
        ].includes(e.error))
          code = e.error;
      } catch {
      }
      const retry = r.headers.get("retry-after");
      const retryAfterSeconds = retry && /^[0-9]+$/.test(retry) && Number(retry) >= 1 && Number(retry) <= 3600 ? Number(retry) : void 0;
      throw new CoreApiError(r.status, code, retryAfterSeconds);
    }
    return r.json();
  }
  async policy() {
    return parsePolicy((await this.request("/v1/config")).policy);
  }
  preflight(request) {
    return this.request("/v1/ft/preflight", request);
  }
  observe(reference2) {
    return this.request("/v1/settlements/status", reference2);
  }
  verify(transaction, call) {
    return this.request("/v1/transactions/verify", { transaction, call });
  }
  async trusted(policy, signal) {
    if (canonical(parsePolicy((await this.request("/v1/config", void 0, signal)).policy)) !== canonical(policy))
      throw new Error("API policy differs from the trusted group");
  }
  async groupCapacity(policy, options = {}) {
    await this.trusted(policy, options.signal);
    return parseGroupCapacity(await this.request("/v1/group/capacity", void 0, options.signal), policy);
  }
  async recipientReadiness(policy, recipient, options = {}) {
    const trusted = parsePolicy(policy), destination = account(recipient);
    if (!trusted.tokenId || destination === trusted.registry || destination.endsWith("." + trusted.registry)) throw new Error("Choose an external recipient and a trusted FT group");
    await this.trusted(trusted, options.signal);
    return parseRecipientReadiness(await this.request("/v1/recipients/readiness", { recipient: destination }, options.signal), trusted, destination);
  }
  async prepareDeposit(policy, request, options = {}) {
    const trusted = parsePolicy(policy), input = parseDepositRequest(request);
    if (!trusted.tokenId) throw new Error("Choose a trusted FT group");
    await this.trusted(trusted, options.signal);
    return parseDepositPlan(await this.request("/v1/deposits/prepare", input, options.signal), trusted, input);
  }
  async provingContext(policy, vault2, options = {}) {
    const trusted = parsePolicy(policy), selected = account(vault2);
    if (!trusted.tokenId || !selected.endsWith("." + trusted.registry)) throw new Error("Choose a payout vault in the original FT group");
    await this.trusted(trusted, options.signal);
    const result = parseProvingContext(await this.request("/v1/proofs/context", { vault: selected }, options.signal), trusted);
    if (result.vault !== selected) throw new Error("API substituted the selected payout vault");
    return result;
  }
  async verifyInvoice(input, options = {}) {
    const signed = await verifySignedInvoice(input);
    options.signal?.throwIfAborted();
    await this.trusted(signed.invoice.policy, options.signal);
    const result = await this.request(
      "/v1/invoices/verify",
      await invoiceProof(signed),
      options.signal
    );
    if (result.invoiceHash !== await invoiceHash(signed.invoice) || result.merchantAccount !== signed.invoice.merchantAccount || result.verified !== true || result.claims?.legalIdentityVerified !== false || result.claims?.kybVerified !== false)
      throw new Error(
        "Invoice signer is not a current merchant full-access key"
      );
    return signed;
  }
  async invoiceStatus(input, options = {}) {
    const signed = await this.verifyInvoice(input, options), hash4 = await invoiceHash(signed.invoice), result = await this.request("/v1/invoices/status", await invoiceStatusRequest(signed.invoice), options.signal), roots = await invoicePaymentRoots(signed.invoice);
    if (result.invoiceHash !== hash4 || (signed.invoice.version === 1 ? result.settlementRoot !== roots[0] : result.settlementRoot !== null || canonical(result.settlementRoots) !== canonical(roots)) || result.expectedTokens !== invoiceQuote(signed.invoice).principalTokens || ![
      "awaiting_payment",
      "partial",
      "paid",
      "paid_late",
      "overpaid",
      "expired",
      "partial_expired",
      "review_required"
    ].includes(result.state) || result.chainFreshnessChecked !== false || !Array.isArray(result.confirmations) || result.confirmations.length > 1e3)
      throw new Error("Invalid invoice settlement status");
    return validateInvoiceStatus(result, signed.invoice);
  }
  async indexStatus(policy) {
    await this.trusted(policy);
    return parseIndexStatus(await this.request("/v1/index/status"), policy);
  }
  async activity(policy, query = {}) {
    await this.trusted(policy);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query))
      if (v !== void 0 && v !== "") params.set(k, String(v));
    return parseActivityPage(
      await this.request(
        "/v1/activity" + (params.size ? "?" + params.toString() : "")
      ),
      policy
    );
  }
};
var CoreApiError = class extends Error {
  constructor(status, code, retryAfterSeconds) {
    super(`Core API request failed (${status}${code ? `: ${code}` : ""})${retryAfterSeconds ? `; try again in ${retryAfterSeconds} seconds` : ""}`);
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
  status;
  code;
  retryAfterSeconds;
};

// sdk/client/receipts.ts
var RECEIPT_FIELDS = Object.freeze(["sender", "recipient", "asset", "amount", "purpose", "reference", "occurredAt", "credentialHash"]);
var FORMAT3 = "core-private-receipt";
var MAX_BACKUP = 2e5;
function exact9(value2, keys) {
  if (Object.keys(value2).sort().join("|") !== [...keys].sort().join("|")) throw new Error("Unexpected receipt fields");
}
function digest3(raw) {
  if (typeof raw !== "string" || !/^[a-f0-9]{64}$/.test(raw)) throw new Error("Expected a 64-character lowercase receipt root or hash");
  return raw;
}
function value(raw) {
  if (typeof raw !== "string" || raw.length > 4096) throw new Error("Receipt values must be strings of at most 4096 characters");
  return raw;
}
function parse(raw) {
  const receipt = object(raw);
  exact9(receipt, ["version", "root", "openings"]);
  const root = digest3(receipt.root);
  if (receipt.version !== 1 || !Array.isArray(receipt.openings) || receipt.openings.length < 1 || receipt.openings.length > 8) throw new Error("Choose a version-1 receipt with 1\u20138 field openings");
  const seen = /* @__PURE__ */ new Set();
  const openings = receipt.openings.map((rawOpening) => {
    const opening = object(rawOpening);
    exact9(opening, ["field", "value", "salt", "siblings"]);
    if (!RECEIPT_FIELDS.includes(opening.field) || seen.has(opening.field) || !Array.isArray(opening.siblings) || opening.siblings.length !== 3) throw new Error("Invalid or duplicate receipt opening");
    const field = opening.field;
    seen.add(field);
    return { field, value: value(opening.value), salt: digest3(opening.salt), siblings: opening.siblings.map(digest3) };
  });
  return { version: 1, root, openings: openings.sort((a, b) => RECEIPT_FIELDS.indexOf(a.field) - RECEIPT_FIELDS.indexOf(b.field)) };
}
var leaf = (field, declared, salt) => sha256(JSON.stringify(["core:receipt:v1", field, declared, salt]));
var branch = (left, right) => sha256(`core:receipt:node:v1|${left}|${right}`);
async function verifyReceiptDisclosure(raw, expectedRoot) {
  const expected = digest3(expectedRoot), receipt = parse(raw);
  if (receipt.root !== expected) throw new Error("Receipt differs from the expected root");
  await Promise.all(receipt.openings.map(async (opening) => {
    let index = RECEIPT_FIELDS.indexOf(opening.field), hash4 = await leaf(opening.field, opening.value, opening.salt);
    for (const sibling of opening.siblings) {
      hash4 = index & 1 ? await branch(sibling, hash4) : await branch(hash4, sibling);
      index >>= 1;
    }
    if (hash4 !== expected) throw new Error("Receipt field integrity check failed");
  }));
  return receipt;
}
async function createReceipt(input) {
  const raw = object(input);
  exact9(raw, [...RECEIPT_FIELDS]);
  const values = RECEIPT_FIELDS.map((field) => value(raw[field]));
  const salts = RECEIPT_FIELDS.map(() => [...crypto.getRandomValues(new Uint8Array(32))].map((byte) => byte.toString(16).padStart(2, "0")).join(""));
  const levels = [await Promise.all(RECEIPT_FIELDS.map((field, i) => leaf(field, values[i], salts[i])))];
  while (levels.at(-1).length > 1) {
    const current = levels.at(-1);
    levels.push(await Promise.all(Array.from({ length: current.length / 2 }, (_, i) => branch(current[2 * i], current[2 * i + 1]))));
  }
  return { version: 1, root: levels.at(-1)[0], openings: RECEIPT_FIELDS.map((field, i) => {
    let index = i;
    const siblings = levels.slice(0, -1).map((level) => {
      const sibling = level[index ^ 1];
      index >>= 1;
      return sibling;
    });
    return { field, value: values[i], salt: salts[i], siblings };
  }) };
}
async function discloseReceipt(raw, fields) {
  const selected = [...fields];
  if (!selected.length || selected.length > 8 || new Set(selected).size !== selected.length || selected.some((field) => !RECEIPT_FIELDS.includes(field))) throw new Error("Select 1\u20138 distinct receipt fields");
  const receipt = await verifyReceiptDisclosure(raw, raw.root);
  if (selected.some((field) => !receipt.openings.some((opening) => opening.field === field))) throw new Error("Selected field is not available in this receipt");
  return { version: 1, root: receipt.root, openings: receipt.openings.filter((opening) => selected.includes(opening.field)) };
}
async function full(raw) {
  const parsed = parse(raw);
  if (parsed.openings.length !== 8) throw new Error("A private receipt backup must contain all eight fields");
  return verifyReceiptDisclosure(parsed, parsed.root);
}
async function encryptReceiptBackup(raw, password) {
  return seal({ version: 1, receipt: await full(raw) }, password, FORMAT3);
}
async function openReceiptBackup(envelope, password) {
  if (envelope.length > MAX_BACKUP) throw new Error("Receipt backup exceeds 200 KB");
  let decoded;
  try {
    decoded = await unseal(envelope, password, FORMAT3);
  } catch (error) {
    if (error && typeof error === "object" && "name" in error && error.name === "OperationError") throw new Error("Could not decrypt receipt. Check the passphrase and backup integrity.");
    throw error;
  }
  const payload = object(decoded);
  exact9(payload, ["version", "receipt"]);
  if (payload.version !== 1) throw new Error("Unsupported private receipt version");
  return full(payload.receipt);
}

// sdk/client/organization-invoices.ts
function id(value2) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value2)) throw new Error("Invalid organization invoice identifier");
  return value2;
}
var OrganizationInvoiceClient = class {
  constructor(client, organizationId) {
    this.client = client;
    this.organizationId = organizationId;
    id(organizationId);
  }
  client;
  organizationId;
  path() {
    return `/v1/organizations/${this.organizationId}/invoices`;
  }
  save(requestId, invoice, signal) {
    return this.client.request(this.path(), "POST", { requestId: id(requestId), invoice }, signal);
  }
  get(invoiceId, signal) {
    return this.client.request(`${this.path()}/${id(invoiceId)}`, "GET", void 0, signal);
  }
  list(before, signal) {
    if (before !== void 0 && (!Number.isSafeInteger(before) || before < 1)) throw new Error("Invalid invoice cursor");
    return this.client.request(this.path() + (before === void 0 ? "" : `?before=${before}`), "GET", void 0, signal);
  }
};
export {
  BrowserProver,
  CoreApiError,
  HttpGateway,
  INVOICE_SIGNING_RECIPIENT,
  InvoiceLibrary,
  ORGANIZATION_PERMISSIONS,
  ORGANIZATION_ROLES,
  ORGANIZATION_ROLE_PERMISSIONS,
  OperationJournal,
  OrganizationApiError,
  OrganizationClient,
  OrganizationInvoiceClient,
  RECEIPT_FIELDS,
  SettlementSession,
  activityKinds,
  assertInvoiceReferenceAvailable,
  browserInvoiceLibraryStorage,
  browserJournalStorage,
  canonical,
  corporateContent,
  corporateId,
  corporateQuote,
  corporateSettlementGuards,
  createInvoice,
  createPrivateNote,
  createReceipt,
  discloseReceipt,
  encryptNoteBackup,
  encryptReceiptBackup,
  feeQuote,
  invoiceFromFragment,
  invoiceHash,
  invoiceLink,
  invoiceMessage,
  invoicePaymentRoots,
  invoiceProof,
  invoiceQuote,
  invoiceRoot,
  invoiceRootsFromHash,
  invoiceSettlementGuards,
  invoiceSigningDigest,
  invoiceStatusRequest,
  matchInvoicePlan,
  matchInvoiceProof,
  nonceBytes,
  noteDomain,
  noteHash,
  openNoteBackup,
  openReceiptBackup,
  organizationLoginMessage,
  organizationOrigin,
  organizationSigningDigest,
  parseActivityPage,
  parseApprovedGroups,
  parseDepositPlan,
  parseDepositRequest,
  parseGroupCapacity,
  parseIndexStatus,
  parseInvoice,
  parseOrganizationChallenge,
  parsePolicy,
  parseProofBundle,
  parseProvingAction,
  parseProvingContext,
  parseRecipientReadiness,
  parseSignedInvoice,
  prepareInvoiceProof,
  preparedPayment,
  requireOpenInvoice,
  sha256,
  validatePrivateNote,
  verifyCorporatePayment,
  verifyProvingAssets,
  verifyReceiptDisclosure,
  verifySignedInvoice
};
