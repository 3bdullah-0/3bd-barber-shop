const accounting = {
  data: [],

  async load() {
    try {
      this.data = await api.get("/api/accounting");
    } catch (e) {
      console.error(e);
      this.data = [];
    }
    this.render();
  },

  async saveAll() {
    await api.post("/api/accounting", this.data);
    this.render();
  },

  render() {
    const income = this.data.filter(t => t.type === "income").reduce((a,b)=>a+Number(b.amount||0),0);
    const expense = this.data.filter(t => t.type === "expense").reduce((a,b)=>a+Number(b.amount||0),0);
    const net = income - expense;

    document.getElementById("total-income").textContent = `$${income.toFixed(2)}`;
    document.getElementById("total-expenses").textContent = `$${expense.toFixed(2)}`;
    document.getElementById("net-balance").textContent = `$${net.toFixed(2)}`;

    const tbody = document.getElementById("accounting-table-body");
    tbody.innerHTML = this.data.slice().reverse().map(t => `
      <tr>
        <td>${escapeHtml(t.date || "")}</td>
        <td>${escapeHtml(t.desc || "")}</td>
        <td>${escapeHtml(t.category || "")}</td>
        <td>${t.type === "income" ? "Income" : "Expense"}</td>
        <td class="text-right">$${Number(t.amount||0).toFixed(2)}</td>
        <td>
          <button class="btn btn-secondary" onclick="accounting.edit('${t.id}')">Edit</button>
          <button class="btn btn-danger" onclick="accounting.remove('${t.id}')">Delete</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="6" style="opacity:.7;">No transactions yet.</td></tr>`;
  },

  openTransactionModal(type) {
    document.getElementById("transaction-title").textContent = type === "income" ? "New Income" : "New Expense";
    document.getElementById("trans-id").value = "";
    document.getElementById("trans-type").value = type;
    document.getElementById("trans-amount").value = "";
    document.getElementById("trans-desc").value = "";

    const cat = document.getElementById("trans-category");
    const options = type === "income"
      ? ["Haircut", "Beard", "Products", "Other"]
      : ["Rent", "Supplies", "Bills", "Other"];
    cat.innerHTML = options.map(x => `<option value="${x}">${x}</option>`).join("");

    showModal("transaction-modal", true);
  },

  closeModal() {
    showModal("transaction-modal", false);
  },

  edit(id) {
    const t = this.data.find(x => x.id === id);
    if (!t) return;
    document.getElementById("transaction-title").textContent = "Edit Transaction";
    document.getElementById("trans-id").value = t.id;
    document.getElementById("trans-type").value = t.type;
    document.getElementById("trans-amount").value = String(t.amount || "");
    document.getElementById("trans-desc").value = t.desc || "";

    const cat = document.getElementById("trans-category");
    const options = t.type === "income"
      ? ["Haircut", "Beard", "Products", "Other"]
      : ["Rent", "Supplies", "Bills", "Other"];
    cat.innerHTML = options.map(x => `<option value="${x}">${x}</option>`).join("");
    cat.value = t.category || options[0];

    showModal("transaction-modal", true);
  },

  async remove(id) {
    this.data = this.data.filter(x => x.id !== id);
    await this.saveAll();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transaction-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("trans-id").value || randId();
    const type = document.getElementById("trans-type").value;
    const amount = Number(document.getElementById("trans-amount").value || 0);
    const desc = document.getElementById("trans-desc").value.trim();
    const category = document.getElementById("trans-category").value;
    const date = new Date().toLocaleString();

    const existing = accounting.data.find(x => x.id === id);
    const obj = { id, type, amount, desc, category, date };

    if (existing) Object.assign(existing, obj);
    else accounting.data.push(obj);

    await accounting.saveAll();
    accounting.closeModal();
  });
});
