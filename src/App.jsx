import "./App.css";
import studentPhoto from "./assets/student-campus.jpeg";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { register } from "./api";
import { useAuth } from "./auth/useAuth";
import ProtectedRoute from "./auth/ProtectedRoute";
import { ScrollLink, ComingSoon } from "./components/NavItems";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DelegateLogin from "./pages/DelegateLogin";
import DelegateAttendance from "./pages/DelegateAttendance";
import StaffLogin from "./pages/StaffLogin";
import StaffClasses from "./pages/StaffClasses";
import AdminCourses from "./pages/AdminCourses";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminCalendar from "./pages/AdminCalendar";
import PortalLayout from "./components/PortalLayout";
import DisputeQueue from "./components/DisputeQueue";
import GradeSimulator from "./pages/GradeSimulator";

function Logo() {
  return (
    <Link className="brand" to="/">
      <svg viewBox="0 0 48 44" className="brand-icon">
        <path
          d="M24 2c-5 5-6.5 9.5-3.5 14
          1.5-2 3-3 4.5-6 1 3.5 3 4.5 3 7.5
          4-3.5 2.5-10.5-4-15.5z"
          fill="#f2a33a"
        />
        <path
          d="M2 18c8-1.5 15 .5 21 5v18
          c-6-3.5-13-5-21-4.5z"
          fill="#11603f"
        />
        <path
          d="M46 18c-8-1.5-15 .5-21 5v18
          c6-3.5 13-5 21-4.5z"
          fill="#11603f"
        />
      </svg>

      <span className="brand-text">
        <strong>SIU <i>One</i></strong>
        <small>SEVEN INTERNATIONAL UNIVERSITY</small>
      </span>
    </Link>
  );
}

function Header({onLogin }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />

        <nav className="navigation">
          <ScrollLink className="active" to="home">Home</ScrollLink>
          <ComingSoon>About</ComingSoon>
          <ScrollLink to="features">Features</ScrollLink>
          <ComingSoon>News</ComingSoon>
          <ScrollLink to="contact">Contact</ScrollLink>
        </nav>

        <button className="login-button" onClick={onLogin}>
         <span>♙</span> Login
          </button>
      </div>
    </header>
  );
}

function Hero({onGetStarted}) {
  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div className="hero-text">
          <span className="pill">Your University, One Portal</span>

          <h1>SIU <span>One</span></h1>

          <h2>Learn. Connect. Achieve.</h2>

          <p className="lead">
            Your all-in-one platform to access academic resources,
            manage your studies and stay connected with the
            Seven International University community.
          </p>

          <div className="hero-buttons">
            <button className="btn primary" onClick={onGetStarted}>
                Get Started <span>→</span>
            </button>
            <ScrollLink className="btn secondary" to="features">
              <span>▶</span> Watch Demo
            </ScrollLink>
          </div>
        </div>

        <div className="hero-visual">
          <div className="ring"></div>

          <div className="photo-frame">
            <img src={studentPhoto} alt="SIU student using a laptop on campus" />
          </div>

          <div className="floating-card">
            <div className="check-icon">✓</div>
            <div>
              <strong>Student Portal</strong>
              <span>One account for everything</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: "▱",
    title: "Academic Access",
    subtitle: "Grades, Results & More",
  },
  {
    icon: "▦",
    title: "Event Calendar",
    subtitle: "Stay Updated",
  },
  {
    icon: "♧",
    title: "Notifications",
    subtitle: "Never Miss an Update",
  },
  {
    icon: "☏",
    title: "Student Support",
    subtitle: "We're Here to Help",
  },
];

function Features() {
  return (
    <section className="features-section" id="features">
      <div className="container feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className="feature-icon">{feature.icon}</div>
            <div>
              <strong>{feature.title}</strong>
              <span>{feature.subtitle}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact">
      <p>BUILDING A BRIGHTER FUTURE TOGETHER</p>
    </footer>
  );
}

function ProfileSelection({ onBack, onSelect }) {
  const profiles = [
    {
      icon: "🎓",
      title: "Student",
      description: "Access your academic space, courses and results.",
      path: "/login",
    },
    {
      icon: "🛡️",
      title: "Administration",
      description: "For university administration and the Student Board.",
      path: "/admin-login",
    },
    {
      icon: "👥",
      title: "Lecturer / Supervisor",
      description: "Manage your courses, class sessions and attendance.",
      path: "/staff-login",
    },
    {
      icon: "📋",
      title: "Class Delegate",
      description: "Manage class attendance and student records.",
      path: "/delegate-login",
    },
  ];

  return (
    <div className="profile-page">
      <div className="auth-brand">
        <span className="auth-logo">SIU <i>One</i></span>
        <span className="auth-tagline">
          YOUR UNIVERSITY, ONE PORTAL
        </span>
      </div>

      <div className="profile-content">
        <button className="back-link" onClick={onBack}>
          ← Back to home
        </button>

        <div className="profile-heading">
          <span className="auth-eyebrow">WELCOME TO SIU ONE</span>
          <h1>Choose your profile</h1>
          <p>
            Select your profile to access your dedicated university space.
          </p>
        </div>

        <div className="profile-grid">
          {profiles.map((profile) => (
            <button
              key={profile.title}
              className="profile-card available"
              onClick={() => onSelect(profile.path)}
            >
              <span className="profile-icon">{profile.icon}</span>

              <span className="profile-title">
                {profile.title}
              </span>

              <span className="profile-description">
                {profile.description}
              </span>

              <span className="profile-action">Continue →</span>
            </button>
          ))}
        </div>
      </div>

      <p className="auth-footer">
        SEVEN INTERNATIONAL UNIVERSITY · #WeTheDoers
      </p>
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <Header onLogin={() => navigate("/profiles")} />

      <main>
        <Hero onGetStarted={() => navigate("/profiles")} />
        <Features />
      </main>

      <Footer />
    </>
  );
}

