import "../App.css";

// Shared sign-in form for staff (lecturers, supervisors) and administrators.
function StaffLogin({ title, description, onBack, onLogin }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <button type="button" onClick={onBack}>
          ← Back
        </button>

        <h1>SIU One</h1>
        <h2>{title}</h2>
        <p>{description}</p>

        <form onSubmit={onLogin}>
          <label htmlFor="staffId">Staff ID</label>
          <input
            id="staffId"
            type="text"
            name="staffId"
            placeholder="Enter your staff ID"
            required
          />

          <label htmlFor="staffPassword">Password</label>
          <input
            id="staffPassword"
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

export default StaffLogin;
