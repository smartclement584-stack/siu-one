import { useEffect, useState } from "react";
import { getCourses, createCourse, updateCourse, getStaff, reportError } from "../api";
import { DEPARTMENTS, LEVELS } from "../academics";

const emptyForm = { name: "", department: DEPARTMENTS[0], level: LEVELS[0], staffId: "" };

// Admin: create, edit, assign and deactivate courses.
function AdminCourses() {
  const [data, setData] = useState(null); // null = loading
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCourses(), getStaff()])
      .then(([courses, staff]) => {
        if (!cancelled) setData({ courses, staff });
      })
      .catch((error) => {
        if (!cancelled) reportError(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (data === null) return <p className="delegate-empty">Loading…</p>;

  const { courses, staff } = data;
  const sorted = [...courses].sort(
    (a, b) =>
      a.department.localeCompare(b.department) ||
      a.level.localeCompare(b.level) ||
      a.name.localeCompare(b.name)
  );

  const setField = (field) => (event) =>
    setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const replaceCourse = (saved) =>
    setData((previous) => ({
      ...previous,
      courses: previous.courses.some((c) => c.id === saved.id)
        ? previous.courses.map((c) => (c.id === saved.id ? saved : c))
        : [...previous.courses, saved],
    }));

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function edit(course) {
    setEditingId(course.id);
    setForm({
      name: course.name,
      department: course.department,
      level: course.level,
      staffId: course.staffId || "",
    });
    document.getElementById("course-form")?.scrollIntoView({ behavior: "smooth" });
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      alert("Please enter a course name.");
      return;
    }

    setBusy(true);
    try {
      const saved = editingId
        ? await updateCourse(editingId, form)
        : await createCourse(form);
      replaceCourse(saved);
      resetForm();
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(course) {
    if (
      course.active &&
      !window.confirm(
        `Deactivate "${course.name}"? Students and delegates will no longer see it. Its attendance history is kept.`
      )
    ) {
      return;
    }
    try {
      replaceCourse(await updateCourse(course.id, { active: !course.active }));
    } catch (error) {
      reportError(error);
    }
  }

  return (
    <>
      <section className="delegate-session-panel" id="course-form">
        <div className="delegate-panel-heading">
          <div>
            <h2>{editingId ? "Edit Course" : "New Course"}</h2>
            <p>Students see the courses of their own department and level.</p>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="delegate-session-fields">
            <div>
              <label htmlFor="courseName">Course Name</label>
              <input
                id="courseName"
                type="text"
                maxLength={100}
                value={form.name}
                onChange={setField("name")}
              />
            </div>

            <div>
              <label htmlFor="courseDepartment">Department</label>
              <select id="courseDepartment" value={form.department} onChange={setField("department")}>
                {DEPARTMENTS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="courseLevel">Level</label>
              <select id="courseLevel" value={form.level} onChange={setField("level")}>
                {LEVELS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="courseStaff">Lecturer</label>
              <select id="courseStaff" value={form.staffId} onChange={setField("staffId")}>
                <option value="">Not assigned</option>
                {staff.map((person) => (
                  <option key={person.staffId} value={person.staffId}>
                    {person.fullName} ({person.staffId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="delegate-report-actions portal-actions">
            {editingId && (
              <button type="button" className="portal-button secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className="delegate-save-session" disabled={busy}>
              {editingId ? "Save Changes" : "+ Create Course"}
            </button>
          </div>
        </form>
      </section>

      <section className="delegate-student-panel portal-section" id="course-list">
        <div className="delegate-panel-heading">
          <div>
            <h2>Courses</h2>
            <p>Deactivated courses keep their attendance history.</p>
          </div>
          <span className="delegate-count">
            {courses.filter((c) => c.active).length} active
          </span>
        </div>

        {sorted.length === 0 && <p className="delegate-empty">No courses yet.</p>}

        {sorted.map((course) => (
          <article className="attendance-history-item" key={course.id}>
            <div>
              <h3>{course.name}</h3>
              <p>
                {course.department} · {course.level} ·{" "}
                {course.lecturerName || "No lecturer assigned"}
              </p>
            </div>

            <div className="portal-actions">
              {!course.active && <span className="dispute-pill rejected">Deactivated</span>}
              <button type="button" className="portal-button secondary" onClick={() => edit(course)}>
                Edit
              </button>
              <button
                type="button"
                className={`portal-button${course.active ? " danger" : ""}`}
                onClick={() => toggleActive(course)}
              >
                {course.active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default AdminCourses;
