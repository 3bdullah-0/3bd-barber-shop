/**
 * Accounting Module
 * Tracks finances, income, and expenses.
 * Refactored to use API.
 */
const accounting = {
    data: [],

    // Categories
    categories: {
        income: ['Haircut', 'Beard Trim', 'Shave', 'Facial', 'Product Sale', 'Other'],
        expense: ['Rent', 'Electricity', 'Water', 'Supplies', 'Maintenance', 'Salary', 'Other']
    },

    async init() {
        // Load from API
        try {
            const res = await fetch('/api/accounting');
            this.data = await res.json();
        } catch (e) {
            console.error('Failed to load accounting data', e);
        }

        const form = document.getElementById('transaction-form');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTransaction();
        });

        this.render();
    },

    render() {
        this.renderStats();
        this.renderTable();
    },

    renderStats() {
        let income = 0;
        let expenses = 0;

        this.data.forEach(t => {
            if (t.type === 'income') income += t.amount;
            if (t.type === 'expense') expenses += t.amount;
        });

        const incEl = document.getElementById('total-income');
        const expEl = document.getElementById('total-expenses');
        const netEl = document.getElementById('net-balance');

        if (incEl) incEl.textContent = app.formatMoney(income);
        if (expEl) expEl.textContent = app.formatMoney(expenses);

        const net = income - expenses;
        if (netEl) {
            netEl.textContent = app.formatMoney(net);
            if (net >= 0) netEl.style.color = 'var(--success)';
            else netEl.style.color = 'var(--danger)';
        }
    },

    renderTable() {
        const tbody = document.getElementById('accounting-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        // Sort by date desc (newest first)
        const sorted = [...this.data].sort((a, b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(t => {
            const tr = document.createElement('tr');
            const typeColor = t.type === 'income' ? 'var(--success)' : 'var(--danger)';
            const typeSign = t.type === 'income' ? '+' : '-';

            tr.innerHTML = `
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.desc}</td>
                <td><span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.85rem;">${t.category}</span></td>
                <td style="text-transform: capitalize;">${t.type}</td>
                <td class="text-right" style="color: ${typeColor}; font-weight: bold;">
                    ${typeSign}${app.formatMoney(t.amount)}
                </td>
                <td>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem;" onclick="accounting.deleteTransaction('${t.id}')">×</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No transactions recorded</td></tr>';
        }
    },

    openTransactionModal(type) {
        document.getElementById('transaction-modal').classList.add('active');
        document.getElementById('transaction-form').reset();

        document.getElementById('trans-type').value = type;

        const title = type === 'income' ? 'Record Income' : 'Record Expense';
        document.getElementById('transaction-title').textContent = title;

        // Populate Categories
        const catSelect = document.getElementById('trans-category');
        catSelect.innerHTML = '';
        this.categories[type].forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            catSelect.appendChild(opt);
        });
    },

    closeModal() {
        document.getElementById('transaction-modal').classList.remove('active');
    },

    async saveTransaction() {
        const type = document.getElementById('trans-type').value;
        const amount = parseFloat(document.getElementById('trans-amount').value);
        const desc = document.getElementById('trans-desc').value;
        const category = document.getElementById('trans-category').value;

        this.data.push({
            id: app.generateId(),
            date: new Date().toISOString(),
            type,
            amount,
            desc,
            category
        });

        await this.persist();
        this.render();
        this.closeModal();
    },

    async deleteTransaction(id) {
        if (confirm('Delete this transaction?')) {
            this.data = this.data.filter(t => t.id !== id);
            await this.persist();
            this.render();
        }
    },

    async persist() {
        try {
            await fetch('/api/accounting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });
        } catch (e) {
            console.error('Failed to save accounting', e);
            alert('Error saving data. Check connection.');
        }
    }
};

accounting.init();
