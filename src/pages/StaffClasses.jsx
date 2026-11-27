import { useEffect, useState } from "react";
import {
  getCourses,
  getClassSessions,
  createClassSession,
  cancelClassSession,
  getStudents,
  getSessions,
  saveSession,
  reportError,
} from "../api";
import { TRIMESTERS, WEEKS, STATUSES } from "../academics";

const emptyForm = {
  courseId: "",
  trimester: TRIMESTERS[0],
  week: WEEKS[0],
  sessionDate: "",
  startTime: "",
};

// Lecturer / supervisor home: own courses, class sessions and attendance entry.
function StaffClasses() {
  const [data, setData] = useState(null); // null = loading
  const [form, setForm] = useState(emptyForm);
  const [recordingId, setRecordingId] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCourses(), getClassSessions(), getStudents(), getSessions()])
      .then(([courses, classSessions, students, records]) => {
        if (!cancelled) setData({ courses, classSessions, students, records });
      })
      .catch((error) => {
        if (!cancelled) reportError(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (data === null) return <p className="delegate-empty">Loading…</p>;

  const { courses, classSessions, students, records } = data;
  const activeCourses = courses.filter((course) => course.active);

  const recording = classSessions.find((session) => session.id === recordingId);
  const roster = recording
    ? students.filter(
        (s) => s.department === recording.department && s.level === recording.level
      )
    : [];
  const marked = roster.filter((s) => attendance[s.matricule]).length;

  const setField = (field) => (event) =>
    setForm((previous) => ({ ...previous, [field]: event.target.value }));

  async function schedule(event) {
    event.preventDefault();
    if (!form.courseId || !form.sessionDate) {
      alert("Please select a course and session date.");
      return;
    }

    setBusy(true);
    try {
      const created = await createClassSession({ ...form, courseId: Number(form.courseId) });
      setData((previous) => ({
        ...previous,
        classSessions: [created, ...previous.classSessions].sort(
          (a, b) => b.sessionDate.localeCompare(a.sessionDate) || b.id - a.id
        ),
      }));
      setForm((previous) => ({ ...previous, sessionDate: "", startTime: "" }));
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  }

  function startRecording(session) {
    setRecordingId(session.id);
    setAttendance({});
  }

  async function cancelSession(session) {
    if (!window.confirm(`Cancel the ${session.courseName} session on ${session.sessionDate}?`)) {
      return;
    }

    setBusy(true);
    try {
      await cancelClassSession(session.id);
      setData((previous) => ({
        ...previous,
        classSessions: previous.classSessions.filter((s) => s.id !== session.id),
      }));
      if (recordingId === session.id) setRecordingId(null);
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (roster.length === 0 || marked !== roster.length) {
      alert("Please mark every student's attendance before saving.");
      return;
    }

    setBusy(true);
    try {
      const record = await saveSession({ classSessionId: recording.id, attendance });
      setData((previous) => ({
        ...previous,
        records: [...previous.records, record],
        classSessions: previous.classSessions.map((session) =>
          session.id === record.classSessionId
            ? { ...session, attendanceRecorded: true }
            : session
        ),
      }));
      setRecordingId(null);
      alert("Attendance session saved successfully!");
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="delegate-student-panel portal-section" id="courses">
        <div className="delegate-panel-heading">
          <div>
            <h2>My Courses</h2>
            <p>Courses assigned to you by the administration.</p>
          </div>
          <span className="delegate-count">{activeCourses.length} active</span>
        </div>

        {courses.length === 0 && (
          <p className="delegate-empty">No courses are assigned to you yet.</p>
        )}

        {courses.map((course) => (
          <article className="attendance-history-item" key={course.id}>
            <div>
              <h3>{course.name}</h3>
              <p>
                {course.department} · {course.level}
              </p>
            </div>
            {!course.active && <span className="dispute-pill rejected">Deactivated</span>}
          </article>
        ))}
      </section>

      <section className="delegate-session-panel" id="schedule">
        <div className="delegate-panel-heading">
          <div>
            <h2>Schedule a Class Session</h2>
            <p>Attendance is recorded against a scheduled session.</p>
          </div>
        </div>

        <form onSubmit={schedule}>
          <div className="delegate-session-fields">
            <div>
              <label htmlFor="sessionCourse">Course</label>
              <select id="sessionCourse" value={form.courseId} onChange={setField("courseId")}>
                <option value="">Select a course</option>
                {activeCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sessionTrimester">Trimester</label>
              <select id="sessionTrimester" value={form.trimester} onChange={setField("trimester")}>
                {TRIMESTERS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sessionWeek">Week</label>
              <select id="sessionWeek" value={form.week} onChange={setField("week")}>
                {WEEKS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sessionDate">Session Date</label>
              <input
                id="sessionDate"
                type="date"
                value={form.sessionDate}
                onChange={setField("sessionDate")}
              />
            </div>

            <div>
              <label htmlFor="sessionTime">Start Time (optional)</label>
              <input
                id="sessionTime"
                type="time"
                value={form.startTime}
                onChange={setField("startTime")}
              />
            </div>
          </div>

          <div className="delegate-report-actions">
            <button type="submit" className="delegate-save-session" disabled={busy}>
              + Schedule Session
            </button>
          </div>
        </form>
      </section>

      <section className="delegate-student-panel portal-section" id="sessions">
        <div className="delegate-panel-heading">
          <div>
            <h2>Class Sessions</h2>
            <p>Record attendance once for each session.</p>
          </div>
          <span className="delegate-count">{classSessions.length} sessions</span>
        </div>

        {classSessions.length === 0 && (
          <p className="delegate-empty">No class sessions scheduled yet.</p>
        )}

        {classSessions.map((session) => (
          <article className="attendance-history-item" key={session.id}>
            <div>
              <h3>{session.courseName}</h3>
              <p>
                {session.trimester} · {session.week} · {session.sessionDate}
                {session.startTime ? ` · ${session.startTime}` : ""}
              </p>
            </div>

            {session.attendanceRecorded ? (
              <span className="dispute-pill approved">Attendance recorded</span>
            ) : (
              <div className="portal-actions">
                {courses.find((c) => c.id === session.courseId)?.active ? (
                  <button
                    type="button"
                    className="portal-button"
                    onClick={() => startRecording(session)}
                  >
                    Record attendance
                  </button>
                ) : (
                  <span className="dispute-pill rejected">Course deactivated</span>
                )}
                <button
                  type="button"
                  className="portal-button danger"
                  onClick={() => cancelSession(session)}
                  disabled={busy}
                >
                  Cancel session
                </button>
              </div>
            )}
          </article>
        ))}
      </section>

      {recording && !recording.attendanceRecorded && (
        <section className="delegate-student-panel portal-section" id="record">
          <div className="delegate-panel-heading">
            <div>
              <h2>Student Attendance</h2>
              <p>
                {recording.courseName} · {recording.trimester} · {recording.week} ·{" "}
                {recording.sessionDate}
              </p>
            </div>
            <span className="delegate-count">
              {marked}/{roster.length} marked
            </span>
          </div>

          <div className="delegate-table">
            <div className="delegate-table-heading">
              <span>STUDENT</span>
              <span>MATRICULE</span>
              <span>ATTENDANCE STATUS</span>
            </div>

            {roster.map((student) => (
              <div className="delegate-student-row" key={student.matricule}>
                <strong>{student.fullName}</strong>
                <span>{student.matricule}</span>

                <div className="delegate-status-actions">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`status-button ${status.toLowerCase()} ${
                        attendance[student.matricule] === status ? "chosen" : ""
                      }`}
                      onClick={() =>
                        setAttendance((previous) => ({
                          ...previous,
                          [student.matricule]: status,
                        }))
                      }
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {roster.length === 0 && (
              <p className="delegate-empty">No students are registered in this class yet.</p>
            )}
          </div>

          <div className="delegate-report-actions portal-actions">
            <button
              type="button"
              className="portal-button secondary"
              onClick={() => setRecordingId(null)}
            >
              Cancel
            </button>
            <button type="button" className="delegate-save-session" onClick={save} disabled={busy}>
              ✓ Save Attendance
            </button>
          </div>
        </section>
      )}

      <section className="delegate-student-panel portal-section" id="history">
        <div className="delegate-panel-heading">
          <div>
            <h2>Attendance History</h2>
            <p>Records for your courses, including those entered by delegates.</p>
          </div>
          <span className="delegate-count">{records.length} records</span>
        </div>

        {records.length === 0 && (
          <p className="delegate-empty">No attendance sessions recorded yet.</p>
        )}

        {[...records].reverse().map((record) => {
          const statuses = Object.values(record.attendance);
          const count = (status) => statuses.filter((s) => s === status).length;

          return (
            <article className="attendance-history-item" key={record.id}>
              <div>
                <h3>{record.discipline}</h3>
                <p>
                  {record.trimester} · {record.week} · {record.sessionDate} · by{" "}
                  {record.createdBy.id}
                </p>
              </div>

              <div className="attendance-history-stats">
                <span className="history-present">{count("Present")} Present</span>
                <span className="history-late">{count("Late")} Late</span>
                <span className="history-absent">{count("Absent")} Absent</span>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

export default StaffClasses;
