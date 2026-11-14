export type DocSection = { id: string; title: string; paragraphs?: string[]; bullets?: string[]; steps?: string[]; code?: { label: string; text: string }; table?: { headings: string[]; rows: string[][] }; diagram?: boolean; deployment?: 'addresses'|'verification'|'transactions'; links?: {label:string;href:string}[] };
export type Doc = { slug: string; title: string; description: string; source: string; sections: DocSection[] };
export const docHref = (slug: string) => slug ? '/docs/' + slug + '/' : '/docs/';
export const docs: Doc[] = [
  {
    "slug": "",
    "title": "Getting started",
    "description": "Use Money Station, understand the settlement protocol, and follow a private payment through confirmation.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/SERVICE.md",
    "sections": [
      {
        "id": "overview",
        "title": "Private settlement on NEAR",
        "paragraphs": [
          "Money Station is a development protocol for business-to-business payments and business-to-worker or contractor transfers on NEAR. Independent vaults hold principal. Shared zero-knowledge notes authorize a direct payout from one verified funded vault, with recipient-signed invoices and selected evidence for reconciliation.",
          "The current implementation supports native NEAR shared groups and token-bound USDC/NEP-141 groups. The browser executes configured testnet FT plans. Private notes creates encrypted notes and deposit plans; invoice checkout connects an original-group note to local proof generation, fee review, wallet approval and finalized confirmation. Local proofs remains available for standalone proofs and proof-file verification. Native/private-transfer proving remains in the settlement CLI."
        ]
      },
      {
        "id": "before-you-start",
        "title": "Before you start",
        "bullets": [
          "Obtain a deployment policy independently from your group operator. Check its network, registry, token, denomination, fee recipient, and contract/verifier hashes.",
          "Use a compatible wallet and fund the accounts required by your independently reviewed deployment. A native NEAR reference group is published under Contract addresses; browser checkout still needs a separately configured FT group and its services.",
          "Run the matching read-only Settlement API and finalized index. Keep wallet keys, private notes, passwords, and business documents outside API requests.",
          "Keep encrypted private-note backups and a separate encrypted browser-operation backup. The journal is not a backup of spendable notes."
        ],
        "links": [
          {
            "label": "View contract addresses",
            "href": "/docs/deployments/#addresses"
          }
        ]
      },
      {
        "id": "workspaces",
        "title": "Choose a workspace",
        "table": {
          "headings": [
            "Route",
            "Purpose"
          ],
          "rows": [
            [
              "/live/",
              "Settlements: configured testnet FT calls, encrypted recovery journal and indexed activity."
            ],
            [
              "/relay/",
              "Optional relay delivery: sampled windows, receipt-based recovery, waiting/cancellation/expiry and bounded batches. Requires a separately operated relay."
            ],
            [
              "/notes/",
              "Local FT notes, encrypted backups and public deposit preparation."
            ],
            [
              "/prove/",
              "Standalone browser proof generation, artifact integrity and cancellation."
            ],
            [
              "/invoices/",
              "Recipient-signed requests and optional encrypted local invoice library."
            ],
            [
              "/pay/#invoice=…",
              "Signed checkout, recipient preparation and finalized reconciliation."
            ],
            [
              "/evidence/",
              "Private receipt backup, selected disclosure and independent-root integrity checks."
            ],
            [
              "/kyb/",
              "Six-page sample intake; no provider submission or verified credential."
            ],
            [
              "/organization/",
              "Wallet-authenticated organizations, invitations, member roles, ownership and audit history through a separate Organization API."
            ],
            [
              "/rules/",
              "Date- and jurisdiction-bound rule previews and independently signed component reviews."
            ],
            [
              "/docs/deployments/",
              "Reference contract/vault addresses, policy pins and recorded settlement evidence."
            ],
            [
              "/app/",
              "Legacy routes redirect to the corresponding Docs guide."
            ]
          ]
        },
        "paragraphs": [
          "The website and these guides default to English; repository READMEs also support Korean and Simplified Chinese. The Sites preview is owner-private, including checkout links. Self-hosted access follows the host configuration. External customers need suitable access and an independently configured funded deployment."
        ]
      },
      {
        "id": "local-setup",
        "title": "Run local verification",
        "paragraphs": [
          "Check out Core and Contract as siblings. Use Node.js 22.16 or later and the pinned Rust/C/C++ tooling for contract builds.",
          "The November 14, 2026 Core validation passed 595 tests; the latest contract review passed 63 unit cases. Native NEAR public-testnet settlement has separate recorded evidence. Browser tests and local TESTUSD sandbox runs do not establish public USDC, a live backend or production readiness."
        ],
        "code": {
          "label": "Terminal · from your workspace",
          "text": "git clone https://github.com/Company-privacy-settlement/Contract.git\ngit clone https://github.com/Company-privacy-settlement/Core.git\ncd Core\nnpm ci\nnpm run check\nnpm test\n\n# Build the sibling contracts for the local-chain demo.\n(cd ../Contract && npm ci)\nnpm run contract:build\nnpm run zk:setup\n(cd ../Contract && npm run build:test-ft)\nnpm run demo:ft"
        }
      },
      {
        "id": "first-payment",
        "title": "Your first settlement",
        "steps": [
          "Obtain a group policy independently of the API; verify network, registry, token, denomination, treasury and code/verifier hashes. Inspect approved capacity and recipient readiness.",
          "Create an FT note locally in Private notes. Download its encrypted backup and reopen it before preparing a public deposit plan.",
          "Import the deposit plan in Settlements with the same policy and an encrypted journal. Review each prerequisite/payment call, then verify its bound Active record.",
          "In invoice checkout, select a unit and open its original-group encrypted note. Import trusted proving files and an independently obtained manifest hash, then generate the local proof with its signed recipient and reference derived automatically. Local proofs and the CLI remain alternatives.",
          "Import the public withdrawal plan and review each wallet call. A wallet response or timeout does not establish failure or completion.",
          "Confirm the bound withdrawal Complete state and indexed invoice totals/coverage. Keep separate backups and disclose only the evidence you intend to share."
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
        "diagram": true,
        "links": [
          {
            "label": "Inspect registry and vault addresses",
            "href": "/docs/deployments/#addresses"
          }
        ]
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
      },
      {
        "id": "organization-boundary",
        "title": "Organization access is a separate service",
        "paragraphs": [
          "The read-only settlement API serves one independently trusted on-chain group. The Organization API authenticates wallet principals and stores off-chain team membership in a separate database. Organization sessions and roles are never accepted as a private note, invoice signature or settlement policy.",
          "Owner, Admin, Operator, Viewer and Auditor control workspace access. They do not grant a signing key, change a keyless vault or approve a payment. Organization membership does not verify a legal entity or change the hosting access policy."
        ]
      }
    ]
  },
  {
    "slug": "deployments",
    "title": "Contract addresses",
    "description": "Inspect the verified registry, independent vaults and fee account, with explorer links, code pins and public settlement evidence.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/DEPLOYED_ADDRESSES.md",
    "sections": [
      {
        "id": "addresses",
        "title": "Native NEAR contract addresses",
        "paragraphs": [
          "This reference group settles fixed 0.1 NEAR notes on NEAR testnet. It is a native-asset v2 deployment, separate from the browser FT/USDC checkout flow. Addresses below were checked read-only at one canonical FINAL block.",
          "Use reviewed deposit/withdrawal calls and the matching policy. A plain asset transfer to these accounts is not a protocol deposit. The fee recipient is listed separately from the contracts."
        ],
        "deployment": "addresses"
      },
      {
        "id": "verification",
        "title": "Code, policy and snapshot",
        "paragraphs": [
          "Compare these pins with a policy obtained independently from the group operator. The downloadable policy contains no tokenId because this group holds native NEAR. Its contract and vault key lists were empty at verification."
        ],
        "deployment": "verification"
      },
      {
        "id": "scope",
        "title": "What this deployment establishes",
        "table": {
          "headings": [
            "Area",
            "Recorded status"
          ],
          "rows": [
            [
              "Native NEAR CLI settlement",
              "Public deposits, cross-vault payout and original-recipient recovery are recorded."
            ],
            [
              "Browser wallet and public USDC",
              "Not qualified. A separately funded token-bound v3 group and real wallet execution are still required."
            ],
            [
              "Core / indexer / Organization / relay HTTPS",
              "No accepted hosted backend is bundled with this static website."
            ],
            [
              "KYB and tax providers",
              "Adapters and rule gates exist; actual account/case/reviewer qualification remains blocked."
            ],
            [
              "Production safety",
              "Development proving material; no independent production audit or reviewed production setup."
            ]
          ]
        },
        "paragraphs": [
          "The Sites preview remains owner-private; self-hosted access is configured separately. Publishing reference addresses does not configure a wallet policy, provision liquidity or grant site access to an invoice recipient."
        ],
        "links": [
          {
            "label": "Browser USDC qualification",
            "href": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/BROWSER_USDC_TESTNET.md"
          },
          {
            "label": "Backend hosting prerequisites",
            "href": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRODUCTION_HOSTING.md"
          }
        ]
      },
      {
        "id": "transactions",
        "title": "Recorded settlement evidence",
        "paragraphs": [
          "These transactions belong to the original native qualification. Their receipts and historical balances are documented separately from the current address snapshot. Explorer availability alone is not a verification of the code or an audit."
        ],
        "deployment": "transactions",
        "links": [
          {
            "label": "Native run and read-only verifier",
            "href": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/TESTNET_WALLET.md"
          },
          {
            "label": "Contract and corporate payment review",
            "href": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/REVIEW-2026-11-14-PAYMENT-SECURITY.md"
          }
        ]
      },
      {
        "id": "reverify",
        "title": "Reverify the recorded native run",
        "paragraphs": [
          "Run from the Core repository with installed dependencies. The verifier is read-only and needs no wallet key, private note or funded account. It checks the recorded historical snapshot; the current address snapshot above is a separate observation."
        ],
        "code": {
          "label": "Terminal · Core",
          "text": "npm run testnet:verify-wallet -- docs/evidence/testnet-wallet-2026-11-14.json \\\n  e009bd0f600b23e0fabe30064ee3211446682946126d1b341aace34b5981a681 \\\n  /tmp/new-wallet-reverification.json"
        }
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
          "Enter the matching Settlement API and your receipt root, or generate a fresh random reference for a deposit without evidence. Optionally choose a vault; the default scan verifies up to 20 registry records.",
          "Prepare and inspect the public deposit plan. Download it and import it in Settlements with the same policy, then approve each registration, storage and payment call. A plan does not reserve capacity or confirm payment.",
          "Keep the encrypted note for withdrawal proving in Local proofs or the CLI. Browser note backups work directly with shared-spend-args or group-spend-args; private notes and passwords never reach the API."
        ],
        "paragraphs": [
          "Page-hide and persisted browser-cache return lock the active note and invalidate unfinished work before restoring a private view. Reopen the encrypted backup to continue. This does not guarantee physical memory erasure."
        ]
      },
      {
        "id": "browser-proving",
        "title": "Generate and verify a local proof",
        "steps": [
          "Open Local proofs and import the note’s independently trusted testnet FT policy. Reopen its encrypted backup locally; the passphrase and secrets never reach the API.",
          "Select the release’s proving manifest, circuit WASM, proving key and verification-key JSON. Enter the artifact manifest SHA-256 from an independent trusted source. Each file hash and the raw policy verifier binding must match before proving.",
          "Select a verified payout vault in the original group and load its finalized public snapshot, or import the public snapshot JSON. The worker rebuilds the complete ordered tree and checks its root locally.",
          "Set the exact recipient and disclosure root. For invoices, copy the signed recipient and selected unit reference exactly. Generate the proof locally, or cancel to terminate the worker and discard unfinished results.",
          "Download the verified proof file or public withdrawal plan. Verify an existing proof file to check its canonical payload checksum and Groth16 proof again. Import the public plan in Settlements for wallet review and final reconciliation."
        ],
        "paragraphs": [
          "An unsafe development setup remains visibly labeled. File integrity does not qualify the setup ceremony, current liquidity, recipient readiness or final payment. The proof file contains public recipient, vault, reference and nullifier-hash data; keep the encrypted note separately.",
          "Locking, page-hide and persisted cache return cancel pending workers and clear the open note. Cancellation alone keeps the note open for an explicit retry. Physical memory erasure cannot be guaranteed. Connected note-to-invoice proving is available in checkout; physical mobile-device qualification remains separate work."
        ]
      },
      {
        "id": "withdraw",
        "title": "Pay a recipient",
        "paragraphs": [
          "For invoices, choose a unit in checkout, open your saved original-group encrypted note and generate its proof locally. The signed recipient and unit reference are derived automatically. Select an eligible original-group vault. Standalone Local proofs and settlement CLI remain alternatives.",
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
          "FT groups keep token principal/fees separate from NEAR storage and gas. A token symbol is not a trust anchor: use the independently pinned token account and reviewed metadata.",
          "For FT actions, applicable storage is 0.02 NEAR; first-use sender credit adds a 0.005 NEAR ledger bond per target contract. Token registration, account activation, gas and the FT transfer’s one-yocto attachment remain separate. Retrying an existing payout does not charge the protocol fee again."
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
      },
      {
        "id": "receipt-root",
        "title": "Attach a receipt commitment",
        "paragraphs": [
          "Create and back up a private receipt in Evidence. On Private notes, import a selected disclosure with Import receipt root from disclosure JSON. The browser verifies the file locally and puts only its root in the public deposit request. It does not upload business values or opening salts.",
          "Root import does not establish a completed payment or truthful declarations. Failed imports clear the previous root and prepared plan. Keep the full encrypted receipt so you can disclose additional fields later.",
          "Invoice checkout requires its signed-derived per-unit withdrawal reference. An arbitrary receipt root cannot replace that reference. Generic receipt-root actions and invoice-bound withdrawals are distinct; a combined invoice/business-evidence commitment needs a separately designed format."
        ]
      },
      {
        "id": "scheduled-delivery",
        "title": "Choose a delivery window",
        "paragraphs": [
          "Open Scheduled delivery at /relay/ after generating a public withdrawal proof. Import your independently trusted group policy, choose immediate delivery or a randomized window, and review the original recipient, principal and additive 0.15% fee. The configured sponsor pays gas, storage and this fee; principal goes directly from the vault to the recipient.",
          "Save the recovery receipt before confirming. One execution time is persisted for each accepted request; batches contain at most eight separate transactions and never wait for more users. Timing dispersion does not create independent participants or guarantee anonymity. The hosted frontend has no bundled running relay."
        ],
        "steps": [
          "Confirm once and track the waiting window. A visible tab refreshes status with read-only requests. Payment confirmation uses finalized contract state, not transaction acceptance.",
          "Cancel only before execution starts. Expired or cancelled delivery can be explicitly rescheduled with the same request and proof; blocked preflight can be resumed within its original deadline. Cancellation does not revoke a proof already shared elsewhere.",
          "After timeout or reload, import the same policy and recovery receipt, then check the original request. No automatic resend occurs. Reconcile uncertain original hashes before any explicit payout retry."
        ],
        "code": {
          "label": "Core scheduling guide",
          "text": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/SCHEDULED_DELIVERY.md"
        }
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
          "Open the request and review its recipient, asset, principal, fees and deadline.",
          "Independently import the trusted testnet FT policy and verify the matching API/current merchant key. Connect the fee payer wallet and unlock your encrypted journal.",
          "Select Payment unit, open an original-group encrypted note with its passphrase and select a payout vault. Import the reviewed proving files and independently obtained artifact-manifest SHA-256 under Trusted proving files.",
          "Choose Generate invoice proof. The disposable local worker verifies assets, rebuilds the tree and proves the signed recipient and selected unit reference. Cancel proof stops the job without importing or paying.",
          "Choose Review amount & fees. Check full principal, the additive 0.15% withdrawal fee in token atomic units and separate NEAR costs. Approve each prerequisite and payment in the wallet individually.",
          "Wait for the bound finalized withdrawal confirmation; invoice totals are indexed separately. Select a different funded note for each remaining unit and retain encrypted backups through reconciliation."
        ],
        "paragraphs": [
          "Current merchant ownership, invoice availability and local duplicate-note/unit checks run before and after proving, at public-plan import and again before signatures. Switching units or locking clears private note/proof state; public proving files remain available for the next unit.",
          "Checkout polls public recovery up to ten times, two seconds apart, without signing or resending. An uncertain wallet response remains blocked for reconciliation. Fixed-recipient recovery of already accepted funds remains available after expiry or key rotation.",
          "The CLI/public-plan path remains available with the exact selected unit. Independent concurrent payers can still overpay: deadlines and unit caps are application rules, not contract reservations. A prompt already handed to an external wallet can settle late."
        ]
      },
      {
        "id": "references",
        "title": "A distinct reference per payment unit",
        "paragraphs": [
          "Terms v2 contain one signed random nonce per unit, deriving a separate disclosure reference for each payment. Legacy v1 requests retain their original common reference.",
          "Checkout rejects references already observed as paid. This is an indexed application guard, not an on-chain reservation. Concurrent payers or index lag can still cause reuse or overpayment; actual payouts remain counted.",
          "An arbitrary Evidence receipt root cannot replace a signed invoice unit reference. Checkout and reconciliation require the signed-derived root as the withdrawal disclosureRoot. Attaching arbitrary receipt evidence to the same action needs a separately designed/versioned combined commitment."
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
          "Save the signed invoice before leaving. The public settlement API does not store invoice terms or send webhooks. The separate Organization API can store signed invoices with organization access controls, idempotency and encryption at rest; the local form does not automatically sync to it. Use Organization → Invoice payments to explicitly import signed JSON, search saved invoices and reconcile payments. Expiry is an application rule; contracts may settle late. Recovery keeps the original payout destination after expiry."
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
      },
      {
        "id": "organization-dashboard",
        "title": "Track your organization’s payments",
        "paragraphs": [
          "For persisted team records, open Organization → Invoice payments and explicitly save signed JSON. Search/filter the complete saved snapshot, verify finalized-index observations against an independently trusted Settlement API/policy and export all filtered rows as CSV or JSON. The optional local encrypted library stays separate.",
          "The dashboard shows finalized successful payments with index block/time and linked transaction details. Unchecked, unavailable, stale, incomplete and reused-reference cases remain explicit. Exported status is an indexed snapshot, not current-chain freshness, complete business history or tax acceptance."
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
          "The file is validated locally and stays in memory. It contains no API origins, private notes or passwords. Enter each group’s HTTPS Settlement API separately; localhost HTTP is supported for local use. Importing the directory makes no network requests."
        ]
      },
      {
        "id": "check",
        "title": "Check capacity before selecting",
        "steps": [
          "Enter the Settlement API for a group and choose Check. The API policy must match every independently approved pin.",
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
          "Principal remains in independent vaults and one funded vault pays the bound recipient directly. Funds do not hop through an A → B → C sequence. Adding vaults alone does not measure or guarantee a larger effective anonymity set."
        ]
      },
      {
        "id": "public",
        "title": "What remains visible",
        "paragraphs": [
          "Small groups, address reuse, funding provenance and matching timing can correlate deposits and payouts. Published candidate, timing and funding observations do not establish an effective anonymity set or network-layer anonymity."
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
          "The invoice library encrypts saved signed requests with AES-256-GCM and a passphrase-derived key. It uses its own authenticated storage format and merchant/network namespace, separate from the operation journal. Saving, opening, searching and backing up library entries sends no terms to the service.",
          "This archive verifies signed-term integrity locally. It does not certify legal identity, current merchant key permissions, payment completion or statutory retention. Shared payment links and individual signed JSON exports still reveal their terms to holders."
        ]
      },
      {
        "id": "receipts",
        "title": "Private receipts and selected disclosure",
        "steps": [
          "Create a receipt on Evidence with the declarations you want to commit. Choose and confirm a passphrase, then download the encrypted full receipt. Nothing is uploaded to the API.",
          "Reopen the saved backup to verify it. Select only the fields you intend to share; no fields are selected by default. Review the readable values before downloading a selected disclosure.",
          "On Private notes, import the disclosure file to check its local integrity and use only its root for a deposit plan. Keep receipt openings, note backups and operation journals separately. Create a fresh root per operation; reused roots link activity.",
          "To review someone else’s disclosure, obtain the expected root independently, load the selected file and run Verify receipt integrity. The root is never filled from the file automatically."
        ],
        "paragraphs": [
          "Receipt integrity verified means the selected values and proof match the root you supplied. The browser makes no chain request. Truthful declarations, root anchoring, payment completion, identity and tax acceptance require separate checks. Use the existing CLI verify-bundle with your independently configured evidence source for selected finalized transaction anchoring.",
          "Full backups use a separate encrypted receipt format. Locking, page-hide and cached return clear private workspace state; pending cryptographic or file work cannot reopen it. Keep the downloaded file and passphrase separately.",
          "Invoice unit references and arbitrary receipt roots are distinct bindings. A generic action may commit to a receipt root; invoice checkout requires the signed-derived unit reference. Receipt integrity does not establish invoice payment, and substituting its root breaks checkout binding."
        ]
      },
      {
        "id": "measurement",
        "title": "Separate artificial activity from participation",
        "paragraphs": [
          "The bounded native cover experiment finalized four operator-owned transactions and returned its principal. Its synthetic withdrawal had six all-history output candidates, three after excluding labelled artificial outputs. Independent participants added: zero. These mechanical candidate counts are not a measured customer privacy benefit."
        ],
        "links": [
          {
            "label": "Privacy baseline and methodology",
            "href": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/PRIVACY_BASELINE.md"
          },
          {
            "label": "Bounded cover experiment",
            "href": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/COVER_TRAFFIC.md"
          }
        ]
      }
    ]
  },
  {
    "slug": "kyb",
    "title": "Business verification",
    "description": "Prepare sample intake or connect company and beneficial-owner provider review through your organization.",
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
        "title": "Connect company and owner verification",
        "paragraphs": [
          "Organization → Verification connects the organization API to Sumsub. Owner/Admin starts a tenant-bound company application and generates a ten-minute secure provider link. Company details, ownership/control information, documents and individual KYC are collected by the provider. An Auditor can read minimal status; Operator/Viewer cannot access these records. The separate /kyb/ sample remains unsubmitted.",
          "Each company and linked person must complete the configured review. Company GREEN alone does not approve incomplete UBO KYC. RETRY or awaitingUser requests supplementation; open the secure flow for the actual requests. Missing owners, unsupported structures and changed levels require review instead of inferred approval.",
          "Validity is bounded by the earliest required provider review date and operator policy. Refresh cannot extend the original expiry. Deactivation/deletion events and explicit local revocation close the case; old GREEN cannot reopen it. Stale/provider-unavailable records are not valid approvals. Start a fresh application after expiry or revocation.",
          "Authenticated raw-body webhooks only invalidate status. The service fetches current provider data, binds client/environment/levels and fences concurrent owner changes or revocation. Minimal case snapshots are encrypted; provider links and browser sessions stay in memory. Backups revoke all restored cases.",
          "The connector needs an operator-contracted Sumsub account, configured KYB/KYC levels, owner-only secrets/encryption keys and a reachable HTTPS callback. Development used local provider fixtures, with no real company/person review. Sandbox decisions do not establish legal identity. This feature issues no on-chain credential and does not enforce KYB inside permissionless settlement contracts.",
          "The latest adapter review added provider deleted-flag revocation, signed company-structure invalidation and TLS enforcement. Actual-provider qualification is still blocked: account configuration, authorized existing cases and a real HTTPS webhook journey have not been supplied. Controlled response tests are not real company review."
        ],
        "links": [
          {
            "label": "Actual-provider qualification status",
            "href": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/PROVIDER_QUALIFICATION.md"
          }
        ]
      },
      {
        "id": "tax-preparation",
        "title": "US and Abu Dhabi rule preparation",
        "paragraphs": [
          "Open Rules for date/jurisdiction/relationship-based component preparation. Seven source-checked candidates cover US federal FICA and potential NEC reporting for 2025/2026, explicitly classified UAE standard VAT, and distinct mainland/ADGM statutory gratuity candidates. Exact fiat minor-unit arithmetic and rational service fractions are exported with sources, assumptions, inputs and catalog hashes.",
          "Preview is explicitly unapproved. Reviewed evaluation requires an Ed25519 signature of the exact catalog/rule and an independently received reviewer-policy digest. Key/review dates and supplied revocations are checked. No professional reviewer or trusted key is bundled; current consolidated-source gaps require comparison before operational approval.",
          "Changing facts clears old results. Local report verification recomputes calculation integrity separately from current review acceptance; facts and reviewer qualification remain externally established. No salary/fiat conversion, payment authorization, full tax liability or statutory filing is inferred.",
          "US state/local taxes, federal income withholding, special worker/payee classes, corporate tax and pension/savings substitutions need additional reviewed rules. ADGM is a separate employment regime; unsupported dates/classifications stay unresolved. Organization → Tax drafts now prepares cited documents from these reports and literal selected-receipt bindings. Its optional AI arranges verified IDs, while independent review still requires the operator-pinned current signed rule policy.",
          "A fresh source check matched four of six exact official document hashes and recorded two retrieval failures. No independent reviewer policy or external signed review was supplied. Source bytes, current legal applicability and professional review are distinct checks; no tax-provider or filing acceptance is implied."
        ]
      }
    ]
  },
  {
    "slug": "sdk-api",
    "title": "SDK & API",
    "description": "Configure the public settlement API and separate authenticated Organization API, then use the browser SDK safely.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/OPERATIONS.md",
    "sections": [
      {
        "id": "service",
        "title": "Run the read-only service",
        "paragraphs": [
          "Use an actual reviewed policy and matching RPC. The API defaults to loopback. Set an exact Front CORS origin; a hosted HTTPS Front needs a reachable HTTPS API. Send public operation data, never wallet secrets or private notes.",
          "The settlement service does not automatically load .env files. Start the index worker separately before attaching its SQLite database. The default API address is 127.0.0.1:3001; it has no signing key, private-note upload, proving or broadcast endpoint."
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
              "Process liveness; not chain readiness."
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
              "/v1/recipients/readiness",
              "Finalized account existence, token registration and exact registration call."
            ],
            [
              "POST",
              "/v1/deposits/prepare",
              "Public commitment/root planning with bounded verified capacity."
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
          "POST /v1/deposits/prepare accepts only a public commitment, disclosure root and optional vault. The server verifies the original group at one final block and returns a public FT plan and bounded capacity observation. The client checks policy, commitment, reference, vault, token, add-on fee and attachments before returning the plan.",
          "The default deposit scan checks up to 20 vault records. An explicit member can be verified beyond that window, but remains a partial scan unless checkedRecords equals vaultCount. A prepared plan is a snapshot, not a reservation; full groups reject new deposits."
        ],
        "code": {
          "label": "Local backup and public planning",
          "text": "const note = await createPrivateNote(trustedPolicy);\nconst encrypted = await encryptNoteBackup(trustedPolicy, note, passphrase);\nconst restored = await openNoteBackup(downloadedFile, passphrase, trustedPolicy);\nconst result = await gateway.prepareDeposit(trustedPolicy, {\n  commitment: restored.note.commitment, disclosureRoot\n});\n// Import result.plan in the existing wallet session."
        }
      },
      {
        "id": "receipt-sdk",
        "title": "Local receipt SDK",
        "paragraphs": [
          "createReceipt, encryptReceiptBackup, openReceiptBackup, discloseReceipt and verifyReceiptDisclosure run locally. The eight fixed fields and SHA-256 Merkle paths match the existing Node receipt format. No receipt HTTP route is added.",
          "The CLI disclose command accepts browser-encrypted receipts using CORE_RECEIPT_PASSWORD in the environment. Public selected proofs remain compatible with verify-bundle."
        ],
        "code": {
          "label": "Private backup and selected proof",
          "text": "const receipt = await createReceipt(values);\nconst encrypted = await encryptReceiptBackup(receipt, passphrase);\nconst full = await openReceiptBackup(downloadedBackup, passphrase);\nconst selected = await discloseReceipt(full, ['asset', 'amount']);\nawait verifyReceiptDisclosure(selected, independentlyObtainedRoot);"
        }
      },
      {
        "id": "organization-service",
        "title": "Run the Organization API",
        "paragraphs": [
          "Use a separate process and database for team access. The loopback default is port 3002, while the settlement API uses port 3001. Enter the independently configured Organization API origin in the Organization workspace. Do not point it at the read-only settlement API.",
          "The server requires its own audience origin, owner-only database file, exact frontend Origin allowlist and HTTPS testnet RPC. localhost and 127.0.0.1 are different origins. A hosted frontend requires a reachable HTTPS backend; the current site does not include a deployed public Organization API."
        ],
        "code": {
          "label": "Terminal · from Core, in a separate process",
          "text": "export CORE_ORGANIZATION_ORIGIN=http://localhost:3002\nexport CORE_ORGANIZATION_DB=\"$PWD/data/organizations/organizations.sqlite\"\nexport CORE_ORGANIZATION_ALLOWED_ORIGINS=http://localhost:3000\nexport CORE_ORGANIZATION_RPC_URL=https://rpc.testnet.near.org\nnpm run serve:organizations"
        }
      },
      {
        "id": "organization-endpoints",
        "title": "Organization API endpoints",
        "paragraphs": [
          "These routes belong to the Organization API origin. Except for process liveness and challenge/login, requests need an approved Origin and an origin-bound bearer session. The server checks the current finalized wallet key and current organization membership. A browser sends Origin automatically; a nonbrowser HTTP caller must provide it explicitly.",
          "Existing-record mutations need the returned version. Never automatically replay a role, invitation, removal or ownership change after an uncertain response. Refresh the organization and audit log first."
        ],
        "table": {
          "headings": [
            "Method / route",
            "Purpose"
          ],
          "rows": [
            [
              "POST /v1/auth/challenge",
              "Create a five-minute account/audience/origin-bound sign-in challenge."
            ],
            [
              "POST /v1/auth/login",
              "Redeem the NEP-413 signature once for a one-hour session."
            ],
            [
              "POST /v1/auth/logout",
              "Revoke the supplied session; does not require an identity RPC read."
            ],
            [
              "GET /v1/organizations",
              "List only the principal’s active organization memberships."
            ],
            [
              "POST /v1/organizations",
              "Create a workspace name with the authenticated account as Owner."
            ],
            [
              "GET /v1/organizations/:id",
              "Read the current role, permissions and versions."
            ],
            [
              "GET /v1/organizations/:id/members",
              "Read the member directory when permitted."
            ],
            [
              "PATCH /v1/organizations/:id/members/:account",
              "Change a permitted role using the member version."
            ],
            [
              "DELETE /v1/organizations/:id/members/:account",
              "Remove a permitted member or leave using the membership version."
            ],
            [
              "GET /v1/me/invitations",
              "Read only invitations addressed to this authenticated account."
            ],
            [
              "POST /v1/me/invitations/:id/accept or /decline",
              "Explicitly resolve a targeted invitation using its version."
            ],
            [
              "GET / POST /v1/organizations/:id/invitations",
              "List or create permitted directed invitations."
            ],
            [
              "DELETE /v1/organizations/:id/invitations/:invite",
              "Revoke a permitted invitation using its version."
            ],
            [
              "GET /v1/organizations/:id/roles",
              "Read the fixed role/permission matrix."
            ],
            [
              "PATCH /v1/organizations/:id",
              "Rename the workspace using the organization version."
            ],
            [
              "POST /v1/organizations/:id/ownership",
              "Explicitly transfer to an active member using the organization version."
            ],
            [
              "GET /v1/organizations/:id/audit?before=<sequence>",
              "Read up to 50 organization-scoped audit events per page."
            ]
          ]
        }
      },
      {
        "id": "organization-client",
        "title": "Organization browser client",
        "paragraphs": [
          "After verified wallet sign-in, create the client for that same approved service origin and keep the returned session only in memory. This example runs inside Front after the user selects an organization; only an Owner or Admin can rename it. The complete login and role boundaries are described in Organizations & access."
        ],
        "code": {
          "label": "TypeScript · Front browser module",
          "text": "import { OrganizationClient, type Organization } from \"@/vendor/core-client/index.js\";\n\n// session comes from the verified NEP-413 login flow.\nconst client = new OrganizationClient(organizationApiOrigin, session.token);\nconst path = `/v1/organizations/${selectedOrganizationId}`;\nconst organization = await client.request<Organization>(path);\nawait client.request(path, \"PATCH\", {\n  name: \"Example workspace\",\n  version: organization.version,\n});"
        }
      },
      {
        "id": "organization-invoices",
        "title": "Use the private invoice API",
        "code": {
          "label": "Browser SDK",
          "text": "const invoices = new OrganizationInvoiceClient(\n  new OrganizationClient(apiOrigin, session.token), organizationId\n);\nconst saved = await invoices.save(stableRequestId, signedInvoice, signal);\nconst page = await invoices.list(undefined, signal);\nconst original = await invoices.get(saved.invoice.id, signal);"
        },
        "paragraphs": [
          "The SDK transports signed terms with an explicit in-memory organization session. It does not persist plaintext invoice terms or tokens. A saved record is an archive, not a payment confirmation; checkout still verifies the current merchant key, independently trusted policy, fees and finalized settlement."
        ]
      },
      {
        "id": "payment-dashboard",
        "title": "Reconcile and export organization invoices",
        "code": {
          "label": "Browser SDK",
          "text": "const records = await loadOrganizationInvoices(invoices, organizationId, signal);\nconst status = await gateway.invoiceHistory(record.invoice, { signal });\nconst observation = await invoiceDashboardObservation(\n  record, trustedPolicy, gateway.url, status\n);\nconst rows = [{ record, observation, unavailable: false }];\nconst filtered = filterInvoiceDashboard(rows, { search: 'INV-', state: 'paid' });\nconst csv = exportInvoiceDashboard(filtered, 'csv');"
        },
        "paragraphs": [
          "invoiceHistory verifies archived terms and the API policy without requiring the historic merchant key to remain current. It never authorizes payment. Existing invoiceStatus and checkout retain the current-key requirement. The dashboard validates exact root/policy/amount bindings and marks uncertainty explicitly. CSV protects formula-like business fields; JSON retains exact atomic amount strings and nullable unknown values."
        ]
      },
      {
        "id": "payment-webhooks",
        "title": "Verify and deduplicate payment events",
        "code": {
          "label": "Receiver SDK",
          "text": "const event = await verifyPaymentWebhook(rawUtf8Body, headers, [secret], { organizationId });\n// Node SDK: combine receipt uniqueness and business SQL in one transaction.\nconst inbox = new PaymentWebhookInbox('/private/receiver.sqlite', organizationId);\nconst result = await inbox.accept(rawUtf8Body, headers, [secret], (db, event) => {\n  db.prepare('INSERT INTO received_payments(event_id,amount_tokens) VALUES(?,?)')\n    .run(event.id, event.data.amountTokens);\n});\n// Acknowledge 2xx only after commit, including exact duplicate receipts."
        },
        "paragraphs": [
          "Use the original raw request body; do not parse and re-serialize it before HMAC verification. Signature headers are Core-Event-Id, Core-Webhook-Timestamp, Core-Webhook-Key-Id and Core-Webhook-Signature. Retain deliberate previous keys during rotation. The authenticated event identifies one finalized payment, not a mutable aggregate invoice-paid flag.",
          "OrganizationWebhookClient manages callbacks, delivery pagination, attempt details and versioned retry/rotation. PaymentWebhookInbox is in the Node SDK; its synchronous SQL handler must not perform asynchronous external fulfillment. External work needs a separate transactional outbox/idempotency key. HMAC authenticates the integration; it is not independent light-client or legal/tax verification."
        ]
      },
      {
        "id": "payout-batches",
        "title": "Create and reconcile payout runs",
        "code": {
          "label": "Browser SDK",
          "text": "const batches = new PayoutBatchClient(client, organizationId);\nconst batch = await batches.create(savedManifest, signal);\n// A different Owner/Admin approves each exact recipient request.\nconst run = new PayoutBatchSession(journal, gateway, wallet, client, batch);\nconst row = batch.payments[0].payload.paymentId;\nconst review = await run.review(row);\n// Review fee/recipient/call, then explicitly request wallet approval.\nawait run.submitReviewed(row, review.callHash);\nconst observations = await reconcilePayoutBatch(batch, gateway, gateway.url, signal);\nconst report = exportPayoutSettlement(batch, observations, 'json');"
        },
        "paragraphs": [
          "A public manifest contains 1–20 entries with stable intentId, declared worker/contractor category and immutable CorporateContent. Mixed payer/policies and duplicate notes are rejected. All amounts are exact atomic strings, with token fees added on top of note principal. Arbitrary salary amounts/FX/withholding are outside the current fixed-denomination protocol.",
          "PayoutBatchSession keeps a separate guarded operation for each recipient within one encrypted journal. It never batches invisible wallet signatures. Recovery binds the existing destination and shows additional storage. The same origin-bound current organization permissions and one-use corporate dispatch checks apply before each new payment."
        ]
      },
      {
        "id": "tax-draft-sdk",
        "title": "Source-bound draft SDK",
        "paragraphs": [
          "OrganizationTaxDraftClient supports scoped create/list/get, immutable revisions, review decisions and durable generation status/abandonment. draftBasis checks report arithmetic and exact disclosed-value bindings; validateDraftPlan rejects unsupported model content. renderTaxDraft and exportTaxDraft retain citations and preparation scope. verifyTaxDraft checks payload/source-bank hashes; current organization acceptance remains an authorized service decision."
        ]
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
          "Private notes and the invoice library also lock on page-hide and persisted history-cache return. Pending work cannot reopen the locked view. Encrypted invoice-library storage remains intact; a note must be reopened from its saved backup.",
          "The operation journal and settlement workspace also lock on page-hide and persisted cache return. Pending decrypt, restore, review and approval work cannot reopen the journal or dispatch a late wallet request. If a wallet request already started, its durable signing intent remains blocked for explicit reconciliation; locking does not prove failure or permit another signature.",
          "Private receipts have their own encrypted full-receipt backup. Selected disclosure files contain only the fields you exported and cannot restore all eight original openings. Keep the full receipt and passphrase separately; the service stores no receipt recovery copy."
        ],
        "table": {
          "headings": [
            "Record",
            "What it preserves"
          ],
          "rows": [
            [
              "Encrypted private note",
              "Downloaded file with spend secrets and original group policy; not persisted in browser storage."
            ],
            [
              "Encrypted full receipt",
              "Downloaded file with all eight openings; selected disclosure files cannot restore it."
            ],
            [
              "Encrypted browser journal",
              "Stored locally with operation metadata and unresolved signing intents; not spendable notes."
            ],
            [
              "Encrypted invoice library",
              "Optional local signed-request archive and separate backup; no trusted paid-status cache."
            ],
            [
              "Signed invoice / selected disclosure",
              "Readable terms or selected openings; not an encrypted backup or tax certificate."
            ]
          ]
        }
      },
      {
        "id": "organization-access",
        "title": "Recover organization access",
        "paragraphs": [
          "If the session expires or the signing key is removed in finalized chain state, sign in with a current FullAccess wallet key. If membership was removed, an authorized organization member must issue a new directed invitation. A wallet login does not restore that membership.",
          "Version conflicts require a fresh read and explicit review. After an uncertain mutation result, inspect Members, Invitations and the Audit log before retrying; there is no automatic mutation replay. An Owner must transfer to an active member before leaving, and there is no lost-wallet Owner reset.",
          "Organization records use a separate server database. Consistent online backup and digest-pinned restore commands now create quarantined files with sessions and login challenges discarded. The service refuses to start from these files. Browser note, receipt, journal and invoice-library backups cannot recover this database.",
          "The operator generates a blank access-review template, checks every current owner/member and revision against independent current authority, and obtains approval of the exact review-file hash. Historical roles are not prefilled or inherited. Activation revokes historical memberships and pending invitations, grants only reviewed access, advances revisions and records recovery audit in a new database.",
          "Each restore has a new recovery ID and a one-use activation intent. A review for another restore or a reused activation is rejected. If current authority is unavailable, leave the data quarantined. A checksum or fresh wallet login cannot establish who retained organization permissions after an old snapshot.",
          "Stop all old API instances before cutover and require everyone to sign in again. Existing old processes cannot be revoked by creating another database. Current-audience recovery is supported; audience migration, encrypted off-host transport, backup scheduling and retention remain operator configuration."
        ]
      },
      {
        "id": "limits",
        "title": "Current protocol limits",
        "paragraphs": [
          "Groups use fixed denominations and 256 total outputs, including private transfers. Withdrawal does not recycle capacity. Groups remain separate proof/privacy domains. Arbitrary-amount private payments, automatic private cross-group migration and a bundled funded browser FT deployment remain outside this release. A separate native NEAR reference group is documented with its recorded qualification.",
          "Production use needs independent contract/circuit/SDK review and a reviewed trusted setup. The Sumsub connector is available through Organization → Verification; actual provider qualification, full jurisdiction legal advice and statutory filing remain separate. Source-bound Tax drafts provide limited internal preparation with independent review."
        ],
        "links": [
          {
            "label": "Deployment status and addresses",
            "href": "/docs/deployments/#scope"
          }
        ]
      }
    ]
  },
  {
    "slug": "organizations",
    "title": "Organizations & access",
    "description": "Sign in with your wallet, create an organization and manage members with server-enforced roles.",
    "source": "https://github.com/Company-privacy-settlement/Core/blob/main/docs/ORGANIZATIONS.md",
    "sections": [
      {
        "id": "sign-in",
        "title": "Sign in to your organization",
        "paragraphs": [
          "Open Organization from the workspace navigation. Enter the independently provided Organization API origin, then choose Sign in with testnet wallet. Use a wallet that supports NEP-413 message signing. The message binds your account, service, frontend origin and a five-minute nonce.",
          "The organization service verifies the signature and the current finalized FullAccess key. A one-hour session stays in memory. Changing the API origin, leaving the page or returning from browser history clears the local session. Explicit Sign out revokes the server session.",
          "Authentication uses an Ed25519 wallet returning the signed message directly; redirect-return callbacks are not implemented. A function-call key cannot sign in. The server checks a recent finalized testnet key on each private request and denies access when the identity RPC is unavailable.",
          "The key response must match the requested finalized block hash and height. TLS certificate verification must remain enabled. A 25-second client deadline bounds stalled requests; caller cancellation also aborts in-flight requests."
        ]
      },
      {
        "id": "team",
        "title": "Create and invite",
        "steps": [
          "Create an organization with a workspace name. This does not verify a legal entity.",
          "Open Invitations, enter a NEAR testnet account and choose a permitted role.",
          "The recipient signs in to the same organization service and accepts from Your invitations. Invitations expire after seven days; no email or Telegram message is sent.",
          "Review Members to change a permitted role or remove a member. The server rechecks membership on each request. An invitation also binds its inviter’s membership version. Membership changes automatically revoke affected pending invitations; the recipient inbox hides invalid older grants. Re-adding an inviter cannot revive old authority."
        ]
      },
      {
        "id": "corporate-payments",
        "title": "Corporate payment approval",
        "steps": [
          "Select Payments. Import the independently trusted testnet FT policy and matching Settlement API origin.",
          "As an Owner, Admin or Operator, open Prepare a new payment. Import the public withdrawal plan generated locally from the original note, set its title and request independent approval. The creator must be its fee payer.",
          "A different Owner/Admin opens the request, independently trusts the same policy and reviews recipient, full principal, additive 0.15% fee, reference, expiry and exact prerequisite calls. Choose Approve exact payment; self-approval is refused.",
          "The creator refreshes Payments and unlocks the encrypted corporate operation journal. Review and sign each exact prerequisite/payment. Current memberships, independent approval and complete call content are checked immediately before provider dispatch.",
          "Confirm the bound finalized withdrawal through the journal. A dispatch reservation is not payment confirmation; preserve encrypted backups and reconcile uncertain results instead of resending."
        ],
        "paragraphs": [
          "Approved terms are read-only. Changing the recipient, token, amount, policy, proof/reference or storage/registration call requires cancellation before any reservation and a new independent approval. Viewer cannot read corporate requests; Auditor can read but cannot approve or execute.",
          "The API binds approvals to both membership revisions and a fixed 24-hour expiry. Role changes, removal/rejoin and ownership transfer invalidate old approval. Each reviewed call is durably reserved once; lost HTTP/wallet responses stay blocked for reconciliation. No automatic retry or reservation-reset action exists.",
          "This policy is enforced by the Organization API, SDK and supported wallet flow. The underlying contracts retain permissionless fixed-destination proof execution; anyone holding a valid public withdrawal plan can relay it outside this workspace. Wallet-account separation is not verified separation of real people or corporate identity. Contract-enforced dual approval remains separate work."
        ]
      },
      {
        "id": "roles",
        "title": "Roles and permissions",
        "table": {
          "headings": [
            "Role",
            "Access"
          ],
          "rows": [
            [
              "Owner",
              "All organization controls, including Admin management and ownership transfer."
            ],
            [
              "Admin",
              "Manage permitted members/invitations and independently approve another account’s payment. Cannot approve own requests."
            ],
            [
              "Operator",
              "View organization/members and corporate requests; prepare and execute own independently approved payments."
            ],
            [
              "Viewer",
              "View organization details. No member directory, invitations or audit log."
            ],
            [
              "Auditor",
              "Read organization, members, audit and corporate requests. No payment approval or execution."
            ]
          ]
        },
        "paragraphs": [
          "Roles are fixed. The server checks organization membership on every request. UI controls are not an authorization boundary. Corporate payment permissions now separate preparation, independent approval and execution of the creator’s exact payment in this workspace. They do not grant wallet keys, invoice ownership or contract-enforced treasury authority."
        ]
      },
      {
        "id": "limits",
        "title": "Membership limits and audit history",
        "table": {
          "headings": [
            "Record",
            "Current limit / behavior"
          ],
          "rows": [
            [
              "Organizations owned by one account",
              "10"
            ],
            [
              "Active memberships for one account",
              "100"
            ],
            [
              "Active members in one organization",
              "100"
            ],
            [
              "Unexpired pending invitations per organization / account inbox",
              "100 / 100"
            ],
            [
              "Sign-in challenge / server session / invitation",
              "5 minutes / 1 hour / 7 days"
            ],
            [
              "Active sessions per account",
              "Up to 10"
            ],
            [
              "Audit pagination",
              "50 events per page; sequences are scoped to one organization."
            ]
          ]
        },
        "paragraphs": [
          "Creation, renaming, invitations, member changes and ownership transfers append to the audit log in the same database transaction. Failed or stale changes do not append a successful change. This application history can be altered by a database administrator; it is not an independently anchored payment or tax proof."
        ]
      },
      {
        "id": "ownership",
        "title": "Ownership and recovery",
        "paragraphs": [
          "An organization always has one active Owner. An Owner must explicitly transfer ownership to an active member before leaving. The former Owner becomes an Admin. Version checks reject stale changes; refresh before retrying.",
          "An accepted member can leave. Removing a member immediately blocks their organization access. Membership changes revoke affected pending invitations and record the revocation atomically. Older invalid invitations are filtered out of recipient inboxes. There is no platform-admin owner reset, lost-wallet recovery or corporate multisig workflow."
        ]
      },
      {
        "id": "errors",
        "title": "Resolve access and version errors",
        "table": {
          "headings": [
            "Response",
            "Next action"
          ],
          "rows": [
            [
              "401 SESSION_INVALID / FULL_ACCESS_KEY_REVOKED",
              "Sign in again with the current wallet key. A new key does not restore removed organization membership."
            ],
            [
              "403 ORIGIN_DENIED",
              "Check that the configured backend allows the exact frontend origin."
            ],
            [
              "403 PERMISSION_DENIED / ROLE_GRANT_DENIED",
              "Refresh access and ask the Owner for the required role. Admins cannot manage Admins or Owners."
            ],
            [
              "404 ORGANIZATION_NOT_FOUND",
              "Refresh your organizations. Absent and foreign organizations use the same response."
            ],
            [
              "409 VERSION_CONFLICT",
              "Refresh the record and review its latest version before retrying explicitly."
            ],
            [
              "409 INVITATION_AUTHORITY_REVOKED",
              "Refresh invitations and ask an authorized member to issue a replacement."
            ],
            [
              "503 IDENTITY_CHAIN_UNAVAILABLE",
              "Wait for a current testnet identity RPC; the service does not fall back to cached authorization."
            ],
            [
              "504 / lost response",
              "Inspect current membership and audit history before deciding whether another mutation is needed."
            ]
          ]
        },
        "paragraphs": [
          "The browser clears credentials and private views on page-hide, history-cache return, unmount or API-origin change. Explicit Sign out revokes the server token. If logout transport fails, local credentials are still cleared; server revocation remains unconfirmed until expiry. A submitted request may already have committed.",
          "A failed request clears cached organization, member, invitation, audit and role views. A failed initial access load also clears the new local session. Refresh and reselect the organization before another write. Proxy responses with invalid JSON preserve their HTTP denial status."
        ]
      },
      {
        "id": "privacy",
        "title": "Data and service boundary",
        "paragraphs": [
          "Organization data is kept off-chain in a separate authenticated SQLite service. Names, wallet membership and audit metadata are not application-encrypted; the host must protect its volume and backups. No private note, payment key, identity document or salary is submitted to this API.",
          "The Sites preview remains owner-private. Self-hosted access follows the host configuration; organization membership and hosting access are separate boundaries. Accepted HTTPS backend hosting and a funded testnet wallet journey remain deployment tasks.",
          "Account-based maker-checker approval is now available in Payments. Business verification, verified corporate signer mapping, contract-enforced approval, custom roles, SSO and automatic signing remain separate work. The public read-only settlement API continues to require independently trusted deployment policies."
        ]
      },
      {
        "id": "server-recovery",
        "title": "Server backup and access recovery",
        "paragraphs": [
          "Operators use the dedicated organization CLI, independently of the public settlement index. Online SQLite backup includes committed WAL data while leaving the live service unchanged. Exported and restored files are quarantined, contain no sessions/challenges and cannot start a service.",
          "Generate an access-review template for the exact restored file. It intentionally includes no historical owner or member grants. Approve current account roles and revisions using independent current authority; obtain the approved file hash separately. Missing authority leaves the service quarantined.",
          "Activation writes a new database, revokes all historical members and pending invitations, grants only explicitly reviewed access, advances versions and appends recovery audit. A durable one-use intent blocks competing/replayed activation of that recovery file. A crash with an uncertain activation needs inspection and, if necessary, a new restore/review.",
          "Corporate payment requests and call reservations are included in server snapshots. Pending, approved and dispatched requests become invalidated during backup/restore; membership reapproval does not reapprove payments. Existing reservations remain consumed for conservative reconciliation.",
          "These are protected operator commands, not browser membership actions or a self-service lost-wallet reset. Stop old instances before cutover, use the same API audience and sign in again. Keep database, review and activation-intent files private; encryption, off-host retention and current-authority approval remain operational responsibilities."
        ],
        "code": {
          "label": "Terminal · Core operator, build once and set the Organization API audience/database",
          "text": "npm run build:service\n# CORE_ORGANIZATION_DB points to the live database.\nnpm run organizations:backup -- /private-backups/new.sqlite\n# Select a NEW quarantine path in CORE_ORGANIZATION_DB.\nnpm run organizations:restore -- /private-backups/new.sqlite TRUSTED_BACKUP_SHA256\nnpm run organizations:review-template -- /private-reviews/access.json\n# Independently review current authority, then select a NEW active database path.\nnpm run organizations:activate -- /private-recovery/quarantined.sqlite /private-reviews/access.json APPROVED_REVIEW_SHA256"
        }
      },
      {
        "id": "invoice-api",
        "title": "Organization invoice API",
        "paragraphs": [
          "The separate Organization API accepts immutable merchant-signed invoices at POST /v1/organizations/:org/invoices. Use a stable requestId for retries. Exact repeats return the existing record; changed terms under an existing request or merchant invoice ID return a conflict. GET the collection with its before cursor or retrieve a record by storage ID.",
          "Owners, Admins and Operators can save and read; Auditors can read; Viewers cannot access invoices. New invoices require the authenticated merchant’s current FullAccess key and a valid NEP-413 signature. Invoice storage does not grant wallet authority or mark a payment complete.",
          "Operators must provision CORE_ORGANIZATION_INVOICE_KEYS_FILE separately from the database and backups. Signed terms use AES-256-GCM encryption, with keyed tenant-bound indexes for duplicate detection. Without keys, invoice storage is disabled. Organization IDs, timestamps/counts and existing membership/audit metadata remain visible to the database operator. Authorized readers and the live service can access plaintext.",
          "Keep every data key needed by retained backups and the stable index key. Reviewed organization recovery restores ciphertext and retry indexes, drops sessions and requires current access approval before activation. The current browser invoice form/library remains independent; the organization payment dashboard now provides search/filter/export; signed payment webhooks are now available through the optional Organization delivery worker."
        ],
        "code": {
          "label": "Core operator setup",
          "text": "npm run organizations:invoice-keys -- /absolute/private/service.invoice-keys.json initial\nexport CORE_ORGANIZATION_INVOICE_KEYS_FILE=/absolute/private/service.invoice-keys.json\nnpm run serve:organizations"
        }
      },
      {
        "id": "payment-dashboard",
        "title": "Manage invoice payments",
        "paragraphs": [
          "Open Organization, sign in, choose your team and select Invoice payments. Owners, Admins and Operators can explicitly save merchant-signed JSON; Auditors can read/check/export; Viewers cannot load invoices. The full authorized snapshot is signature-verified and loaded in bounded pages before display.",
          "Search titles, references, IDs, merchants and recipients. Filter payment status, asset, group and inclusive UTC issue dates. The table shows 20 rows per page. CSV/JSON exports include all filtered rows across pages, exact atomic amounts, linked finalized record/transaction identifiers and checkpoint metadata. Exports contain readable business details; protect downloaded files.",
          "Under Settlement source, independently import the trusted policy and enter its matching Settlement API. Check payments reads every loaded invoice matching that exact policy, at most one per second. Large collections take longer and can be cancelled. Source changes discard previous observations; other groups stay unchecked. Current private read access is checked before publishing each result or exporting.",
          "Only matching finalized successful withdrawals count. Wallet callbacks and redirects never mark paid. Unknown/error observations stay Unchecked or Unavailable; index/browser observations older than five minutes become Stale index. Incomplete coverage and reused v2 unit references need review. Every result retains its observed height/time and chainFreshnessChecked: false.",
          "Historical signed invoice records can be reconciled after a merchant key rotation; checkout still requires a current merchant signing key. Organization switching, page-hide and revoked access clear cached private data and reject late responses. No plaintext browser invoice/status cache is created."
        ]
      },
      {
        "id": "payment-webhooks",
        "title": "Manage signed payment webhooks",
        "paragraphs": [
          "Open Organization → Webhooks. Owners and Admins can create approved HTTPS callbacks, pause/resume, rotate a signing secret and retry failed or recovery-held deliveries. Operators and Auditors can read callback/delivery history; Viewers cannot load it. Prepare and securely save a random 32-byte base64url signing secret in your receiver first; the API never returns it.",
          "Operators enable the worker with a separately protected organization key ring, a local verified finalized SQLite index, its exact reviewed testnet policy and independent SHA-256, and exact approved HTTPS callback origins. Callback URLs cannot contain credentials, queries, fragments, IP literals or alternate ports. Every send checks public DNS addresses, pins the socket, verifies hostname TLS and refuses redirects.",
          "Each matching finalized successful withdrawal with linked transaction provenance creates one immutable invoice.payment_confirmed event. Incomplete/stale coverage, failed attempts and unlinked records do not issue confirmations. Events and per-endpoint delivery uniqueness are committed atomically. Historical payments can catch up; new endpoints can receive an existing event without resending successful old deliveries.",
          "Every attempt carries an HMAC-SHA-256 signature over the exact raw body, stable event ID, key ID and fresh Unix timestamp. The receiver must enforce the five-minute timestamp window and atomically deduplicate event IDs. A sender can retry after a lost acknowledgement even when the receiver already committed; acknowledge 2xx only after idempotent business work commits.",
          "Network/transient HTTP failures retry with bounded backoff up to eight attempts per cycle. Redirects and permanent errors become dead letters. Inspect attempt outcomes, safe error/status codes and next due time; a current Owner/Admin can explicitly redrive a dead/held delivery up to three cycles with the same event ID. Delivered jobs cannot be manually resent.",
          "Encrypted backups retain events and attempt/dedup history but pause restored callbacks and hold pending/in-flight sends. Current access review, explicit resume and held-job retry are required. Webhook metadata and protected database state remain visible to the service; signing secrets, callback paths and event bodies are encrypted at rest."
        ]
      },
      {
        "id": "tax-drafts",
        "title": "AI tax and procedure drafts",
        "steps": [
          "Open Tax drafts. Import a Rules report and a selected evidence receipt, enter its independently obtained root, label it, and bind the disclosed amount to the exact report fact. The declared fiat currency must match; no token/FX inference occurs.",
          "Save a deterministic outline or, when configured by your operator, generate an AI-arranged draft. The model sees categorical IDs only. Exact calculations, source URLs/digests, receipt bindings, uncovered facts and limitations are rendered locally by the service.",
          "Submit the immutable revision for a different Owner/Admin to review. Request changes creates a new revision; approvals require explicit basis/evidence/scope acknowledgements, current signed rules and unchanged author/reviewer memberships.",
          "Export authorized current JSON or cited Markdown. Internal approval expires within 24 hours and can be withdrawn. Restore invalidates approvals. No filing or payment is authorized."
        ],
        "paragraphs": [
          "Owner/Admin/Operator can create; Auditor can read/export; Viewer cannot read drafts. Failed or uncertain model requests are not replayed automatically: inspect the pending generation after reload and explicitly abandon it if needed. Abandonment blocks late persistence but does not guarantee provider cancellation.",
          "The operator must configure protected encryption keys and optionally a private AI key/model. Accepted review requires an independently pinned reviewer policy; bundled rule candidates have no professional approval. Evidence integrity against your supplied root does not establish factual truth, independent anchoring or payment finality."
        ]
      },
      {
        "id": "payout-batches",
        "title": "Pay workers and contractors",
        "paragraphs": [
          "Open Organization → Payouts. A run groups 1–20 public corporate withdrawal plans under one exact trusted testnet FT policy and fee payer. Every row spends a distinct funded note, derives its principal and added 0.15% fee from policy and needs another Owner/Admin’s independent approval. Worker/contractor categories are declarations, not employment or tax verification.",
          "Import the independently trusted policy/Settlement API and a saved core-payout-manifest-v1 file containing stable batch/row IDs and public calls. The SDK stages rows idempotently before committing immutable ordered batch links. Retry the same file after a partial/lost response. Private notes, witnesses and wallet keys are not accepted.",
          "Review each recipient’s full principal, added token fee, permitted prerequisite calls and maximum attachments. Include independently reviewed initial/later storage prepayment variants when needed; preflight cannot silently raise an approved charge. The creator cannot self-approve. Existing row expiry and maker/approver membership revisions remain active.",
          "The creator unlocks one encrypted original-group journal, reviews the selected recipient and explicitly signs each next exact call. Other approved rows remain independent. An accepted failed withdrawal can retry only its original recipient/nullifier with additional NEAR storage, without a second withdrawal token fee. No action silently resends an entire run.",
          "Reconcile recipient payouts reads and binds every final contract state separately. Unobserved/unknown results are not failed-payment instructions. Completed journal rows stay closed even if later reads regress; reports preserve last confirmed observations while flagging stale/unavailable/inconsistent results. CSV/JSON export separates quotes, historically confirmed principal and principal not yet confirmed.",
          "Keep encrypted journal/note backups. Lost authorization or wallet responses require original-transaction reconciliation, never resetting consumed dispatch reservations. Restored organization data preserves batch links but invalidates old approvals and keeps note claims. These controls are an application workflow; the contracts retain permissionless fixed-destination proof execution."
        ]
      }
    ]
  }
];
