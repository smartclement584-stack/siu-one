
import { useEffect, useState } from "react";
import "../App.css";
import { getCourses, saveGoal, reportError } from "../api";
import { useAuth } from "../auth/useAuth";
import { ScrollLink } from "../components/NavItems";

function GradeSimulator({ onBack }) {
  // The route guard guarantees a verified student session here.
  const { user } = useAuth();
  const currentStudentMatricule = user.matricule;
  const [disciplines, setDisciplines] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;

    getCourses()
      .then((courses) => {
        if (!cancelled) setDisciplines(courses.map((course) => course.name));
      })
      .catch((error) => {
        if (!cancelled) reportError(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [selectedDiscipline, setSelectedDiscipline] = useState("");

  const [scores, setScores] = useState({
    participation: "",
    assignments: "",
    midterm: "",
  });

  const [target, setTarget] = useState("60");

  function updateScore(field, value) {
    setScores((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function getSimulationResult() {
    const { participation, assignments, midterm } = scores;

    if (
      selectedDiscipline === "" ||
      participation === "" ||
      assignments === "" ||
      midterm === ""
    ) {
      return null;
    }

    const values = [participation, assignments, midterm].map(Number);

    if (
      values.some(
        (score) =>
          !Number.isFinite(score) || score < 0 || score > 100
      )
    ) {
      return null;
    }

    const currentScore =
      values[0] * 0.10 +
      values[1] * 0.20 +
      values[2] * 0.30;

    const required = (Number(target) - currentScore) / 0.40;
    const maximumFinalGrade = currentScore + 40;

    if (required <= 0) {
      return {
        status: "secured",
        target: Number(target),
        current: currentScore.toFixed(2),
      };
    }

    if (required > 100) {
      return {
        status: "impossible",
        target: Number(target),
        required: required.toFixed(2),
        maximum: maximumFinalGrade.toFixed(2),
      };
    }

    return {
      status: "possible",
      target: Number(target),
      required: required.toFixed(2),
    };
  }

  async function handleSaveGoal() {
    try {
      await saveGoal(currentStudentMatricule, {
        discipline: selectedDiscipline,
        target: simulationResult.target,
        requiredFinal:
          simulationResult.status === "possible"
            ? simulationResult.required
            : "Already secured",
      });
      alert("Academic goal saved!");
    } catch (error) {
      reportError(error);
    }
  }

  // Calculate the result once per render
  const simulationResult = getSimulationResult();

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <strong>SIU <span>One</span></strong>
          <small>SEVEN INTERNATIONAL UNIVERSITY</small>
        </div>

        <p className="sidebar-label">ACADEMIC TOOLS</p>

        <nav className="dashboard-nav">
          <a
            href="/dashboard"
            onClick={(event) => {
              event.preventDefault();
              onBack();
            }}
          >
            ⌂ <span>Dashboard</span>
          </a>

          <ScrollLink className="selected" to="simulator">
            ▥ <span>Grade Simulator</span>
          </ScrollLink>
        </nav>

        <div className="sidebar-bottom">
          <p>#WeTheDoers 💚🧡</p>
          <button onClick={onBack}>← Back to Dashboard</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h2>Grade Simulator</h2>
            <p>Plan your academic performance.</p>
          </div>

          <div className="user-avatar">S</div>
        </header>

        <section className="welcome-banner">
          <div>
            <span>TAKE CONTROL OF YOUR RESULTS</span>
            <h1>Plan your success.</h1>
            <p>
              Discover what scores you need to achieve
              your academic goals.
            </p>
          </div>

          <div className="banner-decoration">
            SIU<br />ONE
          </div>
        </section>

        <section className="dashboard-panel" id="simulator">
          <div className="section-heading">
            <h3>Grade Simulation</h3>
            <span>Academic performance calculator</span>
          </div>

          <div className="simulator-form">
            {/* DISCIPLINE */}
            <div className="simulator-field">
              <label>Select a Discipline</label>

              <select
                value={selectedDiscipline}
                onChange={(event) =>
                  setSelectedDiscipline(event.target.value)
                }
              >
                <option value="">Choose a discipline</option>

                {disciplines?.map((discipline) => (
                  <option key={discipline} value={discipline}>
                    {discipline}
                  </option>
                ))}
              </select>

              {disciplines?.length === 0 && (
                <small>No courses have been set up for your class yet.</small>
              )}
            </div>

            {/* EXISTING SCORES */}
            <h3 className="simulator-subtitle">
              Your Assessment Scores
            </h3>

            <p className="simulator-description">
              Enter your scores out of 100 for each completed assessment.
            </p>

            <div className="simulator-field">
              <label>Punctuality & Lab Participation (10%)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Score / 100"
                value={scores.participation}
                onChange={(event) =>
                  updateScore("participation", event.target.value)
                }
              />
            </div>

            <div className="simulator-field">
              <label>Assignments & Labs (20%)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Score / 100"
                value={scores.assignments}
                onChange={(event) =>
                  updateScore("assignments", event.target.value)
                }
              />
            </div>

            <div className="simulator-field">
              <label>Mid-Term Exam (30%)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Score / 100"
                value={scores.midterm}
                onChange={(event) =>
                  updateScore("midterm", event.target.value)
                }
              />
            </div>

            {/* ACADEMIC TARGET */}
            <h3 className="simulator-subtitle">
              Your Academic Goal
            </h3>

            <div className="simulator-field">
              <label>Choose your target grade</label>

              <select
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              >
                <option value="60">C — 60% (Pass)</option>
                <option value="65">C+ — 65%</option>
                <option value="70">B- — 70%</option>
                <option value="75">B — 75%</option>
                <option value="80">B+ — 80%</option>
                <option value="85">A- — 85%</option>
                <option value="90">A — 90%</option>
                <option value="95">A+ — 95%</option>
              </select>
            </div>

            {/* SIMULATION RESULT */}
            {simulationResult && (
              <div
                className={`simulation-result ${simulationResult.status}`}
              >
                <h3>Simulation Result</h3>

                {simulationResult.status === "secured" && (
                  <>
                    <p>
                      Congratulations! You have already secured
                      your target of{" "}
                      <strong>{simulationResult.target}%</strong>.
                    </p>
                    <p>
                      Your current weighted score is{" "}
                      <strong>{simulationResult.current}%</strong>.
                      You have already reached your goal before
                      the Final Exam.
                    </p>
                  </>
                )}

                {simulationResult.status === "impossible" && (
                  <>
                    <p>
                      Your target grade of{" "}
                      <strong>{simulationResult.target}%</strong>{" "}
                      is no longer reachable.
                    </p>

                    <p>
                      You would need{" "}
                      <strong>{simulationResult.required}%</strong>{" "}
                      in your Final Exam.
                    </p>

                    <p>
                      Even with a perfect score of 100%, your
                      maximum final grade would be{" "}
                      <strong>{simulationResult.maximum}%</strong>.
                    </p>

                    <span>
                      Consider setting a lower academic target.
                    </span>
                  </>
                )}

                {simulationResult.status === "possible" && (
                  <>
                    <p>
                      To reach your target of{" "}
                      <strong>{simulationResult.target}%</strong>,
                      you need at least{" "}
                      <strong>{simulationResult.required}%</strong>{" "}
                      in your Final Exam.
                    </p>

                    <span>Final Exam weight: 40%</span>
                  </>
                )}
              </div>
            )}
                        {/* SAVE ACADEMIC GOAL */}
            {(simulationResult?.status === "possible" ||
              simulationResult?.status === "secured") && (
              <div className="save-goal-section">
                <h3>Make it your new academic goal?</h3>

                <p>
                  Would you like to save this target for
                  {` ${selectedDiscipline}`}?
                </p>

                <button onClick={handleSaveGoal}>
                  Yes, set my goal
                </button>
              </div>
            )}
          </div>
        </section>

        <footer className="dashboard-footer">
          SIU ONE · BUILDING A BRIGHTER FUTURE TOGETHER
        </footer>
      </main>
    </div>
  );
  
}

export default GradeSimulator;
