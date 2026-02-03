const auth = {
  config: { adminUser: "admin", adminPass: "admin123" },
  key: "3bd_auth",

  init() {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.login();
    });
    this.checkAuth();
  },

  checkAuth() {
    const ok = localStorage.getItem(this.key) === "true";
    document.getElementById("auth-screen").style.display = ok ? "none" : "flex";
    document.getElementById("app").style.display = ok ? "block" : "none";
    if (ok) {
      const el = document.getElementById("current-date");
      if (el) el.textContent = new Date().toLocaleString();
    }
  },

  login() {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const err = document.getElementById("auth-error");

    if (u === this.config.adminUser && p === this.config.adminPass) {
      localStorage.setItem(this.key, "true");
      err.style.display = "none";
      this.checkAuth();
      // load default section data
      bookings.load();
      inventory.load();
      accounting.load();
      bot.loadSettings();
      bot.loadLogs();
      cameras.load();
    } else {
      err.textContent = "❌ Wrong username or password";
      err.style.display = "block";
    }
  },

  logout() {
    localStorage.removeItem(this.key);
    location.reload();
  }
};
