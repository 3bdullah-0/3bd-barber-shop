const cameras = {
  load() {
    const grid = document.getElementById("camera-grid");
    // placeholder boxes (you can replace with real stream URLs later)
    const cams = [
      { name: "Camera 1", url: "" },
      { name: "Camera 2", url: "" },
      { name: "Camera 3", url: "" },
      { name: "Camera 4", url: "" }
    ];

    grid.innerHTML = cams.map(c => `
      <div class="card" style="min-height:200px; align-items:flex-start; text-align:left; cursor:default;">
        <h3 style="margin:0 0 8px 0;">${c.name}</h3>
        ${c.url
          ? `<iframe src="${c.url}" style="width:100%; height:140px; border:0; border-radius:12px;"></iframe>`
          : `<div style="width:100%; height:140px; border:1px dashed #444; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#888;">
              Not connected yet
            </div>`
        }
        <div style="opacity:.7; font-size:.9rem; margin-top:8px;">Ready for IP/DVR integration</div>
      </div>
    `).join("");
  },

  refreshAll() {
    this.load();
  }
};
