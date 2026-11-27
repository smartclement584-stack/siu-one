import { NavLink } from "react-router-dom";
import "../App.css";
import { useAuth } from "../auth/useAuth";

const PORTALS = {
  delegate: {
    label: "CLASS MANAGEMENT",
    eyebrow: "CLASS DELEGATE PORTAL",
    nav: [
      { to: "/delegate/attendance", icon: "▦", text: "Attendance" },
      { to: "/delegate/disputes", icon: "⚑", text: "Disputes" },
    ],
  },
  staff: {
    label: "STAFF PORTAL",
    eyebrow: "STAFF PORTAL",
    nav: [
      { to: "/staff", icon: "▦", text: "Classes & Attendance" },
      { to: "/staff/disputes", icon: "⚑", text: "Disputes" },
    ],
  },
  admin: {
    label: "ADMINISTRATION",
    eyebrow: "ADMINISTRATION",
    nav: [
      { to: "/admin", icon: "▤", text: "Courses" },
      { to: "/admin/announcements", icon: "♧", text: "Announcements" },
      { to: "/admin/calendar", icon: "◷", text: "Calendar" },
      { to: "/admin/disputes", icon: "⚑", text: "Disputes" },
    ],
  },
};

// Sidebar + header shared by the delegate, staff and admin pages.
function PortalLayout({ title, onLogout, children }) {
  // The route guard guarantees a verified session here.
  const { user } = useAuth();
  const { label, eyebrow, nav } = PORTALS[user.role];
  const { fullName, userType } = user.profile;

  return (
    <div className="delegate-layout">
      <aside className="delegate-sidebar">
        <div className="delegate-logo">
          <strong>SIU <span>One</span></strong>
          <small>SEVEN INTERNATIONAL UNIVERSITY</small>
        </div>

        <p className="delegate-menu-label">{label}</p>

        <nav className="delegate-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end>
              {item.icon} <span>{item.text}</span>
            </NavLink>
          ))}
        </nav>

        <div className="delegate-sidebar-bottom">
          <p>#WeTheDoers 💚🧡</p>
          <button onClick={onLogout}>↪ Sign Out</button>
        </div>
      </aside>

      <main className="delegate-main">
        <header className="delegate-header">
          <div>
            <span className="delegate-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>
              {fullName} · {userType || "Class Delegate"} · {user.matricule}
            </p>
          </div>

          <div className="delegate-avatar">{fullName.charAt(0)}</div>
        </header>

        {children}

        <footer className="delegate-footer">
          SIU ONE · BUILDING A BRIGHTER FUTURE TOGETHER
        </footer>
      </main>
    </div>
  );
}

export default PortalLayout;
