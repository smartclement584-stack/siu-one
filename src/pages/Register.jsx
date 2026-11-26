import "../App.css";

function Register({ onBack, onLogin, onRegister }) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-logo">SIU <i>One</i></span>
        <span className="auth-tagline">YOUR UNIVERSITY, ONE PORTAL</span>
      </div>

      <div className="auth-card register-card">
        <button className="back-link" onClick={onBack}>
          ← Back to sign in
        </button>

        <div className="auth-heading">
          <span className="auth-eyebrow">JOIN THE DOERS</span>
          <h1>Create your account</h1>
          <p>Let's get you connected to your university.</p>
        </div>

        <form onSubmit={onRegister}>
          <div className="form-grid">
            <div className="form-field full">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="sex">Sex</label>
              <select id="sex" name="sex" required defaultValue="">
                <option value="" disabled>Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="department">Department</label>
              <select id="department" name="department" required defaultValue="">
                <option value="" disabled>Select department</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="level">Level</label>
              <select id="level" name="level" required defaultValue="">
                <option value="" disabled>Select level</option>
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="matricule">Matricule</label>
              <input
                id="matricule"
                name="matricule"
                placeholder="Your official matricule"
                required
              />
            </div>

            <div className="form-field full">
              <label htmlFor="admissionYear">Year of Admission</label>
              <select
                id="admissionYear"
                name="admissionYear"
                required
                defaultValue=""
              >
                <option value="" disabled>Select admission year</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            <div className="form-field full">
              <label htmlFor="registerPassword">Password</label>
              <input
                id="registerPassword"
                name="password"
                type="password"
                placeholder="Create a password"
                minLength={8}
                required
              />
            </div>

            <div className="form-field full">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                minLength={8}
                required
              />
            </div>
          </div>

          <button className="auth-submit" type="submit">
            Create Account →
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{" "}
          <button onClick={onLogin}>Sign in</button>
        </div>
      </div>

      <p className="auth-footer">
        SEVEN INTERNATIONAL UNIVERSITY · #WeTheDoers
      </p>
    </div>
  );
}

export default Register;