
import "../App.css";

function DelegateLogin({ onBack, onLogin }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <button type="button" onClick={onBack}>
          ← Back
        </button>

        <h1>SIU One</h1>
        <h2>Class Delegate Login</h2>
        <p>Access your class management space.</p>

        <form onSubmit={onLogin}>
          <label>Delegate ID</label>
          <input
            type="text"
            name="delegateId"
            placeholder="Enter your delegate ID"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
          />

          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default DelegateLogin;

