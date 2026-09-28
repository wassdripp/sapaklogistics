// Trackk — Main Application Controller

class TrackkApp {
  constructor() {
    this.currentView = 'dashboard';
    this.activeShipmentId = null;
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.carrierFilter = 'ALL';

    this.init();
  }

  init() {
    // Populate cities in the New Shipment modal dropdowns
    populateCitySelects();

    // Setup Event Listeners
    this.setupNavigation();
    this.setupModals();
    this.setupTableFilters();
    this.setupDirectLookup();
    this.setupKeyboardShortcuts();

    // Subscribe to store updates
    store.subscribe(() => {
      this.refreshAll();
    });

    // Handle hash routing on initial load
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();

    // Initial render
    this.refreshAll();
  }

  // ================= Routing & View Switching =================
  switchView(viewName, shipmentId = null) {
    this.currentView = viewName;

    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Hide all view panels, show target
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Close mobile sidebar if open
    document.getElementById('sidebar')?.classList.remove('open');

    // View specific logic
    if (viewName === 'detail') {
      if (shipmentId) {
        this.activeShipmentId = shipmentId;
        window.location.hash = `track/${shipmentId}`;
        this.renderDetailView(shipmentId);
      }
    } else {
      window.location.hash = viewName;
      if (viewName === 'shipments') {
        this.renderShipmentsTable();
      } else if (viewName === 'dashboard') {
        this.renderDashboard();
      }
    }

    // Scroll to top
    document.getElementById('content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash.startsWith('track/')) {
      const id = hash.replace('track/', '');
      this.switchView('detail', id);
    } else if (hash === 'shipments') {
      this.switchView('shipments');
    } else {
      this.switchView('dashboard');
    }
  }

  refreshAll() {
    this.updateCounters();
    this.renderDashboard();
    this.renderShipmentsTable();
    this.populateCarrierFilterOptions();

    if (this.currentView === 'detail' && this.activeShipmentId) {
      this.renderDetailView(this.activeShipmentId);
    }
  }

  // ================= Navigation Listeners =================
  setupNavigation() {
    // Nav items
    document.getElementById('nav-dashboard')?.addEventListener('click', () => this.switchView('dashboard'));
    document.getElementById('nav-shipments')?.addEventListener('click', () => this.switchView('shipments'));
    
    // Add shipment buttons
    document.getElementById('nav-add-btn')?.addEventListener('click', () => this.openNewShipmentModal());
    document.getElementById('btn-top-add')?.addEventListener('click', () => this.openNewShipmentModal());
    document.getElementById('btn-list-add')?.addEventListener('click', () => this.openNewShipmentModal());
    document.getElementById('btn-empty-add')?.addEventListener('click', () => this.openNewShipmentModal());

    // Back button in detail view
    document.getElementById('btn-back-to-list')?.addEventListener('click', () => this.switchView('shipments'));

    // Mobile sidebar toggle
    document.getElementById('mobile-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
    });

    // Sample data reset button
    document.getElementById('btn-quick-sample')?.addEventListener('click', () => {
      if (confirm('Reset to initial sample shipments?')) {
        store.resetSampleData();
        showToast('Demo data restored');
        this.switchView('dashboard');
      }
    });

