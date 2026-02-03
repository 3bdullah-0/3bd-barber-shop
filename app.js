/**
 * Main Application Logic
 * Handles global navigation and initialization.
 */
const app = {
    state: {
        currentView: 'home'
    },

    init() {
        // Set current date in header
        const dateEl = document.getElementById('current-date');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);

        console.log('App initialized');
    },

    navigate(viewId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(el => {
            el.classList.remove('active');
        });

        // Show target section
        const target = document.getElementById(`${viewId}-section`);
        if (target) {
            target.classList.add('active');
            this.state.currentView = viewId;

            // Trigger specific module refreshes if needed
            if (viewId === 'bookings' && window.bookings) bookings.render();
            if (viewId === 'inventory' && window.inventory) inventory.render();
            if (viewId === 'cameras' && window.cameras) cameras.render();
            if (viewId === 'accounting' && window.accounting) accounting.render();
        } else {
            // Fallback to home
            document.getElementById('home-section').classList.add('active');
        }
    },

    // Helper to format currency
    formatMoney(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },

    // Helper to generate IDs
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
};
