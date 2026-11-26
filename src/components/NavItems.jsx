// Nav items that must not touch the URL / browser history.

// Smooth-scrolls to a section on the current page. No href, so no #hash history entry.
export function ScrollLink({ to, className, children }) {
  function handleClick(event) {
    event.preventDefault();
    const target = to ? document.getElementById(to) : null;
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <a
      className={className}
      href={`#${to || ""}`}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

// A feature that isn't built yet: visibly inactive, announces itself, goes nowhere.
export function ComingSoon({ as: Tag = "a", className = "", children, ...rest }) {
  return (
    <Tag
      title="Coming soon"
      {...rest}
      className={`${className} is-disabled`.trim()}
      aria-disabled="true"
      onClick={(event) => event.preventDefault()}
    >
      {children}
    </Tag>
  );
}
