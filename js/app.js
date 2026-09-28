// SAPAK Logistics — Application Controller with Customer Tracking & Admin Fleet Control

class TrackkApp {
  constructor() {
    this.currentView = 'dashboard';
    this.activeShipmentId = null;
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.carrierFilter = 'ALL';
    this.adminStatusFilter = 'ALL';
    this.adminSearchQuery = '';
    this.pendingDeleteId = null;

    this.isAdmin = sessionStorage.getItem('sapak_admin_auth') === 'true';

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
    this.setupAdminFeatures();
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

    // Update active nav buttons
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

    // Update profile header
    this.updateUserRoleBadge();

    // View specific logic
    if (viewName === 'detail') {
      if (shipmentId) {
        this.activeShipmentId = shipmentId;
        window.location.hash = `track/${shipmentId}`;
        this.renderDetailView(shipmentId);
      }
    } else if (viewName === 'admin') {
      window.location.hash = 'admin';
      this.renderAdminView();
    } else if (viewName === 'shipments') {
      window.location.hash = 'shipments';
      this.renderShipmentsTable();
    } else {
      window.location.hash = 'track';
      this.renderDashboard();
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
    } else if (hash === 'admin') {
      this.switchView('admin');
    } else {
      this.switchView('dashboard');
    }
  }

  updateUserRoleBadge() {
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const topAdminBtn = document.getElementById('top-admin-btn-label');

    if (this.isAdmin) {
      if (roleEl) roleEl.textContent = 'Fleet Administrator';
      if (avatarEl) avatarEl.textContent = 'ADM';
      if (topAdminBtn) topAdminBtn.textContent = 'Admin Mode';
    } else {
      if (roleEl) roleEl.textContent = 'Public Tracking Portal';
      if (avatarEl) avatarEl.textContent = 'SL';
      if (topAdminBtn) topAdminBtn.textContent = 'Admin Portal';
    }
  }

  refreshAll() {
    this.updateCounters();
    this.renderDashboard();
    this.renderShipmentsTable();
    this.populateCarrierFilterOptions();

    if (this.currentView === 'admin') {
      this.renderAdminView();
    } else if (this.currentView === 'detail' && this.activeShipmentId) {
      this.renderDetailView(this.activeShipmentId);
    }
  }

  // ================= Navigation Listeners =================
  setupNavigation() {
    // Nav buttons
    document.getElementById('nav-dashboard')?.addEventListener('click', () => this.switchView('dashboard'));
    document.getElementById('nav-shipments')?.addEventListener('click', () => this.switchView('shipments'));
    document.getElementById('nav-admin')?.addEventListener('click', () => this.switchView('admin'));
    document.getElementById('btn-top-admin-toggle')?.addEventListener('click', () => this.switchView('admin'));

    // Back button in detail view
    document.getElementById('btn-back-to-list')?.addEventListener('click', () => this.switchView('shipments'));

    // Mobile sidebar toggle
    document.getElementById('mobile-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
    });

    // Export CSV from public table
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

