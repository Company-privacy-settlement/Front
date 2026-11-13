export type DocSection = { id: string; title: string; paragraphs?: string[]; bullets?: string[]; steps?: string[]; code?: { label: string; text: string }; table?: { headings: string[]; rows: string[][] }; diagram?: boolean };
export type Doc = { slug: string; title: string; description: string; source: string; sections: DocSection[] };
export const docHref = (slug: string) => slug ? '/docs/' + slug + '/' : '/docs/';
export const docs: Doc[] = [
  {
    "slug": "",
    "title": "Getting started",
    "description": "Understand Core, prepare a trusted settlement group, and follow a private note to a confirmed payout.",
    "source": "https://github.com/Company-privacy-settlement/Core",
    "sections": [
      {
        "id": "overview",
        "title": "Private settlement on NEAR",
        "paragraphs": [
          "Core is a development protocol for business payments and employee transfers. Independent vaults hold principal. A shared zero-knowledge note set lets a holder authorize a payout from one verified vault, with selected evidence for reconciliation.",
          "The current implementation supports native NEAR shared groups and token-bound USDC/NEP-141 groups. The browser workspace executes prepared testnet FT plans. FT note creation, encrypted backups and public deposit preparation are available on Private notes. Groth16 spend proof generation remains in the local Core CLI."
        ]
      },
      {
        "id": "before-you-start",
        "title": "Before you start",
        "bullets": [
          "Obtain a deployment policy independently from your group operator. Check its network, registry, token, denomination, fee recipient, and contract/verifier hashes.",
          "Use a compatible NEAR testnet wallet and fund the accounts needed by your deployment. No funded public deployment is bundled with this site.",
          "Run the matching read-only Core API and finalized index. Keep wallet keys, private notes, passwords, and business documents outside API requests.",
          "Keep encrypted private-note backups and a separate encrypted browser-operation backup. The journal is not a backup of spendable notes."
        ]
      },
      {
        "id": "local-setup",
        "title": "Run local verification",
        "paragraphs": [
          "Check out Core and Contract as siblings. Core requires Node.js 22.13.0 or later. Contract builds also require its pinned Rust toolchain and C/C++ build tools."
        ],
        "code": {
          "label": "Terminal · from your workspace",
          "text": "git clone https://github.com/Company-privacy-settlement/Contract.git\ngit clone https://github.com/Company-privacy-settlement/Core.git\ncd Core\nnpm ci\nnpm run check\nnpm test\n\n# Build the sibling contracts for the local-chain demo.\n(cd ../Contract && npm ci)\nnpm run contract:build\nnpm run zk:setup\nnpm run demo:ft"
        }
      },
      {
        "id": "first-payment",
        "title": "Your first settlement",
        "steps": [
          "Verify a trusted group and create an encrypted private note locally.",
          "Deposit its fixed principal into a verified vault, adding the deposit fee and applicable NEAR costs.",
          "Generate a local withdrawal proof bound to a funded payout vault, recipient, and disclosure reference.",
          "Open Settlements, verify the API against your independent policy, connect your wallet, and unlock the operation journal.",
          "Import the public plan. Review prerequisite and payment calls one at a time before wallet approval.",
          "Confirm finalized state and indexed settlement records. Export the evidence you need."
        ]
      },
      {
        "id": "repositories",
        "title": "Where the code lives",
        "table": {
          "headings": [
            "Repository",
            "Responsibility"
          ],
          "rows": [
            [
              "Contract",
              "NEAR Rust contracts, shared forest/vaults, ZK circuits, public vectors, and WASM builds."
            ],
            [
              "Core",
              "Local CLI/proving, wallet SDK, read-only API, finalized index, and evidence verification."
            ],
            [
              "Front",
              "Documentation, recipient-issued invoices, checkout, configured wallet execution, and sample KYB intake."
            ]
          ]
        }
      }
    ]
  },
  {
    "slug": "architecture",
    "title": "Architecture",
    "description": "Distributed principal custody, one shared note tree, and a globally enforced spend rule.",
    "source": "https://github.com/Company-privacy-settlement/Contract/blob/main/docs/SHARED.md",
    "sections": [
      {
        "id": "custody",
        "title": "Independent vaults, shared proof state",
        "paragraphs": [
          "The forest creates keyless child vaults and maintains a shared append-only Poseidon tree, global spent nullifiers, and payout reservations. Deposit principal stays in the selected vault. The forest coordinates settlement and separate protocol/storage fees.",
          "A note deposited through vault A can withdraw from vault B’s available liquidity. One selected vault pays the proof-bound recipient directly. Principal does not travel through a sequence of vault-to-vault hops."
        ],
        "diagram": true
      },
      {
        "id": "notes",
        "title": "What a private note represents",
        "paragraphs": [
          "A commitment is derived from a note’s secret, nullifier, and group domain. A note does not encode its origin vault. A Groth16 membership proof authorizes a spend without naming the input commitment.",
          "Private note transfers append new output commitments without moving backing between vaults. The global nullifier set prevents the same input note being paid twice across the group."
        ]
      },
      {
        "id": "binding",
        "title": "Bind every payout destination",
        "bullets": [
          "The proof context binds the operation, group domain, selected payout vault, recipient, and disclosure reference.",
          "Native NEAR v2 and token-bound v3 use distinct domains. V3 also binds the token contract.",
          "Retries retain the original vault and recipient. They do not reset a nullifier or authorize redirection.",
          "Clients verify pinned registry/vault bytecode, empty access-key lists, configuration, and liquidity at a finalized block."
        ]
      },
      {
        "id": "capacity",
        "title": "Group boundaries and capacity",
        "paragraphs": [
          "Each group has a depth-8 tree with 256 total outputs, including transferred outputs. Capacity is shared across the group, not multiplied by its vault count. A full group can still process valid withdrawals.",
          "Assets and groups have separate proof domains. More vaults distribute custody; they do not create a measured anonymity guarantee or private cross-group bridge."
        ]
      }
    ]
  },
  {
    "slug": "payments",
    "title": "Payments & fees",
    "description": "Follow deposits and payouts, preserve principal, and understand the costs added on top.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/OPERATIONS.md",
    "sections": [
      {
        "id": "deposit",
        "title": "Deposit a fixed-denomination note",
        "steps": [
          "Create and encrypt a note locally, then discover a verified vault with deposit capacity.",
          "Prepare the public deposit plan and complete required token registrations or NEAR storage-credit top-ups.",
          "Approve principal plus the 0.15% deposit fee. Account for NEAR storage and gas separately.",
          "Wait for finalized deposit Active state. A submitted wallet transaction does not establish acceptance."
        ]
      },
      {
        "id": "browser-notes",
        "title": "Create a note in your browser",
        "steps": [
          "Import an independently approved testnet FT policy on Private notes. Create and confirm a passphrase, then generate a note locally. No wallet or API is needed for generation.",
          "Download the encrypted note and reopen that file with its passphrase to verify the full policy and commitment. Keep the file and passphrase separately; locking or leaving requires the backup to reopen it.",
          "Enter the matching Core API and your receipt root, or generate a fresh random reference for a deposit without evidence. Optionally choose a vault; the default scan verifies up to 20 registry records.",
          "Prepare and inspect the public deposit plan. Download it and import it in Settlements with the same policy, then approve each registration, storage and payment call. A plan does not reserve capacity or confirm payment.",
          "Keep the encrypted note for CLI withdrawal proving. Browser note backups work directly with shared-spend-args or group-spend-args; private notes and passwords never reach the API."
        ],
        "paragraphs": [
          "Page-hide and persisted browser-cache return lock the active note and invalidate unfinished work before restoring a private view. Reopen the encrypted backup to continue. This does not guarantee physical memory erasure."
        ]
      },
      {
        "id": "withdraw",
        "title": "Pay a recipient",
        "paragraphs": [
          "Generate a proof locally using your note and the verified shared tree. Select a verified vault with available liquidity and bind the recipient and disclosure reference.",
          "The note provides the principal. The fee payer separately covers the withdrawal protocol fee and applicable NEAR costs. The recipient receives the full fixed-denomination principal."
        ]
      },
      {
        "id": "fees",
        "title": "0.15% added on each side",
        "paragraphs": [
          "Fees are calculated per note at 15 basis points, rounded down in atomic units. NEAR gas, token registration, storage credit, and first-use bonds are separate. Review the actual preflight quote."
        ],
        "table": {
          "headings": [
            "Operation · 1 USDC principal",
            "Protocol fee",
            "Principal result"
          ],
          "rows": [
            [
              "Deposit",
              "0.0015 USDC added · 1.0015 USDC token transfer",
              "A private note representing 1 USDC."
            ],
            [
              "Withdrawal",
              "0.0015 USDC paid separately",
              "The recipient receives 1 USDC from vault liquidity."
            ],
            [
              "Deposit then withdrawal",
              "0.003 USDC total protocol fees",
              "The principal remains 1 USDC."
            ]
          ]
        }
      },
      {
        "id": "near-costs",
        "title": "Keep NEAR costs separate",
        "paragraphs": [
          "For a native 1 NEAR note, the current 0.02 NEAR storage charge gives a 1.0215 NEAR deposit attachment. Withdrawal attaches 0.0215 NEAR separately while the recipient receives 1 NEAR. Network gas is additional.",
          "FT groups keep token principal/fees separate from NEAR storage and gas. A token symbol is not a trust anchor: use the independently pinned token account and reviewed metadata."
        ]
      },
      {
        "id": "confirmation",
        "title": "Confirm before treating it as paid",
        "bullets": [
          "Check finalized deposit Active or withdrawal Complete state with the expected bindings.",
          "Reconcile invoices against finalized withdrawal_succeeded records.",
          "Check index coverage and its checkpoint. Refreshing the index is not a latest-chain assertion.",
          "A redirect, wallet callback, transaction hash, or timeout is not a final payment result."
        ]
      },
      {
        "id": "recipient-preparation",
        "title": "Prepare the receiving account",
        "paragraphs": [
          "Use Check recipient on the invoice form before signing, or in checkout after independently importing the trusted policy and verifying its API. Prepared withdrawals also offer this check for their bound recipient. No wallet connection is needed for this read-only lookup.",
          "Account activation, token registration and payment review are separate steps. A pre-registered token record does not activate a missing account. Activate the exact account with a compatible NEAR wallet, then refresh. The app does not estimate an account-creation amount or send a funding transfer.",
          "For an existing, unregistered account, inspect the public storage_deposit call and exact token storage minimum read at the checked final block. The payment session presents registration separately for wallet approval; gas and protocol fees remain separate.",
          "Ready for payment review is a snapshot of account existence and registration. It does not establish ownership, available gas, payer balance, vault liquidity or payment completion. Changing recipient, policy or API invalidates the result; failed refreshes clear previous readiness."
        ]
      }
    ]
  },
  {
    "slug": "invoices",
    "title": "Invoices & checkout",
    "description": "Let a recipient sign a request, share its checkout link, and reconcile confirmed payouts.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/INVOICES.md",
    "sections": [
      {
        "id": "issue",
        "title": "Issue a signed request",
        "steps": [
          "Open Invoices and import an independently trusted testnet FT policy. Enter the matching API origin.",
          "Connect a merchant wallet supporting compatible NEP-413 message signing.",
          "Set the payout account, title/reference, 1–32 fixed-denomination units, and expiry.",
          "Review and sign. Download the signed JSON and share the checkout link through your own channel."
        ],
        "paragraphs": [
          "Signing is off-chain and creates no application signing key. The API checks that the signer is a current merchant FullAccess key. Wallet control does not establish legal identity or KYB approval."
        ]
      },
      {
        "id": "library",
        "title": "Keep an encrypted invoice library",
        "paragraphs": [
          "On Invoices, connect the merchant wallet and create or unlock Your invoice library with a passphrase of 12–1,024 characters. Saving is explicit: create or open a signed invoice, then choose Save displayed invoice. Up to 100 requests can be kept per merchant/network.",
          "Titles, references, policies and signatures are encrypted in this browser. Search the saved list and open a request to reuse its payment link. The library makes no API requests and stores no paid-status cache; refresh the opened invoice against its matching API for current indexed settlement.",
          "Export an encrypted backup and retain its passphrase separately. Restore requires empty storage; an unlocked library can merge another encrypted backup, including one with a different passphrase. Conflicting signed terms are rejected instead of overwriting an existing ID.",
          "Locking hides the library and an invoice opened from it. Switching merchant accounts closes the previous account’s library. Separately opened public files, shared links and current editor drafts remain readable in their own contexts. Removing a local copy does not cancel a signed invoice or change payment state."
        ]
      },
      {
        "id": "checkout",
        "title": "Pay the signed terms",
        "steps": [
          "Open the request and review its recipient, asset, principal, fees, and deadline.",
          "Independently verify the group and merchant. Connect the payer wallet and unlock an encrypted journal.",
          "Select a payment unit, download its proof action, and generate a withdrawal proof locally.",
          "Import the prepared public plan and approve reviewed calls one at a time. Use a different reference for each remaining unit."
        ]
      },
      {
        "id": "references",
        "title": "A distinct reference per payment unit",
        "paragraphs": [
          "Terms v2 contain one signed random nonce per unit, deriving a separate disclosure reference for each payment. Legacy v1 requests retain their original common reference.",
          "Checkout rejects references already observed as paid. This is an indexed application guard, not an on-chain reservation. Concurrent payers or index lag can still cause reuse or overpayment; actual payouts remain counted."
        ],
        "code": {
          "label": "Terminal · select payment unit 1",
          "text": "npm run cli -- invoice-action trusted-policy.json \\\n  signed-invoice.json invoice-action.json 1\nnpm run cli -- shared-spend-args trusted-policy.json \\\n  https://rpc.testnet.near.org encrypted-note.json \\\n  invoice-action.json public-payment.json"
        }
      },
      {
        "id": "states",
        "title": "Read the settlement state",
        "table": {
          "headings": [
            "State",
            "Meaning at the index checkpoint"
          ],
          "rows": [
            [
              "Awaiting / partial",
              "No confirmed principal, or only part of the requested principal."
            ],
            [
              "Paid / paid late",
              "Exactly the requested principal, with timing distinguished by finalized records."
            ],
            [
              "Overpaid",
              "Excess principal requiring merchant reconciliation."
            ],
            [
              "Expired / partial expired",
              "The deadline has passed with an outstanding balance."
            ],
            [
              "Review required",
              "The known journal or bounded confirmation scan is incomplete."
            ]
          ]
        }
      },
      {
        "id": "sharing",
        "title": "Sharing, retention, and recovery",
        "paragraphs": [
          "Terms remain client-held. Link/JSON holders can read the business terms and derive its references. A fragment is omitted from the initial page URL request; page code, extensions, and link holders can still read it. Hosting access controls apply to shared checkout links.",
          "Save the signed invoice before leaving. The API does not store an invoice inbox or send webhooks. Expiry is an application rule; contracts may settle late. Recovery keeps the original payout destination after expiry."
        ]
      },
      {
        "id": "recipient-preparation",
        "title": "Prepare the receiving account",
        "paragraphs": [
          "Use Check recipient on the invoice form before signing, or in checkout after independently importing the trusted policy and verifying its API. Prepared withdrawals also offer this check for their bound recipient. No wallet connection is needed for this read-only lookup.",
          "Account activation, token registration and payment review are separate steps. A pre-registered token record does not activate a missing account. Activate the exact account with a compatible NEAR wallet, then refresh. The app does not estimate an account-creation amount or send a funding transfer.",
          "For an existing, unregistered account, inspect the public storage_deposit call and exact token storage minimum read at the checked final block. The payment session presents registration separately for wallet approval; gas and protocol fees remain separate.",
          "Ready for payment review is a snapshot of account existence and registration. It does not establish ownership, available gas, payer balance, vault liquidity or payment completion. Changing recipient, policy or API invalidates the result; failed refreshes clear previous readiness."
        ]
      }
    ]
  },
  {
    "slug": "groups",
    "title": "Groups & capacity",
    "description": "Choose an independently approved group for new deposits and keep existing notes on their original recovery path.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/GROUPS.md",
    "sections": [
      {
        "id": "approval",
        "title": "Import your approved groups",
        "paragraphs": [
          "In Settlements, open Choose from approved groups and import your independently obtained directory. It contains 1–8 pinned policies, unique group IDs and an explicit depositsEnabled preference. Every entry shares the same network, token and denomination. The browser workspace accepts testnet FT groups.",
          "The file is validated locally and stays in memory. It contains no API origins, private notes or passwords. Enter each group’s HTTPS Core API separately; localhost HTTP is supported for local use. Importing the directory makes no network requests."
        ]
      },
      {
        "id": "check",
        "title": "Check capacity before selecting",
        "steps": [
          "Enter the Core API for a group and choose Check. The API policy must match every independently approved pin.",
          "Review the reported block, remaining output slots and whether the first verified member can accept a deposit.",
          "Choose Use for deposits for an enabled group with observed capacity. Selection checks the API again.",
          "Download the selected policy for local CLI preparation, connect your wallet and unlock that group’s encrypted journal."
        ],
        "paragraphs": [
          "Each group has 256 total tree outputs, including private-transfer outputs. Withdrawals do not restore capacity. The capacity endpoint checks the registry and at most the first member; a partial scan with no observed eligible vault is not proof that every vault is unavailable. Use the CLI for complete verified member discovery.",
          "This snapshot reserves no output slot and does not establish wall-clock freshness of the RPC chain head. A failed refresh or edited API address invalidates the previous result. Payment review still performs fresh preflight and liquidity checks."
        ]
      },
      {
        "id": "recovery",
        "title": "Keep the original group for recovery",
        "paragraphs": [
          "Full or deposit-disabled groups remain selectable with Use for recovery. The workspace verifies that group’s API and opens its own journal namespace. New deposit imports are blocked in recovery mode, while existing journal operations retain their retry/refund paths.",
          "Choose the group in which the original note was created. Imported public plans must match that policy. A different available group cannot replace an existing note’s domain, payout vault or signed invoice policy. Lock the journal before changing groups.",
          "If funds have not been sent and the original group fills, generate a fresh note for another approved group. Keep every funded note and its original trusted policy for withdrawal. Group changes do not migrate notes or merge privacy sets."
        ]
      },
      {
        "id": "cli",
        "title": "Prepare notes and plans locally",
        "code": {
          "label": "Terminal · from Core",
          "text": "npm run cli -- groups-status approved-groups.json https://rpc.testnet.near.org\nnpm run cli -- group-note approved-groups.json https://rpc.testnet.near.org receiver-note.encrypted.json\nnpm run cli -- group-deposit-args approved-groups.json https://rpc.testnet.near.org receiver-note.encrypted.json FRESH_DISCLOSURE_ROOT\nnpm run cli -- group-spend-args approved-groups.json https://rpc.testnet.near.org original-note.encrypted.json withdraw-action.json public-withdrawal.json"
        },
        "paragraphs": [
          "Set CORE_NOTE_PASSWORD securely as described in the Core guide; never pass it as a command argument or upload a private note to the API. The Private notes page opens compatible browser backups locally. group-note follows the directory order or an explicit group preference. Existing notes remain group-bound.",
          "Protocol fees remain 0.15% added on top of principal for each deposit and withdrawal. Token registration, NEAR storage and gas remain separate. Contracts and groups must already be deployed and independently approved."
        ]
      },
      {
        "id": "invoices",
        "title": "Invoices remain group-bound",
        "paragraphs": [
          "Checkout verifies the policy in the merchant’s signed invoice and does not expose group switching. If a merchant needs a new group for new payments, they must issue a new signed invoice for that independently trusted policy. Existing funded notes can still pay an invoice matching their original group."
        ]
      }
    ]
  },
  {
    "slug": "privacy",
    "title": "Privacy & evidence",
    "description": "Understand the private proof statement, public metadata, and the claims selected evidence can support.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY.md",
    "sections": [
      {
        "id": "proof",
        "title": "The proof hides the input note",
        "paragraphs": [
          "Groth16 proves a valid spend from the shared tree without naming the input commitment. A global nullifier prevents reuse, and the action context binds the destination.",
          "Principal remains in independent vaults. More public hops or more vaults alone do not establish a larger effective anonymity set."
        ]
      },
      {
        "id": "public",
        "title": "What remains visible",
        "paragraphs": [
          "Small groups, address reuse, funding provenance, and matching timing can correlate deposits and payouts. The protocol does not provide network-layer anonymity or measure an effective anonymity set."
        ],
        "table": {
          "headings": [
            "Observer",
            "Information available"
          ],
          "rows": [
            [
              "Public chain observer",
              "Commitments, vault funding/balances, signers, assets, amounts, payout vault, recipient, timing, nullifiers, and disclosure references."
            ],
            [
              "Invoice link holder",
              "Signed terms and derivation inputs for all payment references."
            ],
            [
              "API / RPC",
              "Public preparation/status requests, addresses, and invoice-reference associations."
            ],
            [
              "Evidence recipient",
              "Selected fields and transaction records you explicitly disclose."
            ]
          ]
        }
      },
      {
        "id": "selective",
        "title": "Selective disclosure commitments",
        "paragraphs": [
          "Salted Merkle commitments support selected receipt fields and openings against a root. Unrelated fields can remain undisclosed.",
          "An opening proves integrity against that commitment. Proving a payout additionally requires matching finalized evidence. Keep legal names, payroll documents, and statutory forms in separately encrypted off-chain storage."
        ]
      },
      {
        "id": "evidence",
        "title": "Match each claim to its evidence",
        "paragraphs": [
          "These claims do not establish complete company history, identity by wallet signature, or tax filing acceptance. Development setup and local verification do not replace a production security review."
        ],
        "table": {
          "headings": [
            "Evidence",
            "Supported claim"
          ],
          "rows": [
            [
              "Merchant signature",
              "The signing wallet authorized these invoice terms."
            ],
            [
              "Finalized records",
              "Selected bound payout observations at the reported checkpoint."
            ],
            [
              "Selected field openings",
              "Disclosed values match a receipt commitment."
            ],
            [
              "Provider attestation",
              "Requires a real KYB provider/issuer integration; the current intake issues none."
            ]
          ]
        }
      },
      {
        "id": "local-library",
        "title": "Encrypted terms stay client-held",
        "paragraphs": [
          "The invoice library encrypts saved signed requests with AES-256-GCM and a passphrase-derived key. It uses its own authenticated storage format and merchant/network namespace, separate from the operation journal. Saving, opening, searching and backing up library entries sends no terms to Core.",
          "This archive verifies signed-term integrity locally. It does not certify legal identity, current merchant key permissions, payment completion or statutory retention. Shared payment links and individual signed JSON exports still reveal their terms to holders."
        ]
      }
    ]
  },
  {
    "slug": "kyb",
    "title": "Business verification",
    "description": "Prepare company information in stages, keeping provider review separate from wallet ownership.",
    "source": "https://github.com/Company-privacy-settlement/Front/blob/main/src/lib/kyb.ts",
    "sections": [
      {
        "id": "scope",
        "title": "Current intake scope",
        "paragraphs": [
          "Business verification is a six-page sample intake: overview, business, people/ownership, documents, review, and status. It distinguishes the US, Abu Dhabi mainland, and ADGM.",
          "The sample checklist is not a determination of legal requirements. Registry checks, identity review, screening, and provider decisions are not connected."
        ]
      },
      {
        "id": "prepare",
        "title": "Prepare the request",
        "steps": [
          "Business: describe the entity, jurisdiction, address, activity, and intended payment use.",
          "People: identify the representative, natural-person owners, and controlling persons.",
          "Documents: select sample registration, address, ownership/control, and authority-to-act metadata.",
          "Review: resolve missing information and acknowledge authority before local preparation.",
          "Status: distinguish preparation from provider receipt, review, decision, and credential issuance."
        ]
      },
      {
        "id": "data",
        "title": "Data stays in this workspace session",
        "paragraphs": [
          "Drafts live in memory. Reloading or leaving KYB clears them. Inputs retain sample file name/type/size; document contents are not read or uploaded.",
          "The sample export sets verified: false, credentialIssued: false, and providerSubmission: not_sent. Preparation does not unlock payments or issue an on-chain credential."
        ]
      },
      {
        "id": "provider",
        "title": "What a provider integration must add",
        "bullets": [
          "Entity, beneficial-owner and identity review, screening, and follow-up evidence.",
          "Authenticated case references and explicit review decisions.",
          "A trusted issuer, signed subject binding, validity, and revocation/freshness checks.",
          "Access-controlled encrypted document storage and a retention policy."
        ]
      }
    ]
  },
  {
    "slug": "sdk-api",
    "title": "SDK & API",
    "description": "Connect local proving and wallet execution to a read-only API and durable finalized index.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/OPERATIONS.md",
    "sections": [
      {
        "id": "service",
        "title": "Run the read-only service",
        "paragraphs": [
          "Use an actual reviewed policy and matching RPC. The API defaults to loopback. Set an exact Front CORS origin; a hosted HTTPS Front needs a reachable HTTPS API. Send public operation data, never wallet secrets or private notes."
        ],
        "code": {
          "label": "Terminal · from Core",
          "text": "export CORE_POLICY_FILE=/absolute/path/to/trusted-policy.json\nexport CORE_RPC_URL=https://rpc.testnet.near.org\nexport CORE_ALLOWED_ORIGINS=https://your-front-origin.example\nexport CORE_INDEX_DB=/absolute/path/to/settlement.sqlite\nnpm run index -- once\nnpm run serve\n\n# In a separate process, keep indexing new records.\nnpm run index -- watch"
        }
      },
      {
        "id": "endpoints",
        "title": "HTTP endpoints",
        "table": {
          "headings": [
            "Method",
            "Path",
            "Purpose"
          ],
          "rows": [
            [
              "GET",
              "/healthz",
              "Configuration status; not chain readiness."
            ],
            [
              "GET",
              "/readyz",
              "Verified deployment and attached-index readiness snapshot."
            ],
            [
              "GET",
              "/v1/config",
              "Public policy for independent comparison."
            ],
            [
              "GET",
              "/v1/group/capacity",
              "Pinned tree capacity and first-member deposit observation."
            ],
            [
              "GET",
              "/v1/vaults",
              "Verified finalized vault discovery."
            ],
            [
              "POST",
              "/v1/ft/preflight",
              "Balances, registrations, storage prerequisites, and costs."
            ],
            [
              "POST",
              "/v1/settlements/status",
              "Bound finalized state and permitted recovery."
            ],
            [
              "POST",
              "/v1/transactions/verify",
              "Exact finalized wallet-call verification."
            ],
            [
              "POST",
              "/v1/invoices/verify",
              "Merchant signature and current FullAccess key."
            ],
            [
              "POST",
              "/v1/invoices/status",
              "Indexed invoice totals, references, timing, and coverage."
            ],
            [
              "GET",
              "/v1/index/status",
              "Checkpoint, provenance, and discovery coverage."
            ],
            [
              "GET",
              "/v1/activity",
              "Public journal events with stable filtered pagination."
            ]
          ]
        }
      },
      {
        "id": "client",
        "title": "Browser SDK and wallet execution",
        "paragraphs": [
          "Front vendors Core’s browser-safe SDK/declarations with a SHA-256 manifest checked at build. Wallets sign each reviewed call; no service signing key is used.",
          "Build the bundle in Core and synchronize it into Front. This repository workflow does not require a published npm package."
        ],
        "code": {
          "label": "Terminal · sibling repositories",
          "text": "cd Core\nnpm run build:client\ncd ../Front\nnpm run sync:core\nnpm run verify:core\nnpm run build"
        }
      },
      {
        "id": "index",
        "title": "Index coverage and failure states",
        "paragraphs": [
          "SQLite persists journal records, checkpoints, and verified provenance. V2 invoice lookup uses a disclosure-root index for up to 32 signed-derived references, with bounded matching-record reads.",
          "Errors distinguish disabled, not-ready, and failed reads. Incomplete coverage yields review_required. The checkpoint is not a latest-chain assertion or proof of complete company history."
        ]
      },
      {
        "id": "api-protection",
        "title": "API limits and cancellation",
        "paragraphs": [
          "The default API permits two concurrent work requests and 120 weighted points per direct socket peer per minute. Capacity/catalog/readiness queries cost 5 points. Per-route source-read budgets and a 15-second deadline bound each request. Rate or concurrency rejections provide Retry-After; clients do not automatically repeat wallet signatures.",
          "The CLI server cancels its HTTP RPC transport on timeout or disconnect. Non-cancellable adapters keep their work slot until underlying reads settle. Forwarding headers are ignored; clients behind a proxy share its peer budget unless the edge enforces individual limits.",
          "/healthz checks liveness. /readyz verifies the deployment and, when attached, index age, block lag and current journal count. Set CORE_API_REQUIRE_INDEX=true to require an index. Readiness is a snapshot, not complete provenance or a guarantee of payment liquidity."
        ]
      },
      {
        "id": "recipient-readiness",
        "title": "Recipient readiness",
        "paragraphs": [
          "POST /v1/recipients/readiness accepts only a public recipient account. The server verifies the pinned group and reads account existence and token registration at one final block. It returns account_missing, registration_required or ready, with no account-creation estimate or broadcast. The browser client first checks the API policy and rejects substituted destinations or registration calls."
        ],
        "code": {
          "label": "Read-only SDK and CLI",
          "text": "const result = await gateway.recipientReadiness(trustedPolicy, recipient, { signal });\n// result.state, result.checkedAtBlock, result.registrationCall\n\nnpm run cli -- recipient-readiness trusted-policy.json https://rpc.testnet.near.org receiver.testnet"
        }
      },
      {
        "id": "browser-notes",
        "title": "Browser notes and public deposits",
        "paragraphs": [
          "createPrivateNote, encryptNoteBackup and openNoteBackup run locally. The note domain and Poseidon commitment match the existing circuits. The encrypted core-private-note format binds the complete policy and is separate from journal and invoice-library storage.",
          "POST /v1/deposits/prepare accepts only a public commitment, disclosure root and optional vault. The server verifies the original group at one final block and returns a public FT plan and bounded capacity observation. The client checks policy, commitment, reference, vault, token, add-on fee and attachments before returning the plan."
        ],
        "code": {
          "label": "Local backup and public planning",
          "text": "const note = await createPrivateNote(trustedPolicy);\nconst encrypted = await encryptNoteBackup(trustedPolicy, note, passphrase);\nconst restored = await openNoteBackup(downloadedFile, passphrase, trustedPolicy);\nconst result = await gateway.prepareDeposit(trustedPolicy, {\n  commitment: restored.note.commitment, disclosureRoot\n});\n// Import result.plan in the existing wallet session."
        }
      }
    ]
  },
  {
    "slug": "recovery",
    "title": "Recovery & limits",
    "description": "Resolve uncertain wallet results, retain destination bindings, and keep the right backups.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/WALLET.md",
    "sections": [
      {
        "id": "uncertain",
        "title": "An uncertain result is not a failed payment",
        "paragraphs": [
          "The journal records signing intent before invoking the wallet. If a response is lost, another signature stays blocked across reload. Verify the original transaction or bound on-chain record before continuing.",
          "A timeout does not authorize automatic resending. Retain the original operation, nullifier, vault, recipient, and disclosure reference."
        ]
      },
      {
        "id": "retry",
        "title": "Retry only when contract state permits",
        "bullets": [
          "Active deposits and Complete withdrawals are already finished.",
          "NotFound does not trigger automatic resubmission.",
          "Retryable operations expose bound recovery calls. Unacknowledged pending registry requests use the contract’s 20-block delay.",
          "Withdrawal retries keep the original vault and recipient with no second protocol fee. Applicable NEAR storage and gas still apply.",
          "A permanently missing vault payout callback remains conservatively reserved. This version cannot safely reset or redirect it."
        ]
      },
      {
        "id": "backups",
        "title": "Keep each backup separate",
        "paragraphs": [
          "The browser journal uses passphrase-derived encryption and cross-tab exclusion. There is no passphrase recovery. Backup restoration requires empty storage and refuses overwrite.",
          "The optional invoice library has a separate encrypted backup for signed business requests. It does not replace private-note backups or wallet-operation recovery. The service cannot recover a lost library passphrase. Restore into empty library storage or merge after unlocking the existing library.",
          "Browser notes use a separate encrypted single-note file. Download and reopen it before preparing a deposit; it is not persisted in local storage. The backup carries its original policy and can be used in the local CLI for Groth16 spend proving. Locking or leaving does not retain the active note.",
          "Private notes and the invoice library also lock on page-hide and persisted history-cache return. Pending work cannot reopen the locked view. Encrypted invoice-library storage remains intact; a note must be reopened from its saved backup."
        ],
        "table": {
          "headings": [
            "Record",
            "What it preserves"
          ],
          "rows": [
            [
              "Encrypted private note",
              "Local spend secrets; keep separate from public plans."
            ],
            [
              "Encrypted browser journal",
              "Operation metadata and recovery history; not spendable notes."
            ],
            [
              "Signed invoice / evidence export",
              "Authorized terms and selected observations; not an encrypted secret backup or tax certificate."
            ]
          ]
        }
      },
      {
        "id": "limits",
        "title": "Current protocol limits",
        "paragraphs": [
          "Groups use fixed denominations and 256 total outputs. Arbitrary-amount private payments, private cross-group migration, browser proving, and a bundled funded public deployment are outside the current execution interface.",
          "Production use needs independent contract/circuit/SDK review and a reviewed trusted setup. Real KYB decisions, jurisdiction-specific AI preparation, and statutory filing remain separate integrations."
        ]
      }
    ]
  }
];
