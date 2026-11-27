import { useEffect, useState } from "react";
import { reportError } from "../api";

// Admin "form + list" editor used for announcements and calendar events.
// `api` is { list, create, update, remove }; `describe(item)` returns the list text.
function ContentManager({ noun, intro, fields, initialValues, api, describe }) {
  const [items, setItems] = useState(null); // null = loading
  const [form, setForm] = useState(initialValues);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const { list } = api;

  useEffect(() => {
    let cancelled = false;

    list()
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((error) => {
        if (!cancelled) reportError(error);
      });

    return () => {
      cancelled = true;
    };
  }, [list]);

  if (items === null) return <p className="delegate-empty">Loading…</p>;

  function resetForm() {
    setEditingId(null);
    setForm(initialValues);
  }

  function edit(item) {
    setEditingId(item.id);
    setForm(Object.fromEntries(fields.map((f) => [f.name, item[f.name]])));
    document.getElementById("content-form")?.scrollIntoView({ behavior: "smooth" });
  }

  async function submit(event) {
    event.preventDefault();
    const missing = fields.find((f) => !f.options && !form[f.name].trim());
    if (missing) {
      alert(`${missing.label} is required.`);
      return;
    }

    setBusy(true);
    try {
      if (editingId) await api.update(editingId, form);
      else await api.create(form);
      resetForm();
      setItems(await api.list()); // re-read so the order matches what students see
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.title}"? Students will no longer see it.`)) return;
    try {
      await api.remove(item.id);
      if (editingId === item.id) resetForm();
      setItems((previous) => previous.filter((other) => other.id !== item.id));
    } catch (error) {
      reportError(error);
    }
  }

  return (
    <>
      <section className="delegate-session-panel" id="content-form">
        <div className="delegate-panel-heading">
          <div>
            <h2>
              {editingId ? "Edit" : "New"} {noun}
            </h2>
            <p>{intro}</p>
          </div>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="delegate-session-fields">
            {fields.map((field) => {
              const props = {
                id: `content-${field.name}`,
                value: form[field.name],
                onChange: (event) =>
                  setForm((previous) => ({ ...previous, [field.name]: event.target.value })),
              };

              return (
                <div key={field.name} className={field.multiline ? "field-wide" : undefined}>
                  <label htmlFor={props.id}>{field.label}</label>
                  {field.options ? (
                    <select {...props}>
                      {field.options.map(([value, text]) => (
                        <option key={value} value={value}>
                          {text}
                        </option>
                      ))}
                    </select>
                  ) : field.multiline ? (
                    <textarea {...props} rows={3} maxLength={field.maxLength} />
                  ) : (
                    <input {...props} type={field.type || "text"} maxLength={field.maxLength} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="delegate-report-actions portal-actions">
            {editingId && (
              <button type="button" className="portal-button secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className="delegate-save-session" disabled={busy}>
              {editingId ? "Save Changes" : `+ Publish ${noun}`}
            </button>
          </div>
        </form>
      </section>

      <section className="delegate-student-panel portal-section" id="content-list">
        <div className="delegate-panel-heading">
          <div>
            <h2>Published</h2>
            <p>Visible on student dashboards.</p>
          </div>
          <span className="delegate-count">{items.length} total</span>
        </div>

        {items.length === 0 && <p className="delegate-empty">Nothing published yet.</p>}

        {items.map((item) => {
          const { heading, detail, note } = describe(item);

          return (
            <article className="attendance-history-item" key={item.id}>
              <div className="content-text">
                <h3>{heading}</h3>
                <p>{detail}</p>
              </div>

              <div className="portal-actions">
                {note && <span className="dispute-pill open">{note}</span>}
                <button type="button" className="portal-button secondary" onClick={() => edit(item)}>
                  Edit
                </button>
                <button type="button" className="portal-button danger" onClick={() => remove(item)}>
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

export default ContentManager;