    // Export CSV buttons
    document.getElementById('btn-export-csv-table')?.addEventListener('click', () => {
      const filtered = this.getFilteredShipments();
      exportShipmentsToCSV(filtered);
    });
  }

  // ================= Keyboard Shortcuts =================
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // ⌘K or Ctrl+K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const globalSearch = document.getElementById('global-search-input');
        if (globalSearch) {
          globalSearch.focus();
          globalSearch.select();
        }
      }

      // Escape key closes modals
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Global search input redirects to shipments table
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const val = e.target.value;
        const tableSearch = document.getElementById('table-search-input');
        if (tableSearch) tableSearch.value = val;
        this.searchQuery = val.toLowerCase().trim();
        if (this.currentView !== 'shipments' && val.trim().length > 0) {
          this.switchView('shipments');
        } else {
          this.renderShipmentsTable();
        }
      });
    }
  }

  // ================= Direct Fast Lookup =================
  setupDirectLookup() {
    const form = document.getElementById('form-direct-lookup');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('direct-lookup-input');
        const code = (input?.value || '').trim();
        if (!code) return;

        const found = store.getById(code);
        if (found) {
          input.value = '';
          this.switchView('detail', found.id);
        } else {
          // Check for partial match
          const all = store.getAll();
          const partial = all.find(s => 
            s.id.toLowerCase().includes(code.toLowerCase()) || 
            s.recipient.toLowerCase().includes(code.toLowerCase())
          );
          if (partial) {
            input.value = '';
            this.switchView('detail', partial.id);
          } else {
            showToast(`No package found matching "${code}"`, 'error');
          }
        }
      });
    }
  }

  // ================= Modals Logic =================
  setupModals() {
    // New Shipment modal
    const modalNew = document.getElementById('modal-new-shipment');
    const closeNewBtn = document.getElementById('modal-close-btn');
    const cancelNewBtn = document.getElementById('btn-cancel-modal');
    const formNew = document.getElementById('form-create-shipment');
    const btnGenTracking = document.getElementById('btn-gen-tracking');

    btnGenTracking?.addEventListener('click', () => {
      const input = document.getElementById('input-tracking-id');
      if (input) input.value = generateTrackingId();
    });

    closeNewBtn?.addEventListener('click', () => this.closeAllModals());
    cancelNewBtn?.addEventListener('click', () => this.closeAllModals());

    // Submit New Shipment
    formNew?.addEventListener('submit', (e) => {
      e.preventDefault();
      const trackingId = document.getElementById('input-tracking-id').value.trim();
      const recipient = document.getElementById('input-recipient').value.trim();
      const origin = document.getElementById('select-origin-city').value;
      const destination = document.getElementById('select-dest-city').value;
      const carrier = document.getElementById('select-carrier').value;
      const status = document.getElementById('select-status').value;
      const estDelivery = document.getElementById('input-est-delivery').value;
      const packageType = document.getElementById('input-package-type').value.trim();
      const weight = document.getElementById('input-weight').value.trim();
      const notes = document.getElementById('input-notes').value.trim();

      if (!trackingId || !recipient) {
        showToast('Please fill in required fields', 'error');
        return;
      }

      // Check if ID already exists
      if (store.getById(trackingId)) {
        showToast('Tracking ID already exists. Generating new one.', 'error');
        document.getElementById('input-tracking-id').value = generateTrackingId();
        return;
      }

      // Save
      const created = store.create({
        id: trackingId,
        recipient,
        origin,
        destination,
        carrier,
        status,
        estDelivery,
        packageType: packageType || 'General Freight',
        weight: weight || '2.0 kg',
        notes: notes || 'Standard parcel service'
      });

      this.closeAllModals();
      showToast(`Shipment ${created.id} registered!`);
      formNew.reset();

      // Immediately navigate to the newly created shipment detail view with map
      this.switchView('detail', created.id);
    });

    // Status Update modal
    const modalStatus = document.getElementById('modal-update-status');
    const closeStatusBtn = document.getElementById('modal-status-close-btn');
    const cancelStatusBtn = document.getElementById('btn-cancel-status-modal');
    const formStatus = document.getElementById('form-update-status');

    closeStatusBtn?.addEventListener('click', () => this.closeAllModals());
    cancelStatusBtn?.addEventListener('click', () => this.closeAllModals());

    formStatus?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('status-update-shipment-id').value;
      const newStatus = document.getElementById('status-update-select').value;
      const location = document.getElementById('status-update-location').value.trim();
      const note = document.getElementById('status-update-note').value.trim();

      const item = store.getById(id);
      if (!item) return;

      // Update status
      store.update(id, { status: newStatus });

      // Add timeline checkpoint
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      store.addCheckpoint(id, {
        title: `Status: ${newStatus}`,
        location: location || item.currentLocation || item.origin,
        date: timeStr,
        note: note || `Package status updated to ${newStatus}.`,
        statusKey: newStatus
      });

      this.closeAllModals();
      showToast(`Status updated to ${newStatus}`);
      this.renderDetailView(id);
    });

    // Close on backdrop click
    [modalNew, modalStatus].forEach(modal => {
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAllModals();
      });
    });
  }

  openNewShipmentModal() {
    const modal = document.getElementById('modal-new-shipment');
    const input = document.getElementById('input-tracking-id');
    const estInput = document.getElementById('input-est-delivery');
    
    if (input) input.value = generateTrackingId();
    if (estInput) {
      const d = new Date();
      d.setDate(d.getDate() + 6);
      estInput.value = d.toISOString().split('T')[0];
    }

    modal?.classList.add('show');
    document.getElementById('input-recipient')?.focus();
  }

  openStatusModal(shipment) {
    const modal = document.getElementById('modal-update-status');
    document.getElementById('status-update-shipment-id').value = shipment.id;
    document.getElementById('status-modal-subtitle').textContent = `${shipment.id} — ${shipment.recipient}`;
    document.getElementById('status-update-select').value = shipment.status;
    document.getElementById('status-update-location').value = shipment.currentLocation || '';
    document.getElementById('status-update-note').value = '';
    modal?.classList.add('show');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('show'));
  }

  // ================= Dashboard / Track Page Rendering =================
  renderDashboard() {
    const shipments = store.getAll();

    // Render shipment cards grid
    const grid = document.getElementById('recent-tracked-grid');
    if (!grid) return;

    if (!shipments.length) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px 0; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">No shipments yet</p>
          <p>Click <strong>"Track New Item"</strong> to add your first shipment.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = shipments.map(item => `
      <div class="tracked-card" onclick="app.switchView('detail', '${item.id}')">
        <div class="tracked-card-top">
          <span class="tracked-card-id">${item.id}</span>
          ${renderStatusBadge(item.status)}
        </div>
        <div class="tracked-card-route">
          <span>${item.origin}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
          <span>${item.destination}</span>
        </div>
        <div class="tracked-card-bottom">
          <span class="tracked-card-carrier">${item.carrier} &bull; ${item.recipient}</span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${item.estDelivery || ''}</span>
        </div>
      </div>
    `).join('');

    // Wire up the hero "create a new shipment" link
    document.getElementById('btn-hero-add-shipment')?.addEventListener('click', () => this.openNewShipmentModal());
  }

  // ================= Shipments Table Rendering =================
  setupTableFilters() {
    const searchInput = document.getElementById('table-search-input');
    const statusSelect = document.getElementById('filter-status-select');
    const carrierSelect = document.getElementById('filter-carrier-select');

    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderShipmentsTable();
    });

    statusSelect?.addEventListener('change', (e) => {
      this.statusFilter = e.target.value;
      this.renderShipmentsTable();
    });

    carrierSelect?.addEventListener('change', (e) => {
      this.carrierFilter = e.target.value;
      this.renderShipmentsTable();
    });
  }

  populateCarrierFilterOptions() {
    const select = document.getElementById('filter-carrier-select');
    if (!select) return;

    const shipments = store.getAll();
    const carriers = [...new Set(shipments.map(s => s.carrier))].filter(Boolean);

    let html = '<option value="ALL">All Carriers</option>';
    carriers.forEach(c => {
      html += `<option value="${c}">${c}</option>`;
    });

    select.innerHTML = html;
    select.value = this.carrierFilter;
  }

  getFilteredShipments() {
    let list = store.getAll();

    if (this.statusFilter !== 'ALL') {
      list = list.filter(s => s.status.toLowerCase() === this.statusFilter.toLowerCase());
    }

    if (this.carrierFilter !== 'ALL') {
      list = list.filter(s => s.carrier === this.carrierFilter);
    }

    if (this.searchQuery) {
      list = list.filter(s => 
        s.id.toLowerCase().includes(this.searchQuery) ||
        s.recipient.toLowerCase().includes(this.searchQuery) ||
        s.origin.toLowerCase().includes(this.searchQuery) ||
        s.destination.toLowerCase().includes(this.searchQuery) ||
        s.carrier.toLowerCase().includes(this.searchQuery)
      );
    }

    return list;
  }

  renderShipmentsTable() {
    const tbody = document.getElementById('shipments-tbody');
    const emptyState = document.getElementById('table-empty-state');
    const countLabel = document.getElementById('filtered-items-count');
    const table = document.getElementById('shipments-table');

    if (!tbody) return;

    const filtered = this.getFilteredShipments();
    if (countLabel) countLabel.textContent = `Showing ${filtered.length} shipment${filtered.length === 1 ? '' : 's'}`;

    if (!filtered.length) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (table) table.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (table) table.style.display = 'table';

    tbody.innerHTML = filtered.map(item => {
      return `
        <tr onclick="app.handleRowClick(event, '${item.id}')">
          <td>
            <div class="tracking-code-cell">
              <span>${item.id}</span>
              <button class="btn-cell-copy" onclick="event.stopPropagation(); copyToClipboard('${item.id}');" title="Copy tracking ID">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              </button>
            </div>
          </td>
          <td><strong>${item.recipient}</strong></td>
          <td>${item.origin}</td>
          <td>${item.destination}</td>
          <td>${item.carrier}</td>
          <td>${renderStatusBadge(item.status)}</td>
          <td>${item.estDelivery || 'Pending'}</td>
          <td class="text-right">
            <div class="table-row-actions">
              <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); app.switchView('detail', '${item.id}')">
                Track Route &rarr;
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  handleRowClick(e, id) {
    this.switchView('detail', id);
  }

  // ================= Shipment Detail & World Map =================
  renderDetailView(id) {
    const shipment = store.getById(id);
    if (!shipment) {
      showToast('Shipment not found', 'error');
      this.switchView('shipments');
      return;
    }

    // Hero details
    document.getElementById('detail-tracking-code').textContent = shipment.id;
    document.getElementById('detail-recipient').textContent = shipment.recipient;
    document.getElementById('detail-origin-city').textContent = shipment.origin;
    document.getElementById('detail-dest-city').textContent = shipment.destination;

    // Status & progress
    const statusContainer = document.getElementById('detail-status-container');
    if (statusContainer) {
      statusContainer.innerHTML = renderStatusBadge(shipment.status, true);
    }

    const progressPct = shipment.progress || 50;
    document.getElementById('detail-progress-percent').textContent = `${progressPct}%`;
    document.getElementById('detail-progress-fill').style.width = `${progressPct}%`;

    // Specs
    document.getElementById('detail-carrier').textContent = shipment.carrier;
    document.getElementById('detail-package-type').textContent = shipment.packageType || 'Commercial Freight';
    document.getElementById('detail-weight').textContent = shipment.weight || 'Standard';
    document.getElementById('detail-dispatch-date').textContent = shipment.dispatchDate || 'Recorded';
    document.getElementById('detail-notes').textContent = shipment.notes || 'None specified.';

    // Floating map overlay text
    document.getElementById('map-hub-name').textContent = shipment.currentLocation || shipment.origin;
    document.getElementById('map-est-date').textContent = shipment.estDelivery || 'Approaching';

    // RENDER INTERACTIVE WORLD MAP!
    setTimeout(() => {
      mapManager.renderShipmentRoute(shipment);
    }, 50);

    // Quick status transition buttons
    this.renderQuickAdvanceButtons(shipment);

    // Timeline Stepper
    this.renderTimelineStepper(shipment);

    // Detail Action buttons
    const btnCopy = document.getElementById('btn-detail-copy');
    if (btnCopy) {
      btnCopy.onclick = () => copyToClipboard(shipment.id);
    }

    const btnStatusModal = document.getElementById('btn-open-status-modal');
    if (btnStatusModal) {
      btnStatusModal.onclick = () => this.openStatusModal(shipment);
    }

    const btnAddLog = document.getElementById('btn-add-checkpoint-log');
    if (btnAddLog) {
      btnAddLog.onclick = () => this.openStatusModal(shipment);
    }

    const btnDelete = document.getElementById('btn-detail-delete');
    if (btnDelete) {
      btnDelete.onclick = () => {
        if (confirm(`Are you sure you want to stop tracking shipment ${shipment.id}?`)) {
          store.delete(shipment.id);
          showToast(`Shipment ${shipment.id} deleted`);
          this.switchView('shipments');
        }
      };
    }
  }

  renderQuickAdvanceButtons(shipment) {
    const container = document.getElementById('quick-advance-btns');
    if (!container) return;

    const status = shipment.status;
    let buttons = [];

    if (status === 'Pending') {
      buttons.push({ label: 'Mark Picked Up', nextStatus: 'In Transit' });
    } else if (status === 'In Transit') {
      buttons.push({ label: 'Out for Delivery', nextStatus: 'Out for Delivery' });
      buttons.push({ label: 'Mark Delivered', nextStatus: 'Delivered' });
      buttons.push({ label: 'Report Delay', nextStatus: 'Delayed', btnClass: 'btn-outline' });
    } else if (status === 'Out for Delivery') {
      buttons.push({ label: 'Confirm Delivered', nextStatus: 'Delivered' });
    } else if (status === 'Delayed') {
      buttons.push({ label: 'Resume Transit', nextStatus: 'In Transit' });
    } else if (status === 'Delivered') {
      buttons.push({ label: 'Re-open Transit', nextStatus: 'In Transit', btnClass: 'btn-outline' });
    }

    container.innerHTML = buttons.map(b => {
      const cls = b.btnClass || 'btn-terracotta';
      return `
        <button class="btn btn-sm ${cls}" onclick="app.quickAdvanceStatus('${shipment.id}', '${b.nextStatus}')">
          ${b.label}
        </button>
      `;
    }).join('');
  }

  quickAdvanceStatus(id, newStatus) {
    store.update(id, { status: newStatus });
    
    // Add timeline milestone
    const item = store.getById(id);
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    let loc = item.currentLocation || item.destination;
    if (newStatus === 'Delivered') loc = item.destination;

    store.addCheckpoint(id, {
      title: `Shipment ${newStatus}`,
      location: loc,
      date: timeStr,
      note: `Package advanced to ${newStatus}.`,
      statusKey: newStatus
    });

    showToast(`Updated to ${newStatus}`);
    this.renderDetailView(id);
  }

  renderTimelineStepper(shipment) {
    const container = document.getElementById('detail-timeline-steps');
    if (!container) return;

    const timeline = shipment.timeline || [];

    if (!timeline.length) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No timeline events recorded.</p>`;
      return;
    }

    container.innerHTML = timeline.map((step, idx) => {
      const isLatest = idx === timeline.length - 1;
      const isCompleted = idx < timeline.length - 1 || shipment.status === 'Delivered';
      const nodeClass = isCompleted ? 'completed' : (isLatest ? 'active' : 'upcoming');

      return `
        <div class="timeline-step-node ${nodeClass}">
          <div class="step-marker">
            <span class="step-marker-inner"></span>
          </div>
          <div class="step-content">
            <div class="step-header">
              <span class="step-title">${step.title || 'Checkpoint Scan'}</span>
              <span class="step-timestamp">${step.date || ''}</span>
            </div>
            ${step.location ? `<span class="step-location">📍 ${step.location}</span>` : ''}
            ${step.note ? `<p class="step-message">${step.note}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  updateCounters() {
    const all = store.getAll();
    const countEl = document.getElementById('nav-shipment-count');
    if (countEl) countEl.textContent = all.length;
  }
}

// Instantiate App when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new TrackkApp();
});
