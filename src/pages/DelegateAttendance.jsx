
import { useEffect, useState } from "react";
import "../App.css";
import {
  getStudents,
  getSessions,
  saveSession as postSession,
  getCourses,
  reportError,
} from "../api";
import { ScrollLink, ComingSoon } from "../components/NavItems";

function DelegateAttendance({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getStudents(), getSessions(), getCourses()])
      .then(([studentList, sessionList, courseList]) => {
        if (cancelled) return;
        setStudents(
          studentList.map((student) => ({
            id: student.id,
            name: student.fullName,
            matricule: student.matricule,
          }))
        );
        setSessions(sessionList);
        setCourses(courseList);
      })
      .catch((error) => {
        if (!cancelled) reportError(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");

  const [trimester, setTrimester] = useState("Trimester 1");
  const [week, setWeek] = useState("Week 1");
  const [discipline, setDiscipline] = useState("");
  const [sessionDate, setSessionDate] = useState("");

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.matricule}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const present = Object.values(attendance).filter(
    (status) => status === "Present"
  ).length;

  const absent = Object.values(attendance).filter(
    (status) => status === "Absent"
  ).length;

  const late = Object.values(attendance).filter(
    (status) => status === "Late"
  ).length;

  function updateStatus(id, status) {
    setAttendance((previous) => ({
      ...previous,
      [id]: status,
    }));
  }
  async function saveSession() {
  if (!discipline || !sessionDate) {
    alert("Please select a discipline and session date.");
    return;
  }

  if (students.length === 0 || Object.keys(attendance).length !== students.length) {
    alert("Please mark every student's attendance before saving.");
    return;
  }
  const attendanceByMatricule = {};

  students.forEach((student) => {
  attendanceByMatricule[student.matricule] = attendance[student.id];
});

  try {
    const savedSession = await postSession({
      trimester,
      week,
      discipline,
      sessionDate,
      attendance: attendanceByMatricule,
    });

    setSessions((previous) => [...previous, savedSession]);

    setAttendance({});
    setReportGenerated(false);

    alert("Attendance session saved successfully!");
  } catch (error) {
    reportError(error);
  }
}
  const [reportGenerated, setReportGenerated] = useState(false);
  
  function generateReport() {
  if (!discipline || !sessionDate) {
    alert("Please select a discipline and session date.");
    return;
  }

  if (Object.keys(attendance).length === 0) {
    alert("Please mark at least one student's attendance.");
    return;
  }

  setReportGenerated(true);
}
  return (
    <div className="delegate-layout">
      <aside className="delegate-sidebar">
        <div className="delegate-logo">
          <strong>SIU <span>One</span></strong>
          <small>SEVEN INTERNATIONAL UNIVERSITY</small>
        </div>

        <p className="delegate-menu-label">CLASS MANAGEMENT</p>

        <nav className="delegate-nav">
          <ScrollLink className="active" to="attendance">▦ <span>Attendance</span></ScrollLink>
          <ComingSoon>♙ <span>My Students</span></ComingSoon>
        </nav>

        <div className="delegate-sidebar-bottom">
          <p>#WeTheDoers 💚🧡</p>
          <button onClick={onLogout}>↪ Sign Out</button>
        </div>
      </aside>

      <main className="delegate-main">
        <header className="delegate-header">
          <div>
            <span className="delegate-eyebrow">CLASS DELEGATE PORTAL</span>
            <h1>Attendance Management</h1>
            <p>Manage and track your classmates' attendance.</p>
          </div>

          <div className="delegate-avatar">D</div>
        </header>

        <section className="delegate-banner">
          <div>
            <span>YOUR CLASSROOM</span>
            <h2>Software Engineering</h2>
            <p>Year 2 · Seven International University</p>
          </div>
          <div className="delegate-banner-icon">▦</div>
        </section>

        <section className="delegate-stats">
          <article className="delegate-stat">
            <span className="delegate-stat-icon">♙</span>
            <p>Total Students</p>
            <h2>{students.length}</h2>
          </article>

          <article className="delegate-stat">
            <span className="delegate-stat-icon present-icon">✓</span>
            <p>Present</p>
            <h2>{present}</h2>
          </article>

          <article className="delegate-stat">
            <span className="delegate-stat-icon absent-icon">×</span>
            <p>Absent</p>
            <h2>{absent}</h2>
          </article>

          <article className="delegate-stat">
            <span className="delegate-stat-icon late-icon">◷</span>
            <p>Late</p>
            <h2>{late}</h2>
          </article>
        </section>
         <section className="delegate-session-panel">
  <div className="delegate-panel-heading">
    <div>
      <h2>Session Details</h2>
      <p>Select the details of the class session.</p>
    </div>
  </div>

  <div className="delegate-session-fields">
    <div>
      <label>Trimester</label>
      <select
        value={trimester}
        onChange={(event) => setTrimester(event.target.value)}
      >
        <option>Trimester 1</option>
        <option>Trimester 2</option>
        <option>Trimester 3</option>
      </select>
    </div>

    <div>
      <label>Week</label>
      <select
        value={week}
        onChange={(event) => setWeek(event.target.value)}
      >
        {Array.from({ length: 12 }, (_, index) => (
          <option key={index}>Week {index + 1}</option>
        ))}
      </select>
    </div>

    <div>
      <label>Discipline</label>
      <select
        value={discipline}
        onChange={(event) => setDiscipline(event.target.value)}
      >
        <option value="">Select a discipline</option>
        {courses.map((course) => (
          <option key={course.id}>{course.name}</option>
        ))}
      </select>
    </div>

    <div>
      <label>Session Date</label>
      <input
        type="date"
        value={sessionDate}
        onChange={(event) => setSessionDate(event.target.value)}
      />
    </div>
  </div>
</section>
        <section className="delegate-student-panel" id="attendance">
          <div className="delegate-current-session">
  <div>
    <span>SELECTED SESSION</span>
    <h3>{discipline || "No discipline selected"}</h3>
    <p>
      {trimester} · {week}
      {sessionDate ? ` · ${sessionDate}` : ""}
    </p>
  </div>

  <span className="delegate-session-badge">
    {Object.keys(attendance).length}/{students.length} marked
  </span>
</div>
          <div className="delegate-panel-heading">
            <div>
              <h2>Student Attendance</h2>
              <p>Choose an attendance status for each student.</p>
            </div>

            <span className="delegate-count">
              {Object.keys(attendance).length}/{students.length} marked
            </span>
          </div>

          <input
            className="delegate-search"
            type="search"
            placeholder="Search by student name or matricule..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="delegate-table">
            <div className="delegate-table-heading">
              <span>STUDENT</span>
              <span>MATRICULE</span>
              <span>ATTENDANCE STATUS</span>
            </div>

            {filteredStudents.map((student) => (
              <div className="delegate-student-row" key={student.id}>
                <strong>{student.name}</strong>
                <span>{student.matricule}</span>

                <div className="delegate-status-actions">
                  {["Present", "Absent", "Late"].map((status) => (
                    <button
                      key={status}
                      className={`status-button ${status.toLowerCase()} ${
                        attendance[student.id] === status ? "chosen" : ""
                      }`}
                      onClick={() => updateStatus(student.id, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <p className="delegate-empty">No student found.</p>
            )}
          </div>
         <div className="delegate-report-actions">
  <button
    type="button"
    className="delegate-save-session"
    onClick={saveSession}
  >
    ✓ Save Attendance
  </button>

  <button
    type="button"
    className="delegate-send-report"
    onClick={generateReport}
  >
    <span>✉</span>
    Generate Recap
  </button>
</div>
        </section>
        {/* RECAP OF THE SESSION BEING MARKED */}
{reportGenerated && (
  <section className="delegate-student-panel" id="recap">
    <div className="delegate-panel-heading">
      <div>
        <h2>Attendance Recap</h2>
        <p>Summary of the session you are currently marking.</p>
      </div>

      <span className="delegate-count">
        {Object.keys(attendance).length}/{students.length} marked
      </span>
    </div>

    <article className="attendance-history-item">
      <div>
        <h3>{discipline}</h3>
        <p>
          {trimester} · {week} · {sessionDate}
        </p>
      </div>

      <div className="attendance-history-stats">
        <span className="history-present">{present} Present</span>
        <span className="history-late">{late} Late</span>
        <span className="history-absent">{absent} Absent</span>
      </div>
    </article>

    {["Absent", "Late"].map((status) => {
      const names = students
        .filter((student) => attendance[student.id] === status)
        .map((student) => `${student.name} (${student.matricule})`);

      return names.length > 0 ? (
        <p key={status}>
          <strong>{status}:</strong> {names.join(", ")}
        </p>
      ) : null;
    })}

    <div className="delegate-report-actions">
      <button
        type="button"
        className="delegate-send-report"
        onClick={() => setReportGenerated(false)}
      >
        Close recap
      </button>
    </div>
  </section>
)}

        {/* SAVED ATTENDANCE SESSIONS */}
<section className="delegate-student-panel">
  <div className="delegate-panel-heading">
    <div>
      <h2>Attendance History</h2>
      <p>Previously recorded class sessions.</p>
    </div>

    <span className="delegate-count">
      {sessions.length} sessions
    </span>
  </div>

  {sessions.length === 0 ? (
    <p className="delegate-empty">
      No attendance sessions recorded yet.
    </p>
  ) : (
    [...sessions].reverse().map((session) => {
      const statuses = Object.values(session.attendance);

      const sessionPresent = statuses.filter(
        (status) => status === "Present"
      ).length;

      const sessionAbsent = statuses.filter(
        (status) => status === "Absent"
      ).length;

      const sessionLate = statuses.filter(
        (status) => status === "Late"
      ).length;

      return (
        <article className="attendance-history-item" key={session.id}>
          <div>
            <h3>{session.discipline}</h3>
            <p>
              {session.trimester} · {session.week} · {session.sessionDate}
            </p>
          </div>

          <div className="attendance-history-stats">
            <span className="history-present">
              {sessionPresent} Present
            </span>
            <span className="history-late">
              {sessionLate} Late
            </span>
            <span className="history-absent">
              {sessionAbsent} Absent
            </span>
          </div>
        </article>
      );
    })
  )}
</section>

        <footer className="delegate-footer">
          SIU ONE · BUILDING A BRIGHTER FUTURE TOGETHER
        </footer>
      </main>
    </div>
  );
}

export default DelegateAttendance;
