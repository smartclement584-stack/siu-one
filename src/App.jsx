import "./App.css";
import studentPhoto from "./assets/student-campus.jpeg";
import { useState } from "react";
import { login, register, delegateLogin, logout } from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DelegateLogin from "./pages/DelegateLogin";
import DelegateAttendance from "./pages/DelegateAttendance";
import GradeSimulator from "./pages/GradeSimulator";

function Logo() {
  return (
    <a className="brand" href="#home">
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
    </a>
  );
}

function Header({onLogin }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />

        <nav className="navigation">
          <a className="active" href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#news">News</a>
          <a href="#contact">Contact</a>
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
            <a className="btn secondary" href="#features">
              <span>▶</span> Watch Demo
            </a>
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

function ProfileSelection({ onBack, onSelectStudent, onSelectDelegate  }) {
  const profiles = [
    {
      icon: "🎓",
      title: "Student",
      description: "Access your academic space, courses and results.",
      available: true,
    },
    {
      icon: "🛡️",
      title: "Super Administrator",
      description: "Manage the university platform and its users.",
      available: false,
    },
    {
      icon: "👥",
      title: "Sector Supervisor",
      description: "Supervise academic and administrative activities.",
      available: false,
    },
    {
  icon: "📋",
  title: "Class Delegate",
  description: "Manage class attendance and student records.",
  available: true,
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
              className={`profile-card ${
                profile.available ? "available" : "unavailable"
              }`}
              disabled={!profile.available}
              onClick={
     profile.available
    ? profile.title === "Class Delegate"
      ? onSelectDelegate
      : onSelectStudent
    : undefined
}
            >
              <span className="profile-icon">{profile.icon}</span>

              <span className="profile-title">
                {profile.title}
              </span>

              <span className="profile-description">
                {profile.description}
              </span>

              <span className="profile-action">
                {profile.available
                  ? "Continue →"
                  : "Coming soon"}
              </span>
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

function App() {
  const [page, setPage] = useState("home");
  const [currentStudentMatricule, setCurrentStudentMatricule] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const matricule = (formData.get("matricule") || "").trim();
    const password = formData.get("password");

    if (!matricule) {
      alert("Please enter your matricule.");
      return;
    }

    try {
      const { student } = await login(matricule, password);
      setCurrentStudentMatricule(student.matricule);
      setPage("dashboard");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleDelegateLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      await delegateLogin(
        (formData.get("delegateId") || "").trim(),
        formData.get("password")
      );
      setPage("delegate-attendance");
    } catch (error) {
      alert(error.message);
    }
  }

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
      setPage("login");
    } catch (error) {
      alert(error.message);
    }
  }

  function handleLogout() {
    logout();
    setCurrentStudentMatricule("");
    setPage("profiles");
  }

  // PROFILE SELECTION
  if (page === "profiles") {
  return (
    <ProfileSelection
      onBack={() => setPage("home")}
      onSelectStudent={() => setPage("login")}
      onSelectDelegate={() => setPage("delegate-login")}
    />
  );
}

  // STUDENT LOGIN
  if (page === "login") {
    return (
      <Login
        onBack={() => setPage("profiles")}
        onRegister={() => setPage("register")}
        onLogin={handleLogin}
      />
    );
  }
  if (page === "delegate-login") {
  return (
    <DelegateLogin
      onBack={() => setPage("profiles")}
      onLogin={handleDelegateLogin}
    />
  );
}
if (page === "delegate-attendance") {
  return (
    <DelegateAttendance
      onLogout={handleLogout}
    />
  );
}
  // STUDENT REGISTRATION
  if (page === "register") {
    return (
      <Register
        onBack={() => setPage("login")}
        onLogin={() => setPage("login")}
        onRegister={handleRegister}
      />
    );
  }
  // STUDENT DASHBOARD
if (page === "dashboard") {
  return (
    <Dashboard
  onLogout={handleLogout}
  onOpenGradeSimulator={() => setPage("grade-simulator")}
  currentStudentMatricule={currentStudentMatricule}
/>
  );
}


// GRADE SIMULATOR
if (page === "grade-simulator") {
  return (
    <GradeSimulator
      onBack={() => setPage("dashboard")}
      currentStudentMatricule={currentStudentMatricule}
    />
  );
}
  // LANDING PAGE
  return (
    <>
      <Header onLogin={() => setPage("profiles")} />

      <main>
        <Hero onGetStarted={() => setPage("profiles")} />
        <Features />
      </main>

      <Footer />
    </>
  );
}

export default App;