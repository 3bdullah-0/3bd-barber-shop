const app = {
  navigate(section) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(section + "-section");
    if (!target) {
      console.error("Section not found:", section);
      return;
    }
    target.classList.add("active");

    // lazy load on open
    if (section === "bookings") bookings.load();
    if (section === "inventory") inventory.load();
    if (section === "accounting") accounting.load();
    if (section === "bot") { bot.loadSettings(); bot.loadLogs(); }
    if (section === "cameras") cameras.load();
  },

  init() {
    // ensure home is active
    this.navigate("home");
  }
};
