"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Clock3,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  HttpGateway,
  CoreApiError,
  activityKinds,
  type ActivityFilters,
  type ActivityKind,
  type IndexStatus,
  type IndexedActivity,
  type Policy,
} from "@/vendor/core-client/index.js";
const labels: Record<ActivityKind, string> = {
  deposit: "Deposit recorded",
  transfer: "Private transfer",
  withdrawal_requested: "Withdrawal requested",
  withdrawal_failed: "Payout attempt failed",
  withdrawal_retried: "Withdrawal retried",
  withdrawal_succeeded: "Payout succeeded",
};
const short = (s: string) =>
  s.length > 26 ? `${s.slice(0, 12)}…${s.slice(-10)}` : s;
function message(e: unknown) {
  if (e instanceof CoreApiError) {
    if (e.code === "INDEX_DISABLED")
      return "Activity indexing is not enabled for this API. The operator needs to configure the index worker.";
    if (e.code === "INDEX_NOT_READY")
      return "The index has not completed its first finalized read. Refresh after the worker syncs.";
    if (e.code === "INVALID_CURSOR")
      return "This activity snapshot expired or the database changed. Refresh to start a new page.";
  }
  return e instanceof Error ? e.message : "Activity could not be loaded";
}
export function IndexedActivityPanel({
  api,
  policy,
}: {
  api: string;
  policy: Policy;
}) {
  const [items, setItems] = useState<IndexedActivity[]>([]),
    [status, setStatus] = useState<IndexStatus | null>(null),
    [cursor, setCursor] = useState<string | null>(null),
    [upper, setUpper] = useState<number | null>(null),
    [kind, setKind] = useState<ActivityKind | "">(""),
    [recipient, setRecipient] = useState(""),
    [active, setActive] = useState<ActivityFilters>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [loaded, setLoaded] = useState(false),
    [now, setNow] = useState(0);
  const current = useRef(0),
    inFlight = useRef(false);
  useEffect(() => {
    void load(true, {});
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => {
      current.current++;
      inFlight.current = false;
      clearInterval(timer);
    };
  }, [api, policy]); // The parent remounts this panel when the verified group changes.
  async function load(reset: boolean, filters: ActivityFilters = active) {
    if (inFlight.current) return;
    inFlight.current = true;
    const request = ++current.current;
    setBusy(true);
    setError("");
    if (reset) {
      setItems([]);
      setCursor(null);
      setUpper(null);
      setLoaded(false);
      setActive(filters);
    }
    try {
      const page = await new HttpGateway(api).activity(policy, {
        ...filters,
        limit: 20,
        ...(!reset && cursor ? { cursor } : {}),
      });
      if (request !== current.current) return;
      if (
        !reset &&
        (page.snapshot.upperExclusive !== upper ||
          (page.nextCursor === cursor && page.nextCursor !== null) ||
          page.items.some((i) =>
            items.some((old) => old.record.index === i.record.index),
          ))
      )
        throw new Error(
          "Activity pagination changed. Refresh for a new snapshot.",
        );
      setItems(reset ? page.items : [...items, ...page.items]);
      setStatus(page.index);
      setCursor(page.nextCursor);
      setUpper(page.snapshot.upperExclusive);
      setLoaded(true);
      setNow(Date.now());
    } catch (e) {
      if (request !== current.current) return;
      setError(message(e));
      if (reset) setStatus(null);
      if (e instanceof CoreApiError && e.code === "INDEX_NOT_READY") {
        try {
          const s = await new HttpGateway(api).indexStatus(policy);
          if (request === current.current) setStatus(s);
        } catch {
          /* Preserve the activity error. */
        }
      }
    } finally {
      if (request === current.current) {
        setBusy(false);
        inFlight.current = false;
      }
    }
  }
  const checkpoint = status?.checkpoint,
    age = checkpoint
      ? Math.max(
          0,
          Math.floor((now - Date.parse(checkpoint.updatedAt)) / 60000),
        )
      : null;
  return (
    <section
      className="panel live-card indexed-activity"
      aria-labelledby="indexed-activity-title"
    >
      <div className="activity-heading">
        <div>

          <h2 id="indexed-activity-title">A record you can inspect.</h2>
          <p>
            Finalized journal events for this group. Your encrypted operation
            journal stays separate.
          </p>
        </div>
        <button
          className="button button-outline"
          disabled={busy}
          onClick={() => void load(true)}
        >
          <RefreshCw size={15} />
          {busy ? "Loading…" : "Refresh activity"}
        </button>
      </div>
      {status && (
        <>
          <div className="activity-metrics">
            <div>
              <span>Recorded events</span>
              <strong>{status.indexedRecords}</strong>
            </div>
            <div>
              <span>Receipt provenance linked</span>
              <strong>
                {status.linkedRecords} / {status.indexedRecords}
              </strong>
            </div>
            <div>
              <span>Finalized block indexed</span>
              <strong>{checkpoint?.block.height ?? "Awaiting sync"}</strong>
            </div>
          </div>
          <div className="activity-checkpoint">
            <Clock3 size={15} />
            <span>
              {checkpoint ? (
                <>
                  {age === 0
                    ? "Indexed less than a minute ago"
                    : `Indexed ${age} min ago`}{" "}
                  ·{" "}
                  <time dateTime={checkpoint.updatedAt}>
                    {new Date(checkpoint.updatedAt)
                      .toISOString()
                      .replace("T", " ")
                      .replace(".000Z", " UTC")}
                  </time>
                  .{" "}
                  {status.remainingRecords
                    ? `${status.remainingRecords} known events remain to copy.`
                    : "Caught up to this observed block."}{" "}
                  Refreshing this page reads the index; it does not check the
                  latest chain head.
                </>
              ) : (
                "No finalized index checkpoint is available yet."
              )}
            </span>
          </div>
          <div className="activity-discovery">
            <ShieldCheck size={15} />
            <span>
              {status.discovery?.enabled ? (
                <>
                  Automatic discovery from block{" "}
                  {status.discovery.state!.startHeight};{" "}
                  {status.discovery.state!.lastComplete
                    ? `scanned through ${status.discovery.state!.lastComplete.height}`
                    : "no full block scanned yet"}
                  .
                  {status.discovery.state!.current &&
                    ` Current block ${status.discovery.state!.current.block.height}: ${status.discovery.state!.current.offset}/${status.discovery.state!.current.total} transactions.`}
                  {status.discovery.state!.blocked &&
                    ` Waiting: ${status.discovery.state!.blocked.toLowerCase().replaceAll("_", " ")}.`}
                </>
              ) : (
                "Automatic discovery is not configured. Provenance can still be verified from supplied transaction references."
              )}
            </span>
          </div>
        </>
      )}
      <form
        className="activity-filters"
        onSubmit={(e) => {
          e.preventDefault();
          void load(true, {
            ...(kind ? { kind } : {}),
            ...(recipient.trim() ? { recipient: recipient.trim() } : {}),
          });
        }}
      >
        <label className="form-label">
          Event type
          <select
            value={kind}
            disabled={busy}
            onChange={(e) => setKind(e.target.value as ActivityKind | "")}
          >
            <option value="">All journal events</option>
            {activityKinds.map((k) => (
              <option value={k} key={k}>
                {labels[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Recipient account
          <input
            value={recipient}
            disabled={busy}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Optional NEAR account"
          />
        </label>
        <button className="button button-outline" disabled={busy}>
          Apply filters
        </button>
      </form>
      {error && (
        <p className="activity-error error-text" role="alert">
          {error}
        </p>
      )}
      {!loaded && !error && (
        <p className="activity-empty" role="status">
          Loading verified group activity…
        </p>
      )}
      {loaded && items.length === 0 && (
        <p className="activity-empty">No events match this indexed snapshot.</p>
      )}
      <div className="indexed-events">
        {items.map((item) => (
          <article className="indexed-event" key={item.record.index}>
            <div className="indexed-event-title">
              <div>
                <span className="activity-index">#{item.record.index}</span>
                <h3>{labels[item.record.kind]}</h3>
              </div>
              <span
                className={`provenance-pill ${item.provenance ? "linked" : ""}`}
              >
                {item.provenance ? "Receipt linked" : "Provenance unresolved"}
              </span>
            </div>
            <div className="indexed-event-details">
              <span>
                Principal · token atomic units
                <strong>{item.record.amount}</strong>
              </span>
              <span>
                Protocol fee charged
                <strong>{item.record.protocol_fee_charged}</strong>
              </span>
              <span>
                Event execution block<strong>{item.record.block_height}</strong>
              </span>
            </div>
            {item.record.recipient && (
              <p className="indexed-account">
                Recipient <code>{item.record.recipient}</code>
              </p>
            )}
            {item.record.vault && (
              <p className="indexed-account">
                Vault{" "}
                <code title={item.record.vault}>
                  {short(item.record.vault)}
                </code>
              </p>
            )}
            {item.provenance ? (
              <div className="indexed-provenance">
                <code>{item.provenance.transaction.hash}</code>
                <a
                  href={`https://testnet.nearblocks.io/txns/${encodeURIComponent(item.provenance.transaction.hash)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View transaction <ArrowUpRight size={13} />
                </a>
                <span>
                  Outer transaction: {item.provenance.outerOutcome}. A linked
                  receipt is evidence for this journal event.
                </span>
              </div>
            ) : (
              <p className="indexed-unresolved">
                The event is indexed. Its originating transaction has not been
                independently linked by this index.
              </p>
            )}
            <details className="live-call">
              <summary>Inspect public record and provenance</summary>
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </details>
          </article>
        ))}
      </div>
      {loaded && cursor && items.length < 1000 && (
        <button
          className="button button-outline activity-more"
          disabled={busy}
          onClick={() => void load(false)}
        >
          Load more events <ArrowDown size={15} />
        </button>
      )}
      <p className="activity-scope">
        Requests, failures and retries are historical events, not completed
        payouts. This index does not certify complete business history, legal
        identity or tax filing. Public recipients, amounts, timing and
        transaction origins remain visible.
      </p>
    </section>
  );
}
