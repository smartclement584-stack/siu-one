import { useState } from "react";
import { createDispute, reportError } from "../api";
import { STATUSES } from "../academics";

const STATUS_CLASS = { Present: "history-present", Late: "history-late", Absent: "history-absent" };
const DISPUTE_LABEL = { open: "Dispute open", approved: "Dispute approved", rejected: "Dispute rejected" };

// The student's own records, one per session, each with a "Report an issue" action.
function AttendanceRecords({ records, disputes, onDisputed }) {
  const [formFor, setFormFor] = useState(null);
  const [requestedStatus, setRequestedStatus] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const newestFirst = [...records].sort(
    (a, b) => b.sessionDate.localeCompare(a.sessionDate) || b.id - a.id
  );

  function openForm(record) {
    setFormFor(record.id);
    setRequestedStatus(STATUSES.find((status) => status !== record.status));
    setReason("");
  }

  async function submit(event, record) {
    event.preventDefault();
    if (!reason.trim()) {
      alert("Please give a short reason.");
      return;
    }

    setSending(true);
    try {
      const dispute = await createDispute({
        attendanceSessionId: record.id,
        requestedStatus,
        reason: reason.trim(),
      });
      onDisputed(dispute);
      setFormFor(null);
    } catch (error) {
      reportError(error);
    } finally {
      setSending(false);
    }
  }

  if (newestFirst.length === 0) {
    return <p className="attendance-empty">No attendance records available yet.</p>;
  }

  return newestFirst.map((record) => {
    const dispute = disputes.find((item) => item.attendanceSessionId === record.id);

    return (
      <article className="attendance-history-item dispute-item" key={record.id}>
        <div className="dispute-summary">
          <div>
            <h3>{record.discipline}</h3>
            <p>
              {record.trimester} · {record.week} · {record.sessionDate}
            </p>
          </div>

          <div className="attendance-history-stats">
            <span className={STATUS_CLASS[record.status]}>{record.status}</span>

            {dispute ? (
              <span className={`dispute-pill ${dispute.status}`}>
                {DISPUTE_LABEL[dispute.status]}
              </span>
            ) : (
              formFor !== record.id && (
                <button
                  type="button"
                  className="portal-button secondary"
                  onClick={() => openForm(record)}
                >
                  Report an issue
                </button>
              )
            )}
          </div>
        </div>

        {dispute && (
          <p className="dispute-text">
            You asked for {dispute.requestedStatus}: “{dispute.reason}”
            {dispute.resolutionNote ? ` — Reviewer: ${dispute.resolutionNote}` : ""}
          </p>
        )}

        {!dispute && formFor === record.id && (
          <form className="dispute-form" onSubmit={(event) => submit(event, record)}>
            <label>
              I should be marked
              <select
                value={requestedStatus}
                onChange={(event) => setRequestedStatus(event.target.value)}
              >
                {STATUSES.filter((status) => status !== record.status).map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Reason
              <textarea
                rows={3}
                maxLength={500}
                required
                placeholder="Briefly explain what happened"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>

            <div className="portal-actions">
              <button type="submit" className="portal-button" disabled={sending}>
                Submit dispute
              </button>
              <button
                type="button"
                className="portal-button secondary"
                onClick={() => setFormFor(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </article>
    );
  });
}

export default AttendanceRecords;
