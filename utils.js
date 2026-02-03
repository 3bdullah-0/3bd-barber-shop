const api = {
  async get(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async post(path, body) {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
};

function showModal(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("show", !!show);
}

function randId() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])
  );
}

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun
  x.setHours(0,0,0,0);
  x.setDate(x.getDate() - day);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtISO(d) {
  const x = new Date(d);
  return x.toISOString().slice(0,10);
}
function weekday(d) {
  return new Date(d).toLocaleDateString(undefined, { weekday: "short" });
}
function fmtDateShort(d) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function to12(h) {
  const hh = Number(h);
  const ampm = hh >= 12 ? "PM" : "AM";
  const v = ((hh + 11) % 12) + 1;
  return `${v}:00 ${ampm}`;
}
