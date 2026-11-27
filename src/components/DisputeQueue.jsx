import { useEffect, useState } from "react";
import { getDisputes, resolveDispute, reportError } from "../api";

const STATUS_CLASS = { Present: "history-present", Late: "history-late", Absent: "history-absent" };

// Review queue for delegates, staff and admin. The server decides which disputes
// each account can see.
function DisputeQueue() {
  const [filter, setFilter] = useState("open");
  const [disputes, setDisputes] = useState(null); // null = loading
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getDisputes(filter)
      .then((list) => {
        if (!cancelled) setDisputes(list);
      })
      .catch((error) => {
        if (!cancelled) reportError(error);
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  function showFilter(next) {
    if (next === filter) return;
    setDisputes(null);
    setFilter(next);
  }

  async function decide(dispute, status) {
    const resolutionNote = (notes[dispute.id] || "").trim();
    if (status === "rejected" && !resolutionNote) {
      alert("Add a short note explaining the rejection.");
      return;
    }

    setBusyId(dispute.id);
    try {
      const updated = await resolveDispute(dispute.id, { status, resolutionNote });
      setDisputes((previous) =>
        filter === "open"
          ? previous.filter((item) => item.id !== updated.id)
          : previous.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      reportError(error);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="delegate-student-panel portal-section" id="disputes">
      <div className="delegate-panel-heading">
        <div>
          <h2>Attendance Disputes</h2>
          <p>Approving a dispute corrects the attendance record and logs who made the change.</p>
        </div>

        <div className="portal-actions">
          {[["open", "Open"], ["all", "All"]].map(([value, text]) => (
            <button
              key={value}
              type="button"
              className={`portal-button secondary${filter === value ? " chosen" : ""}`}
              aria-pressed={filter === value}
              onClick={() => showFilter(value)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {disputes === null && <p className="delegate-empty">Loading…</p>}

      {disputes?.length === 0 && (
        <p className="delegate-empty">
          {filter === "open" ? "No open disputes." : "No disputes yet."}
        </p>
      )}

      {disputes?.map((dispute) => (
        <article className="attendance-history-item dispute-item" key={dispute.id}>
          <div className="dispute-summary">
            <div>
              <h3>
                {dispute.studentName} ({dispute.matricule})
              </h3>
              <p>
                {dispute.discipline} · {dispute.trimester} · {dispute.week} ·{" "}
                {dispute.sessionDate}
              </p>
            </div>

            <span className={`dispute-pill ${dispute.status}`}>{dispute.status}</span>
          </div>

          <p>
            Recorded:{" "}
            <strong className={STATUS_CLASS[dispute.currentStatus]}>
              {dispute.currentStatus}
            </strong>{" "}
            · Student says:{" "}
            <strong className={STATUS_CLASS[dispute.requestedStatus]}>
              {dispute.requestedStatus}
            </strong>
          </p>
          <p className="dispute-text">“{dispute.reason}”</p>

          {dispute.status === "open" ? (
            <div className="dispute-decision">
              <input
                type="text"
                aria-label={`Resolution note for ${dispute.studentName}`}
                placeholder="Resolution note (required to reject)"
                maxLength={500}
                value={notes[dispute.id] || ""}
                onChange={(event) =>
                  setNotes((previous) => ({ ...previous, [dispute.id]: event.target.value }))
                }
              />
              <button
                type="button"
                className="portal-button"
                disabled={busyId === dispute.id}
                onClick={() => decide(dispute, "approved")}
              >
                Approve
              </button>
              <button
                type="button"
                className="portal-button danger"
                disabled={busyId === dispute.id}
                onClick={() => decide(dispute, "rejected")}
              >
                Reject
              </button>
            </div>
          ) : (
            <p>
              {dispute.status === "approved" ? "Approved" : "Rejected"} by{" "}
              {dispute.resolvedBy.id} on {new Date(dispute.resolvedAt).toLocaleDateString()}
              {dispute.resolutionNote ? ` — ${dispute.resolutionNote}` : ""}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}

export default DisputeQueue;
