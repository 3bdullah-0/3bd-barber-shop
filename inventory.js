const inventory = {
  data: [],
  filter: "",

  async load() {
    try {
      this.data = await api.get("/api/inventory");
    } catch (e) {
      console.error(e);
      this.data = [];
    }
    this.render();
  },

  async saveAll() {
    await api.post("/api/inventory", this.data);
    this.render();
  },

  render() {
    const tbody = document.getElementById("inventory-table-body");
    const q = (this.filter || "").toLowerCase();

    const rows = this.data
      .filter(p => (p.name || "").toLowerCase().includes(q) || (p.barcode || "").toLowerCase().includes(q))
      .map(p => {
        const qty = Number(p.qty || 0);
        const price = Number(p.price || 0);
        const total = qty * price;
        return `
          <tr>
            <td>${escapeHtml(p.name || "")}</td>
            <td>${qty}</td>
            <td>$${price.toFixed(2)}</td>
            <td>$${total.toFixed(2)}</td>
            <td>${escapeHtml(p.updatedAt || "")}</td>
            <td>
              <button class="btn btn-secondary" onclick="inventory.edit('${p.id}')">Edit</button>
              <button class="btn btn-danger" onclick="inventory.remove('${p.id}')">Delete</button>
            </td>
          </tr>`;
      }).join("");

    tbody.innerHTML = rows || `<tr><td colspan="6" style="opacity:.7;">No products yet.</td></tr>`;
  },

  openModal() {
    document.getElementById("product-id").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-qty").value = "0";
    document.getElementById("product-price").value = "0";
    document.getElementById("product-barcode").value = "";
    showModal("inventory-modal", true);
  },

  closeModal() {
    showModal("inventory-modal", false);
  },

  edit(id) {
    const p = this.data.find(x => x.id === id);
    if (!p) return;
    document.getElementById("product-id").value = p.id;
    document.getElementById("product-name").value = p.name || "";
    document.getElementById("product-qty").value = String(p.qty || 0);
    document.getElementById("product-price").value = String(p.price || 0);
    document.getElementById("product-barcode").value = p.barcode || "";
    showModal("inventory-modal", true);
  },

  async remove(id) {
    this.data = this.data.filter(x => x.id !== id);
    await this.saveAll();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("inventory-search");
  search.addEventListener("input", () => {
    inventory.filter = search.value;
    inventory.render();
  });

  const form = document.getElementById("inventory-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("product-id").value || randId();
    const name = document.getElementById("product-name").value.trim();
    const qty = Number(document.getElementById("product-qty").value || 0);
    const price = Number(document.getElementById("product-price").value || 0);
    const barcode = document.getElementById("product-barcode").value.trim();

    const updatedAt = new Date().toLocaleString();
    const existing = inventory.data.find(x => x.id === id);

    const obj = { id, name, qty, price, barcode, updatedAt };
    if (existing) Object.assign(existing, obj);
    else inventory.data.push(obj);

    await inventory.saveAll();
    inventory.closeModal();
  });
});
