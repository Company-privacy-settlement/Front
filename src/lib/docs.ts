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
          "The current implementation supports native NEAR shared groups and token-bound USDC/NEP-141 groups. The browser workspace executes prepared testnet FT plans. Private note creation and Groth16 proof generation run locally through the Core CLI."
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
              "/v1/config",
              "Public policy for independent comparison."
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
        "title": "Keep three records distinct",
        "paragraphs": [
          "The browser journal uses passphrase-derived encryption and cross-tab exclusion. There is no passphrase recovery. Backup restoration requires empty storage and refuses overwrite."
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

