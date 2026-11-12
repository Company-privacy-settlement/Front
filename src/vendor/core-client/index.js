// sdk/client/crypto.ts
function canonical(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return JSON.stringify(value);
  if (typeof value === "number" && Number.isSafeInteger(value))
    return String(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (typeof value === "object" && value && Object.getPrototypeOf(value) === Object.prototype)
    return `{${Object.keys(value).sort().map(
      (k) => `${JSON.stringify(k)}:${canonical(value[k])}`
    ).join(",")}}`;
  throw new Error("Unsupported public JSON value");
}
var hex = (bytes2) => [...bytes2].map((b) => b.toString(16).padStart(2, "0")).join("");
async function sha256(value) {
  return hex(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
    )
  );
}
async function shaField(value) {
  const bytes2 = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  );
  bytes2[0] &= 31;
  return BigInt(`0x${hex(bytes2)}`).toString();
}
function base64(bytes2) {
  let s = "";
  for (const b of bytes2) s += String.fromCharCode(b);
  return btoa(s);
}
function bytes(value, max) {
  if (typeof value !== "string" || value.length > max * 2 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
    value
  ))
    throw new Error("Invalid encrypted journal encoding");
  const b = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  if (b.length > max) throw new Error("Journal is too large");
  return b;
}
var ITERATIONS = 25e4;
var AAD = new TextEncoder().encode("core:operation-journal:v1");
async function key(password, salt) {
  if (password.length < 12 || password.length > 1024)
    throw new Error("Use a journal passphrase of 12\u20131024 characters");
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
async function seal(value, password) {
  const plaintext = new TextEncoder().encode(canonical(value));
  if (plaintext.length > 2e6) throw new Error("Journal exceeds 2 MB");
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: AAD },
    await key(password, salt),
    plaintext
  );
  return JSON.stringify({
    format: "core-operation-journal",
    version: 1,
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: base64(salt),
    iv: base64(iv),
    ciphertext: base64(new Uint8Array(encrypted))
  });
}
async function unseal(envelope, password) {
  if (envelope.length > 3e6) throw new Error("Journal exceeds 3 MB");
  const e = JSON.parse(envelope);
  if (e.format !== "core-operation-journal" || e.version !== 1 || e.kdf !== "PBKDF2-SHA256" || e.iterations !== ITERATIONS)
    throw new Error("Unsupported journal envelope");
  const salt = bytes(e.salt, 16), iv = bytes(e.iv, 12);
  if (salt.length !== 16 || iv.length !== 12)
    throw new Error("Invalid journal salt or IV");
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: AAD },
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
function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a public JSON object");
  return value;
}
function account(value) {
  if (typeof value !== "string" || value.length < 2 || value.length > 64 || !/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(value))
    throw new Error("Invalid NEAR account");
  return value;
}
function scalar(value) {
  if (typeof value !== "string" || value.length > 77 || !/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) >= FIELD)
    throw new Error("Invalid scalar");
  return value;
}
function atomic(value) {
  if (typeof value !== "string" || value.length > 39 || !/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) >= 1n << 128n)
    throw new Error("Invalid atomic amount");
  return value;
}
function hash(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value))
    throw new Error("Invalid hash");
  return value;
}
function exact(value, keys) {
  if (Object.keys(value).sort().join("|") !== keys.sort().join("|"))
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
function vault(value, policy) {
  const v = account(value);
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
  lock() {
    this.password = "";
  }
  async read() {
    if (!this.password) throw new Error("Journal is locked");
    const e = await this.storage.read();
    if (e === null)
      throw new Error("Create or restore an encrypted journal first");
    return validate(await unseal(e, this.password));
  }
  async create() {
    return this.storage.exclusive(async () => {
      if (await this.storage.read() !== null)
        throw new Error("A journal already exists; unlock it instead");
      await this.storage.write(
        await seal({ version: 1, operations: [] }, this.password)
      );
    });
  }
  async list() {
    return this.storage.exclusive(() => this.read());
  }
  async export() {
    return this.storage.exclusive(async () => {
      await this.read();
      return await this.storage.read();
    });
  }
  async restore(envelope) {
    return this.storage.exclusive(async () => {
      if (await this.storage.read() !== null)
        throw new Error(
          "Restore into an empty journal storage to preserve existing operations"
        );
      await validate(await unseal(envelope, this.password));
      await this.storage.write(envelope);
    });
  }
  async update(fn) {
    return this.storage.exclusive(async () => {
      const operations = await this.read();
      const persist = async () => {
        await validate({ version: 1, operations });
        await this.storage.write(
          await seal({ version: 1, operations }, this.password)
        );
      };
      return fn(operations, persist);
    });
  }
};
function browserJournalStorage(key2 = "core-live-journal-v1") {
  return {
    read: async () => localStorage.getItem(key2),
    write: async (e) => {
      localStorage.setItem(key2, e);
      if (localStorage.getItem(key2) !== e)
        throw new Error("Journal persistence failed");
    },
    exclusive: async (fn) => {
      if (!navigator.locks)
        throw new Error("This browser needs Web Locks to sign safely");
      return navigator.locks.request(
        key2,
        { mode: "exclusive", ifAvailable: true },
        async (lock) => {
          if (!lock)
            throw new Error(
              "Journal is in use by another tab or signing request"
            );
          return fn();
        }
      );
    }
  };
}

// sdk/client/session.ts
var SettlementSession = class {
  constructor(journal, gateway, wallet, policy) {
    this.journal = journal;
    this.gateway = gateway;
    this.wallet = wallet;
    this.policy = parsePolicy(policy);
  }
  journal;
  gateway;
  wallet;
  policy;
  async trusted() {
    if (canonical(parsePolicy(await this.gateway.policy())) !== canonical(this.policy))
      throw new Error(
        "API policy differs from the independently trusted policy"
      );
  }
  async identity(payer) {
    const identity = await this.wallet.identity();
    if (identity.network !== this.policy.network || identity.accountId !== payer)
      throw new Error("Connect the reviewed payer on the correct network");
  }
  async importPlan(plan) {
    await this.trusted();
    const identity = await this.wallet.identity();
    account(identity.accountId);
    await this.identity(identity.accountId);
    const prepared = await preparedPayment(
      plan,
      this.policy,
      identity.accountId
    );
    return this.journal.update(async (operations, persist) => {
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
        payer: identity.accountId,
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
  operation(operations, id) {
    const o = operations.find((o2) => o2.id === id);
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
      const call = validatePrerequisite(first, this.policy, o.payer, r), hash3 = await sha256(canonical(call));
      if (o.attempts.some(
        (a) => a.kind === "prerequisite" && a.state === "confirmed" && a.callHash === hash3
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
  async review(id) {
    return this.journal.update(
      async (operations, persist) => this.next(this.operation(operations, id), persist)
    );
  }
  async submitReviewed(id, reviewedCallHash) {
    return this.journal.update(async (operations, persist) => {
      const o = this.operation(operations, id);
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
      const a = {
        kind: review.kind,
        call: review.call,
        callHash: review.callHash,
        recordHash: review.recordHash,
        state: "signing"
      };
      o.attempts.push(a);
      await persist();
      try {
        const tx = await this.wallet.sign(a.call, {
          operationId: id,
          attempt: o.attempts.length - 1,
          identity: { network: this.policy.network, accountId: o.payer }
        });
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
  async reconcile(id, transaction) {
    return this.journal.update(async (operations, persist) => {
      const o = this.operation(operations, id), a = o.attempts.at(-1), tx = transactionRef(transaction);
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

// sdk/client/activity.ts
var activityKinds = [
  "deposit",
  "transfer",
  "withdrawal_requested",
  "withdrawal_failed",
  "withdrawal_retried",
  "withdrawal_succeeded"
];
var count = (v) => {
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 0)
    throw new Error("Invalid index count");
  return v;
};
var hash2 = (v) => {
  if (typeof v !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,64}$/.test(v))
    throw new Error("Invalid chain hash");
  return v;
};
var block = (v) => {
  const b = object(v);
  return { hash: hash2(b.hash), height: count(b.height) };
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
  const indexedRecords = count(s.indexedRecords), linkedRecords = count(s.linkedRecords), c = s.checkpoint === null ? null : object(s.checkpoint), checkpoint = c ? {
    block: block(c.block),
    nextIndex: count(c.nextIndex),
    sourceRecordCount: count(c.sourceRecordCount),
    updatedAt: time(c.updatedAt)
  } : null;
  if (linkedRecords > indexedRecords || checkpoint && (checkpoint.nextIndex !== indexedRecords || checkpoint.sourceRecordCount < indexedRecords) || !checkpoint && indexedRecords !== 0 || s.remainingRecords !== (checkpoint ? checkpoint.sourceRecordCount - indexedRecords : null))
    throw new Error("Inconsistent index coverage");
  const candidates = {};
  for (const [k, v] of Object.entries(object(s.candidates))) {
    if (!["pending", "linked", "unrelated", "invalid"].includes(k))
      throw new Error("Invalid provenance queue state");
    candidates[k] = count(v);
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
        startHeight: count(x.startHeight),
        lastComplete: x.lastComplete === null ? null : block(x.lastComplete),
        current: cur ? {
          block: block(cur.block),
          offset: count(cur.offset),
          total: count(cur.total)
        } : null,
        scannedTransactions: count(x.scannedTransactions),
        candidatesFound: count(x.candidatesFound),
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
  const p = object(input), index = parseIndexStatus(p.index, policy), upper = count(object(p.snapshot).upperExclusive);
  if (p.scope !== "configured_registry_records" || upper > index.indexedRecords || !Array.isArray(p.items) || p.items.length > 50 || p.nextCursor !== null && (typeof p.nextCursor !== "string" || p.nextCursor.length > 1024 || !/^[A-Za-z0-9_-]+$/.test(p.nextCursor)))
    throw new Error("Invalid activity page");
  const items = p.items.map((value) => {
    const item = object(value), r = object(item.record), kind = r.kind;
    if (!activityKinds.includes(kind))
      throw new Error("Unsupported journal event");
    const root = r.disclosure_root;
    if (typeof root !== "string" || !/^[a-f0-9]{64}$/.test(root))
      throw new Error("Invalid receipt root");
    const record = {
      index: count(r.index),
      kind,
      commitment: r.commitment === null ? null : scalar(r.commitment),
      nullifier: r.nullifier === null ? null : scalar(r.nullifier),
      vault: r.vault === null ? null : account(r.vault),
      recipient: r.recipient === null ? null : account(r.recipient),
      disclosure_root: root,
      block_height: count(r.block_height),
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
    const observedAt = block(item.observedAt);
    if (record.block_height > observedAt.height || index.checkpoint && observedAt.height > index.checkpoint.block.height)
      throw new Error("Activity is outside its observed final block");
    let provenance = null;
    if (item.provenance !== null) {
      const a = object(item.provenance), t = object(a.transaction);
      if (!["succeeded", "failed"].includes(String(a.outerOutcome)) || !Array.isArray(a.receipts) || a.receipts.length < 1 || a.receipts.length > 50)
        throw new Error("Invalid provenance");
      provenance = {
        transaction: { hash: hash2(t.hash), signer: account(t.signer) },
        outerOutcome: a.outerOutcome,
        receipts: a.receipts.map((v) => {
          const x = object(v);
          return { id: hash2(x.id), blockHash: hash2(x.blockHash) };
        }),
        verifiedAt: block(a.verifiedAt)
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
  async request(path, body) {
    const r = await fetch(this.url + path, {
      method: body === void 0 ? "GET" : "POST",
      headers: body === void 0 ? {} : { "content-type": "application/json" },
      ...body === void 0 ? {} : { body: JSON.stringify(body) },
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(25e3)
    });
    if (!r.ok) {
      let code;
      try {
        const e = await r.json();
        if ([
          "INDEX_DISABLED",
          "INDEX_NOT_READY",
          "INDEX_READ_FAILED",
          "INVALID_CURSOR"
        ].includes(e.error))
          code = e.error;
      } catch {
      }
      throw new CoreApiError(r.status, code);
    }
    return r.json();
  }
  async policy() {
    return parsePolicy((await this.request("/v1/config")).policy);
  }
  preflight(request) {
    return this.request("/v1/ft/preflight", request);
  }
  observe(reference) {
    return this.request("/v1/settlements/status", reference);
  }
  verify(transaction, call) {
    return this.request("/v1/transactions/verify", { transaction, call });
  }
  async trusted(policy) {
    if (canonical(await this.policy()) !== canonical(policy))
      throw new Error("API policy differs from the trusted group");
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
  constructor(status, code) {
    super(`Core API request failed (${status}${code ? `: ${code}` : ""})`);
    this.status = status;
    this.code = code;
  }
  status;
  code;
};
export {
  CoreApiError,
  HttpGateway,
  OperationJournal,
  SettlementSession,
  activityKinds,
  browserJournalStorage,
  canonical,
  feeQuote,
  parseActivityPage,
  parseIndexStatus,
  parsePolicy,
  preparedPayment,
  sha256
};
