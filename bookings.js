const bookings = {
  data: [],
  weekStart: startOfWeek(new Date()),

  async load() {
    try {
      this.data = await api.get("/api/bookings");
    } catch (e) {
      console.error(e);
      this.data = [];
    }
    this.renderWeek();
    this.fillTimeOptions();
  },

  async saveAll() {
    await api.post("/api/bookings", this.data);
    this.renderWeek();
  },

  prevWeek() {
    this.weekStart = addDays(this.weekStart, -7);
    this.renderWeek();
  },

  nextWeek() {
    this.weekStart = addDays(this.weekStart, 7);
    this.renderWeek();
  },

  renderWeek() {
    const label = document.getElementById("calendar-week-label");
    const start = this.weekStart;
    const end = addDays(start, 6);
    label.textContent = `${fmtDateShort(start)} - ${fmtDateShort(end)}`;

    const days = [...Array(7)].map((_, i) => addDays(start, i));
    const hours = [...Array(11)].map((_, i) => 12 + i); // 12..22

    const container = document.getElementById("bookings-calendar");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:120px;">Time</th>
          ${days.map(d => `<th>${weekday(d)}<br><span style="opacity:.7">${fmtISO(d)}</span></th>`).join("")}
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");

    for (const h of hours) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><strong>${to12(h)}</strong></td>` + days.map(d => {
        const iso = fmtISO(d);
        const b = this.data.find(x => x.date === iso && parseInt(x.time, 10) === h);
        if (b) {
          return `<td>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <div><strong>${escapeHtml(b.customer || "Customer")}</strong></div>
              <div style="opacity:.8; font-size:.9rem;">${escapeHtml(b.service || "")}</div>
              <div style="opacity:.7; font-size:.85rem;">${escapeHtml(b.source || "manual")}</div>
              <div style="display:flex; gap:6px; margin-top:6px;">
                <button class="btn btn-secondary" onclick="bookings.edit('${b.id}')">Edit</button>
              </div>
            </div>
          </td>`;
        }
        return `<td>
          <button class="btn btn-primary" onclick="bookings.quickAdd('${iso}', ${h})">Book</button>
        </td>`;
      }).join("");
      tbody.appendChild(tr);
    }

    container.appendChild(table);
  },

  fillTimeOptions() {
    const sel = document.getElementById("booking-time");
    sel.innerHTML = "";
    for (let h = 12; h <= 22; h++) {
      const opt = document.createElement("option");
      opt.value = String(h);
      opt.textContent = to12(h);
      sel.appendChild(opt);
    }
  },

  openModal() {
    this.resetModal();
    showModal("booking-modal", true);
  },

  closeModal() {
    showModal("booking-modal", false);
  },

  resetModal() {
    document.getElementById("booking-id").value = "";
    document.getElementById("booking-customer").value = "";
    document.getElementById("booking-service").value = "Haircut";
    document.getElementById("booking-date").value = fmtISO(new Date());
    document.getElementById("booking-time").value = "12";
    document.getElementById("btn-delete-booking").style.display = "none";
  },

  quickAdd(dateStr, hour) {
    this.openModal();
    document.getElementById("booking-date").value = dateStr;
    document.getElementById("booking-time").value = String(hour);
  },

  edit(id) {
    const b = this.data.find(x => x.id === id);
    if (!b) return;
    this.openModal();
    document.getElementById("booking-id").value = b.id;
    document.getElementById("booking-customer").value = b.customer || "";
    document.getElementById("booking-service").value = b.service || "Haircut";
    document.getElementById("booking-date").value = b.date;
    document.getElementById("booking-time").value = String(b.time);
    const delBtn = document.getElementById("btn-delete-booking");
    delBtn.style.display = "block";
    delBtn.onclick = () => this.remove(id);
  },

  async remove(id) {
    this.data = this.data.filter(x => x.id !== id);
    await this.saveAll();
    this.closeModal();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("booking-id").value || randId();
    const customer = document.getElementById("booking-customer").value.trim();
    const service = document.getElementById("booking-service").value;
    const date = document.getElementById("booking-date").value;
    const time = document.getElementById("booking-time").value;

    // prevent double booking
    const taken = bookings.data.some(b => b.id !== id && b.date === date && String(b.time) === String(time));
    if (taken) return alert("❌ This time is already booked.");

    const existing = bookings.data.find(b => b.id === id);
    const obj = {
      id,
      customer,
      service,
      date,
      time,
      source: existing?.source || "manual"
    };

    if (existing) {
      Object.assign(existing, obj);
    } else {
      bookings.data.push(obj);
    }

    await bookings.saveAll();
    bookings.closeModal();
  });
});
