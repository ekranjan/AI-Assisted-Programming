// Tiny DOM utilities to keep app.js clean

export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

export function $on(target, event, handler, options) {
  target.addEventListener(event, handler, options);
  return () => target.removeEventListener(event, handler, options);
}

export function setText(el, value) {
  if (!el) return;
  el.textContent = value;
}

export function setStatusPill(el, mode) {
  if (!el) return;

  el.classList.remove("status-pill--idle", "status-pill--loading", "status-pill--error");

  if (mode === "loading") {
    el.classList.add("status-pill--loading");
    setText(el, "Thinking");
  } else if (mode === "error") {
    el.classList.add("status-pill--error");
    setText(el, "Error");
  } else {
    el.classList.add("status-pill--idle");
    setText(el, "Idle");
  }
}

