import { useEffect, useState } from "react";
import "../App.css";
import { useAuth } from "../auth/useAuth";
import { ScrollLink, ComingSoon } from "../components/NavItems";
import AttendanceRecords from "../components/AttendanceRecords";
import { todayIso } from "../dates";
import {
  reportError,
  getStudentAttendance,
  getGoal,
  getAnnouncements,
  getEvents,
  getCourses,
  getDisputes,
} from "../api";

function Dashboard({ onLogout, onOpenGradeSimulator }) {
  // The route guard guarantees a verified student session here.
  const { user } = useAuth();
  const currentStudentMatricule = user.matricule;
  const [summary, setSummary] = useState(null);
  const [academicGoal, setAcademicGoal] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getStudentAttendance(currentStudentMatricule),
      getGoal(currentStudentMatricule),
      getAnnouncements(),
      getEvents(),
      getCourses(),
      getDisputes(),
    ])
      .then(([attendance, goal, announcementList, eventList, courseList, disputeList]) => {
        if (cancelled) return;
        setSummary(attendance);
        setAcademicGoal(goal);
        setAnnouncements(announcementList);
        setEvents(eventList);
        setCourses(courseList);
        setDisputes(disputeList);
      })
      .catch((error) => {
        if (!cancelled) reportError(error);
      });

    return () => {
      cancelled = true;
    };
  }, [currentStudentMatricule]);

  const totalSessions = summary?.totalSessions ?? 0;
  const presentCount = summary?.presentCount ?? 0;
  const absentCount = summary?.absentCount ?? 0;
  const lateCount = summary?.lateCount ?? 0;
  const attendanceByDiscipline = summary?.attendanceByDiscipline ?? {};
  const attendancePercentage = summary?.attendancePercentage;
  const today = todayIso();
  const upcomingEvents = events.filter((event) => event.eventDate >= today);

  const stats = [
    {
      icon: "📚",
      label: "My Courses",
      value: String(courses.length).padStart(2, "0"),
      detail: "Active courses",
    },
    {
      icon: "📊",
      label: "Attendance",
      value:
        attendancePercentage == null ? "—" : `${attendancePercentage}%`,
      detail: "Overall attendance",
    },
    {
      icon: "📅",
      label: "Upcoming Events",
      value: String(upcomingEvents.length).padStart(2, "0"),
      detail: "On the calendar",
    },
    {
      icon: "🏆",
      label: "Grade Simulator",
      value: "→",
      detail: "Plan your final exam score",
      onClick: onOpenGradeSimulator,
    },
  ];

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
          <ScrollLink className="selected" to="dashboard">⌂ <span>Home</span></ScrollLink>
          <ComingSoon>▤ <span>My Courses</span></ComingSoon>
          <ScrollLink to="attendance">◷ <span>Attendance</span></ScrollLink>
          <ComingSoon>▥ <span>Grades</span></ComingSoon>
          <ComingSoon>▧ <span>Assignments</span></ComingSoon>
          <ScrollLink to="announcements">♧ <span>Announcements</span></ScrollLink>
          <ComingSoon>▦ <span>Calendar</span></ComingSoon>
          <ComingSoon>✉ <span>Messages</span></ComingSoon>
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
            <p>
              {user.profile.department} · {user.profile.level.replace("Level", "Year")}
            </p>
          </div>

          <div className="dashboard-user">
            <button
              className="notification-button"
              aria-label="Notifications"
              disabled
              title="Coming soon"
            >
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
                className={`stat-card ${stat.onClick ? "clickable-stat" : ""}`}
                key={stat.label}
                onClick={stat.onClick}
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
              <ComingSoon>View calendar →</ComingSoon>
            </div>

            {summary && upcomingEvents.length === 0 && (
              <p className="attendance-empty">No upcoming events.</p>
            )}

            {upcomingEvents.map((event) => (
              <div className="event-item" key={event.id}>
                <div className="event-date">
                  <strong>{event.date}</strong>
                  <span>{event.month}</span>
                </div>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.day} · {event.time}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="dashboard-panel" id="announcements">
            <div className="section-heading">
              <h3>Latest Announcements</h3>
              <ComingSoon>View all →</ComingSoon>
            </div>

            {summary && announcements.length === 0 && (
              <p className="attendance-empty">No announcements yet.</p>
            )}

            {announcements.map((announcement) => (
              <article className="announcement-item" key={announcement.id}>
                <span
                  className={`announcement-tag${
                    announcement.tagColor ? ` ${announcement.tagColor}-tag` : ""
                  }`}
                >
                  {announcement.tag}
                </span>
                <h4>{announcement.title}</h4>
                <p>{announcement.body}</p>
                <small>{announcement.author}</small>
              </article>
            ))}
          </section>
                  <section className="dashboard-section" id="attendance">
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

          <section className="dashboard-section attendance-records">
            <div className="section-heading">
              <h3>Attendance Records</h3>
              <span>Report anything that looks wrong</span>
            </div>

            {summary && (
              <AttendanceRecords
                records={summary.sessions}
                disputes={disputes}
                onDisputed={(dispute) => setDisputes((previous) => [dispute, ...previous])}
              />
            )}
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