function ProfilesRoute() {
  const navigate = useNavigate();

  return (
    <ProfileSelection
      onBack={() => navigate("/")}
      onSelect={(path) => navigate(path)}
    />
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const { signInStudent } = useAuth();

  async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const matricule = (formData.get("matricule") || "").trim();

    if (!matricule) {
      alert("Please enter your matricule.");
      return;
    }

    try {
      await signInStudent(
        matricule,
        formData.get("password"),
        formData.get("remember") === "on"
      );
      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <Login
      onBack={() => navigate("/profiles")}
      onRegister={() => navigate("/register")}
      onLogin={handleLogin}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await register({
        fullName: formData.get("fullName"),
        sex: formData.get("sex"),
        department: formData.get("department"),
        level: formData.get("level"),
        matricule: formData.get("matricule"),
        admissionYear: formData.get("admissionYear"),
        password,
      });
      alert("Registration successful! You can now sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <Register
      onBack={() => navigate("/login")}
      onLogin={() => navigate("/login")}
      onRegister={handleRegister}
    />
  );
}

function DelegateLoginRoute() {
  const navigate = useNavigate();
  const { signInDelegate } = useAuth();

  async function handleDelegateLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      await signInDelegate(
        (formData.get("delegateId") || "").trim(),
        formData.get("password")
      );
      navigate("/delegate/attendance", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <DelegateLogin
      onBack={() => navigate("/profiles")}
      onLogin={handleDelegateLogin}
    />
  );
}

function StaffLoginRoute({ title, description }) {
  const navigate = useNavigate();
  const { signInStaff } = useAuth();

  async function handleStaffLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      const role = await signInStaff(
        (formData.get("staffId") || "").trim(),
        formData.get("password")
      );
      // The account decides the destination, whichever form was used.
      navigate(role === "admin" ? "/admin" : "/staff", { replace: true });
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <StaffLogin
      title={title}
      description={description}
      onBack={() => navigate("/profiles")}
      onLogin={handleStaffLogin}
    />
  );
}

// Sign out, then land on the profile screen. Going "back" afterwards hits the
// route guard, which redirects instead of showing stale data.
function useSignOut() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return () => {
    signOut();
    navigate("/profiles", { replace: true });
  };
}

function DashboardRoute() {
  const navigate = useNavigate();
  const signOut = useSignOut();

  return (
    <Dashboard
      onLogout={signOut}
      onOpenGradeSimulator={() => navigate("/dashboard/grade-simulator")}
    />
  );
}

function GradeSimulatorRoute() {
  const navigate = useNavigate();

  return <GradeSimulator onBack={() => navigate("/dashboard")} />;
}

function DelegateAttendanceRoute() {
  const signOut = useSignOut();

  return <DelegateAttendance onLogout={signOut} />;
}

// A delegate, staff or admin page: role-guarded and wrapped in the shared layout.
function portalPage(role, redirectTo, title, content) {
  return (
    <ProtectedRoute role={role} redirectTo={redirectTo}>
      <PortalRoute key={title} title={title}>
        {content}
      </PortalRoute>
    </ProtectedRoute>
  );
}

function PortalRoute({ title, children }) {
  const signOut = useSignOut();

  return (
    <PortalLayout title={title} onLogout={signOut}>
      {children}
    </PortalLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/profiles" element={<ProfilesRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/delegate-login" element={<DelegateLoginRoute />} />

      <Route
        path="/staff-login"
        element={
          <StaffLoginRoute
            key="staff"
            title="Lecturer / Supervisor Login"
            description="Access your teaching and supervision space."
          />
        }
      />
      <Route
        path="/admin-login"
        element={
          <StaffLoginRoute
            key="admin"
            title="Administration Login"
            description="Access university administration tools."
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="student" redirectTo="/login">
            <DashboardRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/grade-simulator"
        element={
          <ProtectedRoute role="student" redirectTo="/login">
            <GradeSimulatorRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delegate/attendance"
        element={
          <ProtectedRoute role="delegate" redirectTo="/delegate-login">
            <DelegateAttendanceRoute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delegate/disputes"
        element={portalPage("delegate", "/delegate-login", "Attendance Disputes", <DisputeQueue />)}
      />

      <Route
        path="/staff"
        element={portalPage("staff", "/staff-login", "Classes & Attendance", <StaffClasses />)}
      />
      <Route
        path="/staff/disputes"
        element={portalPage("staff", "/staff-login", "Attendance Disputes", <DisputeQueue />)}
      />

      <Route
        path="/admin"
        element={portalPage("admin", "/admin-login", "Course Management", <AdminCourses />)}
      />
      <Route
        path="/admin/announcements"
        element={portalPage("admin", "/admin-login", "Announcements", <AdminAnnouncements />)}
      />
      <Route
        path="/admin/calendar"
        element={portalPage("admin", "/admin-login", "Assessment Calendar", <AdminCalendar />)}
      />
      <Route
        path="/admin/disputes"
        element={portalPage("admin", "/admin-login", "Attendance Disputes", <DisputeQueue />)}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
