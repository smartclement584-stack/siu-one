import "../App.css";

function Dashboard({
  onLogout,
  onOpenGradeSimulator,
  academicGoal,
  attendanceSessions,
  currentStudentMatricule,
}) {
  const stats = [
    { icon: "📚", label: "My Courses", value: "06", detail: "Active courses" },
    { icon: "📊", label: "Attendance", value: "92%", detail: "Overall attendance" },
    { icon: "🏆", label: "Current GPA", value: "3.82", detail: "Academic performance" },
    { icon: "📝", label: "Assignments", value: "04", detail: "Pending submissions" },
  ];

  const events = [
    { day: "MON", date: "23", title: "Database Systems", time: "10:00 AM" },
    { day: "WED", date: "25", title: "Software Engineering", time: "2:00 PM" },
    { day: "FRI", date: "27", title: "Mathematics", time: "9:00 AM" },
  ];
  const studentSessions = attendanceSessions.filter((session) =>
  ["Present", "Absent", "Late"].includes(
    session.attendance[currentStudentMatricule]
  )
);

const totalSessions = studentSessions.length;

const presentCount = studentSessions.filter(
  (session) => session.attendance[currentStudentMatricule] === "Present"
).length;

const absentCount = studentSessions.filter(
  (session) => session.attendance[currentStudentMatricule] === "Absent"
).length;
const attendanceByDiscipline = studentSessions.reduce((result, session) => {
  const discipline = session.discipline;
  const status = session.attendance[currentStudentMatricule];

  if (!result[discipline]) {
    result[discipline] = {
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
    };
  }

  result[discipline].total += 1;

  if (status === "Present") result[discipline].present += 1;
  if (status === "Late") result[discipline].late += 1;
  if (status === "Absent") result[discipline].absent += 1;

  return result;
}, {});

const lateCount = studentSessions.filter(
  (session) => session.attendance[currentStudentMatricule] === "Late"
).length;

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <strong>SIU <span>One</span></strong>
          <small>SEVEN INTERNATIONAL UNIVERSITY</small>
        </div>

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="dashboard-nav">
          <a className="selected" href="#dashboard">⌂ <span>Home</span></a>
          <a href="#courses">▤ <span>My Courses</span></a>
          <a href="#attendance">◷ <span>Attendance</span></a>
          <a href="#grades">▥ <span>Grades</span></a>
          <a href="#assignments">▧ <span>Assignments</span></a>
          <a href="#announcements">♧ <span>Announcements</span></a>
          <a href="#calendar">▦ <span>Calendar</span></a>
          <a href="#messages">✉ <span>Messages</span></a>
        </nav>

        <div className="sidebar-bottom">
          <p>#WeTheDoers 💚🧡</p>
          <button onClick={onLogout}>↪ Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <h2>Welcome back, Doer! 👋</h2>
            <p>Software Engineering · Year 2</p>
          </div>

          <div className="dashboard-user">
            <button className="notification-button" aria-label="Notifications">
              ♧
            </button>
            <div className="user-avatar">S</div>
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="welcome-banner" id="dashboard">
          <div>
            <span>YOUR UNIVERSITY, ONE PORTAL</span>
            <h1>Your academic journey,<br />all in one place.</h1>
            <p>Everything you need to stay informed, organized and ahead.</p>
          </div>
          <div className="banner-decoration">SIU<br />ONE</div>
        </section>
         {/* ACADEMIC GOAL REMINDER */}
{academicGoal && (
  <section className="academic-goal-card">
    <div className="goal-icon">🎯</div>

    <div className="goal-content">
      <span>MY ACADEMIC GOAL</span>
      <h3>{academicGoal.discipline}</h3>

      <p>
        Target grade: <strong>{academicGoal.target}%</strong>
      </p>

      <p>
        Final Exam:
        <strong>
          {academicGoal.requiredFinal === "Already secured"
            ? " Already secured"
            : ` ${academicGoal.requiredFinal}% required`}
        </strong>
      </p>
    </div>
  </section>
)}
        {/* STATISTICS */}
        <section className="dashboard-section">
          <div className="section-heading">
            <h3>Academic Overview</h3>
            <span>Current academic session</span>
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <article
  className={`stat-card ${
    stat.label === "Current GPA" ? "clickable-stat" : ""
  }`}
  key={stat.label}
  onClick={
    stat.label === "Current GPA"
      ? onOpenGradeSimulator
      : undefined
  }
>
                <div className="stat-top">
                  <span className="stat-icon">{stat.icon}</span>
                  <span className="stat-dot">●</span>
                </div>
                <p>{stat.label}</p>
                <h2>{stat.value}</h2>
                <small>{stat.detail}</small>
              </article>
            ))}
          </div>
        </section>

        {/* EVENTS AND ANNOUNCEMENTS */}
        <div className="dashboard-bottom-grid">

          <section className="dashboard-panel">
            <div className="section-heading">
              <h3>Upcoming Events</h3>
              <a href="#calendar">View calendar →</a>
            </div>

            {events.map((event) => (
              <div className="event-item" key={event.title}>
                <div className="event-date">
                  <strong>{event.date}</strong>
                  <span>{event.day}</span>
                </div>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.time}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="dashboard-panel" id="announcements">
            <div className="section-heading">
              <h3>Latest Announcements</h3>
              <a href="#announcements">View all →</a>
            </div>

            <article className="announcement-item">
              <span className="announcement-tag">ACADEMIC</span>
              <h4>Welcome to the new academic session!</h4>
              <p>Stay connected to SIU One for important academic updates.</p>
              <small>University Administration</small>
            </article>

            <article className="announcement-item">
              <span className="announcement-tag orange-tag">COMMUNITY</span>
              <h4>Welcome back, Doers!</h4>
              <p>Let's make this academic year productive and memorable.</p>
              <small>Student Board</small>
            </article>
          </section>
                  <section className="dashboard-section">
          <div className="section-heading">
            <h3>Attendance Overview</h3>
            <span>Your attendance record</span>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon">📚</span>
                <span className="stat-dot">●</span>
              </div>
              <p>Total Sessions</p>
              <h2>{totalSessions}</h2>
              <small>Recorded sessions</small>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon">✓</span>
                <span className="stat-dot">●</span>
              </div>
              <p>Present</p>
              <h2>{presentCount}</h2>
              <small>Sessions attended</small>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon">◷</span>
                <span className="stat-dot">●</span>
              </div>
              <p>Late</p>
              <h2>{lateCount}</h2>
              <small>Late arrivals</small>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon">✕</span>
                <span className="stat-dot">●</span>
              </div>
              <p>Absent</p>
              <h2>{absentCount}</h2>
              <small>Sessions missed</small>
            </article>
          </div>
        </section>
        <section className="dashboard-section">
  <div className="section-heading">
    <h3>Attendance by Discipline</h3>
    <span>Detailed attendance record</span>
  </div>

  <div className="attendance-discipline-list">
    {Object.entries(attendanceByDiscipline).length === 0 ? (
      <p className="attendance-empty">
        No attendance records available yet.
      </p>
    ) : (
      Object.entries(attendanceByDiscipline).map(([discipline, data]) => (
        <article className="attendance-discipline-card" key={discipline}>
          <div className="attendance-discipline-header">
            <h4>{discipline}</h4>
            <span>{data.total} sessions</span>
          </div>

          <div className="attendance-discipline-stats">
            <span className="history-present">
              {data.present} Present
            </span>
            <span className="history-late">
              {data.late} Late
            </span>
            <span className="history-absent">
              {data.absent} Absent
            </span>
          </div>
        </article>
      ))
    )}
  </div>
</section>

        </div>

        <footer className="dashboard-footer">
          SIU ONE · BUILDING A BRIGHTER FUTURE TOGETHER
        </footer>

      </main>
    </div>
  );
}

export default Dashboard;