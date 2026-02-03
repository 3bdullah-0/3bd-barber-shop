const bot = {
  settings: {},

  async loadSettings() {
    try {
      this.settings = await api.get("/api/bot/settings");
    } catch {
      this.settings = {};
    }
    const input = document.getElementById("bot-token");
    if (input) input.value = this.settings.accessToken ? this.settings.accessToken : "";
  },

  async saveSettings() {
    const token = document.getElementById("bot-token").value.trim();
    this.settings = { ...this.settings, accessToken: token };
    await api.post("/api/bot/settings", this.settings);
    document.getElementById("bot-connection-status").textContent = token ? "Token saved ✅" : "Ready for Webhooks";
  },

  async loadLogs() {
    let logs = [];
    try {
      logs = await api.get("/api/bot/logs");
    } catch {
      logs = [];
    }
    const tbody = document.getElementById("bot-logs-body");
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>${escapeHtml(new Date(l.timestamp).toLocaleString())}</td>
        <td>${escapeHtml(l.message || "")}</td>
      </tr>
    `).join("") || `<tr><td colspan="2" style="opacity:.7;">No logs yet.</td></tr>`;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bot-settings-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await bot.saveSettings();
  });
});
