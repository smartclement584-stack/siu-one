import "../App.css";
import { ComingSoon } from "../components/NavItems";

function Login({ onBack, onRegister, onLogin }) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-logo">SIU <i>One</i></span>
        <span className="auth-tagline">YOUR UNIVERSITY, ONE PORTAL</span>
      </div>

      <div className="auth-card">
        <button className="back-link" onClick={onBack}>
          ← Back to profiles
        </button>

        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK, DOER</span>
          <h1>Sign in to SIU One</h1>
          <p>Access your university life from one place.</p>
        </div>

        <form onSubmit={onLogin}>
          <label htmlFor="matricule">Matricule</label>
          <input
            id="matricule"
            name="matricule"
            placeholder="Enter your matricule"
            required
          />

          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
          />

          <div className="auth-options">
            <label className="remember-option">
              <input type="checkbox" name="remember" />
              Remember me
            </label>
            <ComingSoon title="Password reset is not available yet">
              Forgot password?
            </ComingSoon>
          </div>

          <button className="auth-submit" type="submit">
            Sign In →
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{" "}
          <button onClick={onRegister}>Create one</button>
        </div>
      </div>

      <p className="auth-footer">
        SEVEN INTERNATIONAL UNIVERSITY · #WeTheDoers
      </p>
    </div>
  );
}

export default Login;