  // ================= Customer Dashboard / Track Page =================
  renderDashboard() {
    const shipments = store.getAll();

    // Render shipment cards grid
    const grid = document.getElementById('recent-tracked-grid');
    if (!grid) return;

    if (!shipments.length) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 6px;">No active shipments recorded</p>
          <p style="font-size: 0.88rem;">Track any parcel by entering its tracking ID in the search bar above.</p>
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
          <span style="font-size: 0.78rem; color: var(--text-muted);">${item.estDelivery || 'In Transit'}</span>
        </div>
      </div>
    `).join('');
  }

  // ================= Customer Shipments Directory =================
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

    tbody.innerHTML = filtered.map(item => `
      <tr onclick="app.switchView('detail', '${item.id}')">
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
    `).join('');
  }

  // ================= Public Shipment Detail & Map =================
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

    // Render Google Map
    setTimeout(() => {
      mapManager.renderShipmentRoute(shipment);
    }, 50);

    // Timeline Stepper
    this.renderTimelineStepper(shipment);

    // Detail Copy button
    const btnCopy = document.getElementById('btn-detail-copy');
    if (btnCopy) {
      btnCopy.onclick = () => copyToClipboard(shipment.id);
    }
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

  // ================= ADMIN PORTAL =================
  setupAdminFeatures() {
    // Admin Login Form
    const loginForm = document.getElementById('form-admin-login');
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('input-admin-pass').value;
      if (pass === 'admin123' || pass === 'admin') {
        this.isAdmin = true;
        sessionStorage.setItem('sapak_admin_auth', 'true');
        showToast('Admin access granted');
        this.updateUserRoleBadge();
        this.renderAdminView();
      } else {
        showToast('Invalid passcode. Default is admin123', 'error');
      }
    });

    // Admin Logout
    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
      this.isAdmin = false;
      sessionStorage.removeItem('sapak_admin_auth');
      showToast('Logged out of Admin Portal');
      this.updateUserRoleBadge();
      this.renderAdminView();
    });

    // Admin Create button
    document.getElementById('btn-admin-create-shipment')?.addEventListener('click', () => {
      this.openNewShipmentModal();
    });

    // Admin Search & Filter
    const adminSearch = document.getElementById('admin-table-search');
    const adminStatus = document.getElementById('admin-filter-status');

    adminSearch?.addEventListener('input', (e) => {
      this.adminSearchQuery = e.target.value.toLowerCase().trim();
      this.renderAdminTable();
    });

    adminStatus?.addEventListener('change', (e) => {
      this.adminStatusFilter = e.target.value;
      this.renderAdminTable();
    });

    // Confirm Delete Button in Delete Modal
    document.getElementById('btn-confirm-delete')?.addEventListener('click', () => {
      if (this.pendingDeleteId) {
        store.delete(this.pendingDeleteId);
        showToast(`Shipment ${this.pendingDeleteId} deleted permanently`);
        this.closeAllModals();
        this.pendingDeleteId = null;
        this.refreshAll();
      }
    });

    // Pause Form Submission
    const pauseForm = document.getElementById('form-pause-shipment');
    pauseForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const targetId = document.getElementById('pause-target-id').value;
      const actionType = document.getElementById('pause-action-type').value;
      const reason = document.getElementById('select-pause-reason').value;
      const customNote = document.getElementById('input-pause-note').value.trim();

      const item = store.getById(targetId);
      if (!item) return;

      const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      if (actionType === 'pause') {
        store.update(targetId, { status: 'Paused' });
        store.addCheckpoint(targetId, {
          title: 'Shipment On Hold / Paused',
          location: item.currentLocation || item.origin,
          date: nowStr,
          note: `${reason}. ${customNote}`,
          statusKey: 'Paused'
        });
        showToast(`Shipment ${targetId} placed on hold`);
      } else {
        store.update(targetId, { status: 'In Transit' });
        store.addCheckpoint(targetId, {
          title: 'Shipment Resumed',
          location: item.currentLocation || item.origin,
          date: nowStr,
          note: `Routing resumed: ${customNote || 'Hold cleared, package in transit.'}`,
          statusKey: 'In Transit'
        });
        showToast(`Shipment ${targetId} resumed routing`);
      }

      this.closeAllModals();
      this.refreshAll();
    });
  }

  renderAdminView() {
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboardScreen = document.getElementById('admin-dashboard-screen');

    if (!this.isAdmin) {
      if (loginScreen) loginScreen.style.display = 'flex';
      if (dashboardScreen) dashboardScreen.style.display = 'none';
      return;
    }

    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboardScreen) dashboardScreen.style.display = 'block';

    // Update Admin Stats
    const shipments = store.getAll();
    let transit = 0, paused = 0, delivered = 0;

    shipments.forEach(s => {
      const st = (s.status || '').toLowerCase();
      if (st.includes('pause') || st.includes('hold')) paused++;
      else if (st.includes('deliver')) delivered++;
      else if (st.includes('transit') || st.includes('out')) transit++;
    });

    document.getElementById('admin-stat-total').textContent = shipments.length;
    document.getElementById('admin-stat-transit').textContent = transit;
    document.getElementById('admin-stat-paused').textContent = paused;
    document.getElementById('admin-stat-delivered').textContent = delivered;

    // Render Admin Table
    this.renderAdminTable();
  }

  renderAdminTable() {
    const tbody = document.getElementById('admin-shipments-tbody');
    const countEl = document.getElementById('admin-table-count');
    if (!tbody) return;

    let list = store.getAll();

    if (this.adminStatusFilter !== 'ALL') {
      list = list.filter(s => s.status.toLowerCase() === this.adminStatusFilter.toLowerCase());
    }

    if (this.adminSearchQuery) {
      list = list.filter(s =>
        s.id.toLowerCase().includes(this.adminSearchQuery) ||
        s.recipient.toLowerCase().includes(this.adminSearchQuery) ||
        s.origin.toLowerCase().includes(this.adminSearchQuery) ||
        s.destination.toLowerCase().includes(this.adminSearchQuery) ||
        s.carrier.toLowerCase().includes(this.adminSearchQuery)
      );
    }

    if (countEl) countEl.textContent = `Showing ${list.length} shipment${list.length === 1 ? '' : 's'}`;

    if (!list.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">
            No records match the current admin filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(item => {
      const isPaused = item.status === 'Paused';
      const pauseBtnLabel = isPaused ? '▶️ Resume' : '⏸️ Pause';
      const pauseBtnClass = isPaused ? 'btn-outline' : 'btn-warning';

      return `
        <tr>
          <td>
            <div class="tracking-code-cell">
              <span>${item.id}</span>
              <button class="btn-cell-copy" onclick="copyToClipboard('${item.id}');" title="Copy tracking ID">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              </button>
            </div>
          </td>
          <td>
            <strong>${item.recipient}</strong>
            <div style="font-size: 0.76rem; color: var(--text-muted);">${item.packageType || 'General Freight'}</div>
          </td>
          <td>${item.origin} &rarr; ${item.destination}</td>
          <td>${item.carrier}</td>
          <td>${renderStatusBadge(item.status)}</td>
          <td>
            <div style="font-size: 0.78rem; font-weight: 600; margin-bottom: 2px;">${item.progress}%</div>
            <div style="height: 5px; width: 60px; background: var(--bg-subtle); border-radius: 99px; overflow: hidden;">
              <div style="height: 100%; width: ${item.progress}%; background: var(--accent-terracotta);"></div>
            </div>
          </td>
          <td class="text-right">
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
              <button class="btn btn-sm btn-outline" onclick="app.switchView('detail', '${item.id}')" title="View Customer Map">
                👁️ Map
              </button>
              <button class="btn btn-sm ${pauseBtnClass}" onclick="app.openPauseModal('${item.id}')" title="${isPaused ? 'Resume shipment' : 'Hold/Pause shipment'}">
                ${pauseBtnLabel}
              </button>
              <button class="btn btn-sm btn-outline" onclick="app.openStatusModal('${item.id}')" title="Update Status & Log Note">
                ✏️ Status
              </button>
              <button class="btn btn-sm btn-danger-outline" onclick="app.promptDeleteShipment('${item.id}')" title="Delete shipment">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ================= MODALS MANAGEMENT =================
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

    // Submit New Shipment (Admin)
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

      if (store.getById(trackingId)) {
        showToast('Tracking ID already exists. Generating new one.', 'error');
        document.getElementById('input-tracking-id').value = generateTrackingId();
        return;
      }

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
      this.refreshAll();
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

      store.update(id, { status: newStatus });

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
      this.refreshAll();
    });

    // Delete Modal
    document.getElementById('modal-delete-close-btn')?.addEventListener('click', () => this.closeAllModals());
    document.getElementById('btn-cancel-delete')?.addEventListener('click', () => this.closeAllModals());

    // Pause Modal
    document.getElementById('modal-pause-close-btn')?.addEventListener('click', () => this.closeAllModals());
    document.getElementById('btn-cancel-pause-modal')?.addEventListener('click', () => this.closeAllModals());

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
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

  openStatusModal(id) {
    const shipment = typeof id === 'object' ? id : store.getById(id);
    if (!shipment) return;

    const modal = document.getElementById('modal-update-status');
    document.getElementById('status-update-shipment-id').value = shipment.id;
    document.getElementById('status-modal-subtitle').textContent = `${shipment.id} — ${shipment.recipient}`;
    document.getElementById('status-update-select').value = shipment.status;
    document.getElementById('status-update-location').value = shipment.currentLocation || '';
    document.getElementById('status-update-note').value = '';
    modal?.classList.add('show');
  }

  openPauseModal(id) {
    const shipment = store.getById(id);
    if (!shipment) return;

    const modal = document.getElementById('modal-pause-shipment');
    const isPaused = shipment.status === 'Paused';

    document.getElementById('pause-target-id').value = shipment.id;
    document.getElementById('pause-modal-subtitle').textContent = `${shipment.id} (${shipment.recipient})`;

    if (isPaused) {
      document.getElementById('pause-modal-title').textContent = 'Resume Shipment';
      document.getElementById('pause-action-type').value = 'resume';
      document.getElementById('pause-reason-group').style.display = 'none';
      document.getElementById('input-pause-note').placeholder = 'e.g. Cleared inspection, continuing transit to destination';
      document.getElementById('btn-submit-pause').textContent = 'Resume Transit';
      document.getElementById('btn-submit-pause').className = 'btn btn-terracotta';
    } else {
      document.getElementById('pause-modal-title').textContent = 'Place Shipment on Hold / Pause';
      document.getElementById('pause-action-type').value = 'pause';
      document.getElementById('pause-reason-group').style.display = 'block';
      document.getElementById('input-pause-note').placeholder = 'e.g. Awaiting additional clearance documentation';
      document.getElementById('btn-submit-pause').textContent = 'Place on Hold';
      document.getElementById('btn-submit-pause').className = 'btn btn-warning';
    }

    modal?.classList.add('show');
  }

  promptDeleteShipment(id) {
    this.pendingDeleteId = id;
    const modal = document.getElementById('modal-delete-confirm');
    const targetLabel = document.getElementById('delete-modal-target-id');
    if (targetLabel) targetLabel.textContent = id;
    modal?.classList.add('show');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('show'));
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
