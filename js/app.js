function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineFormatting(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function renderPlainTextAsHtml(text) {
  if (!text.trim()) {
    return "<p class='editor-empty'>No text content yet.</p>";
  }

  return text
    .split(/\r?\n/)
    .map((line) => {
      if (!line.trim()) {
        return "<br />";
      }

      if (line.startsWith("## ")) {
        return `<h2>${renderInlineFormatting(line.slice(3))}</h2>`;
      }

      if (line.startsWith("> ")) {
        return `<blockquote><p>${renderInlineFormatting(line.slice(2))}</p></blockquote>`;
      }

      return `<p>${renderInlineFormatting(line)}</p>`;
    })
    .join("");
}

function renderEditorOutput(output, text, mode) {
  if (!output) return;
  if (mode === "html") {
    output.innerHTML = text || "<p class='editor-empty'>No HTML content yet.</p>";
    return;
  }

  output.innerHTML = renderPlainTextAsHtml(text);
}

function applyTemplate(textarea, template) {
  if (!textarea) return;
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const value = textarea.value;
  const selected = value.slice(start, end) || "text";

  if (template === "bold" || template === "italic") {
    const marker = template === "bold" ? "**" : "*";
    const hasWrappedSelection =
      start >= marker.length &&
      value.slice(start - marker.length, start) === marker &&
      value.slice(end, end + marker.length) === marker;

    if (hasWrappedSelection) {
      textarea.value =
        value.slice(0, start - marker.length) +
        value.slice(start, end) +
        value.slice(end + marker.length);
      textarea.setSelectionRange(start - marker.length, end - marker.length);
      textarea.focus();
      return;
    }

    const nextValue =
      value.slice(0, start) + marker + selected + marker + value.slice(end);
    textarea.value = nextValue;
    const cursorStart = start + marker.length;
    const cursorEnd = cursorStart + selected.length;
    textarea.setSelectionRange(cursorStart, cursorEnd);
    textarea.focus();
    return;
  }

  if (template === "h2" || template === "quote") {
    const prefix = template === "h2" ? "## " : "> ";
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const selectionText = value.slice(start, end);
    const newlineCount = (selectionText.match(/\n/g) || []).length;
    const lineEnd = value.indexOf("\n", end);
    const blockEnd = lineEnd === -1 ? value.length : lineEnd;
    const targetEnd = newlineCount > 0 ? end : blockEnd;
    const target = value.slice(lineStart, targetEnd);
    const lines = target.split("\n");
    const hasOnlyPrefixed = lines.every((line) => !line || line.startsWith(prefix));
    const updated = lines
      .map((line) => {
        if (!line) return line;
        if (hasOnlyPrefixed && line.startsWith(prefix)) {
          return line.slice(prefix.length);
        }
        return hasOnlyPrefixed ? line : `${prefix}${line}`;
      })
      .join("\n");

    textarea.value = value.slice(0, lineStart) + updated + value.slice(targetEnd);
    textarea.setSelectionRange(lineStart, lineStart + updated.length);
    textarea.focus();
    return;
  }
}

function initTextEditor() {
  const root = document.getElementById("text-editor");
  if (!root) return;

  root.innerHTML = `
    <div class="editor-toolbar">
      <div class="editor-mode">
        <button type="button" data-mode="text" class="editor-mode-btn is-active">Plain Text</button>
        <button type="button" data-mode="html" class="editor-mode-btn">HTML</button>
      </div>
      <div class="editor-format">
        <button type="button" data-format="bold" class="editor-action-btn">Bold</button>
        <button type="button" data-format="italic" class="editor-action-btn">Italic</button>
        <button type="button" data-format="h2" class="editor-action-btn">H2</button>
        <button type="button" data-format="quote" class="editor-action-btn">Quote</button>
      </div>
    </div>
    <textarea id="editor-input" class="editor-input" rows="8" placeholder="Write something..."></textarea>
    <div class="editor-output-wrap">
      <h3 class="editor-output-title">Preview</h3>
      <div id="editor-output" class="editor-output"></div>
    </div>
  `;

  const textarea = root.querySelector("#editor-input");
  const output = root.querySelector("#editor-output");
  const modeButtons = [...root.querySelectorAll(".editor-mode-btn")];
  const formatButtons = [...root.querySelectorAll(".editor-action-btn")];

  if (!textarea) {
    const message = "Text editor textarea does not exist.";
    console.error(message);
    root.innerHTML = `<p class="editor-empty">${message}</p>`;
    return;
  }

  if (!output) {
    const message = "Text editor preview output does not exist.";
    console.error(message);
    root.innerHTML = `<p class="editor-empty">${message}</p>`;
    return;
  }

  let currentMode = "text";

  const rerender = () => renderEditorOutput(output, textarea.value, currentMode);

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.dataset.mode;
      if (!nextMode || nextMode === currentMode) return;
      currentMode = nextMode;
      modeButtons.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.mode === currentMode);
      });
      rerender();
    });
  });

  formatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const template = button.dataset.format;
      if (!template) return;
      applyTemplate(textarea, template);
      rerender();
    });
  });

  textarea.addEventListener("input", rerender);
  rerender();
}

async function main() {
  initTextEditor();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}

