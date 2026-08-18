/**
 * GUPTA LIBRARY - MAIN APP CONTROLLER & ADMIN ROUTER (ULTRA-RESPONSIVE & PRO)
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 * Email: guptalibraryy@gmail.com
 */

const App = {
  activeView: 'dashboard',

  async init() {
    this.updateAppIdentity();
    this.setupNavigation();
    this.setupTheme();
    this.setupGlobalSearch();
    this.setupModals();
    this.updateDashboardStats();
    this.updateShiftStatus();

    // Initialize sub-modules
    if (window.SupabaseManager) window.SupabaseManager.init();
    if (window.SeatManager) window.SeatManager.init();
    if (window.MemberManager) window.MemberManager.init();
    if (window.FeeManager) window.FeeManager.init();
    if (window.ReportsManager) window.ReportsManager.init();
    if (window.AdminManager) window.AdminManager.init();
    if (window.SettingsManager) window.SettingsManager.init();

    // Initialize Authentication Guard
    if (window.AuthManager) {
      await window.AuthManager.init();
    }
  },

  updateAppIdentity() {
    const settings = window.appState.getSettings();
    
    // Update Header Brand
    document.querySelectorAll('.app-brand-name').forEach(el => el.textContent = settings.name);
    document.querySelectorAll('.app-brand-address').forEach(el => el.textContent = settings.address);
    document.querySelectorAll('.app-brand-email').forEach(el => el.textContent = settings.email);
    document.querySelectorAll('.app-brand-phone').forEach(el => el.textContent = settings.phone);
    
    // Page Title
    document.title = `${settings.name} - Admin Portal (${settings.address})`;
  },

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-item[data-view]');
    const sidebar = document.querySelector('.app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const mobileBtn = document.getElementById('mobile-menu-btn');

    const closeSidebar = () => {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    };

    const toggleSidebar = () => {
      if (sidebar) {
        const isOpen = sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open', isOpen);
      }
    };

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.getAttribute('data-view');
        this.switchView(viewId);
        closeSidebar();
      });
    });

    if (mobileBtn) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        closeSidebar();
      });
    }
  },

  switchView(viewId) {
    // Check Auth Guard
    if (window.AuthManager && !window.AuthManager.isAuthenticated()) {
      window.AuthManager.showLoginView();
      return;
    }

    this.activeView = viewId;

    // Update nav classes
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update view containers
    document.querySelectorAll('.view-container').forEach(view => {
      if (view.id === `view-${viewId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Scroll to top of content smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger re-renders if required
    if (viewId === 'dashboard') this.updateDashboardStats();
    if (viewId === 'seats' && window.SeatManager) window.SeatManager.render();
    if (viewId === 'members' && window.MemberManager) window.MemberManager.render();
    if (viewId === 'fees' && window.FeeManager) window.FeeManager.render();
    if (viewId === 'reports' && window.ReportsManager) {
      window.ReportsManager.renderDefaulters();
      window.ReportsManager.renderShiftAnalytics();
    }
    if (viewId === 'admins' && window.AdminManager) {
      window.AdminManager.render();
    }
  },

  setupTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('gupta_library_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('gupta_library_theme', next);
        this.showToast(`Switched to ${next} mode`, 'info');
      });
    }
  },

  updateShiftStatus() {
    const hour = new Date().getHours();
    const pill = document.getElementById('current-shift-pill');
    if (!pill) return;

    let shiftText = 'Morning Shift (06:00 AM - 12:00 PM)';
    if (hour >= 12 && hour < 16) shiftText = 'Afternoon Shift (12:00 PM - 04:00 PM)';
    else if (hour >= 16 && hour < 22) shiftText = 'Evening Shift (04:00 PM - 10:00 PM)';
    else if (hour >= 22 || hour < 6) shiftText = 'Night / 24x7 Study Shift';

    pill.innerHTML = `<span class="status-dot"></span> <span>${shiftText}</span>`;
  },

  updateDashboardStats() {
    const members = window.appState.getMembers();
    const seats = window.appState.getSeats();
    const txs = window.appState.getTransactions();
    const settings = window.appState.getSettings();

    // Active Members
    const activeCount = members.filter(m => m.status === 'Active').length;
    const occupiedSeats = seats.filter(s => s.status === 'Occupied').length;
    const totalSeats = seats.length;

    // Financials
    const totalRevenue = txs.reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalDues = members.reduce((acc, m) => acc + (m.dues || 0), 0);

    const setStat = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setStat('stat-active-members', activeCount);
    setStat('stat-occupied-seats', `${occupiedSeats} / ${totalSeats}`);
    setStat('stat-total-revenue', `${settings.currency}${totalRevenue.toLocaleString()}`);
    setStat('stat-pending-dues', `${settings.currency}${totalDues.toLocaleString()}`);

    // Update Activity Feed in Dashboard with Collector info
    const recentActivityBody = document.getElementById('dashboard-recent-activity');
    if (recentActivityBody) {
      const recentTxs = txs.slice(0, 6);
      recentActivityBody.innerHTML = recentTxs.map(t => {
        const collector = t.collectedBy || 'Admin';
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light); flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary-50); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0;">₹</div>
              <div>
                <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">${t.studentName}</div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">
                  ${t.receiptNo} &bull; <strong style="color:var(--text-main);">${t.paymentMode}</strong> &bull; By: <em>${collector}</em>
                </div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; font-size: 0.95rem; color: var(--success-dark);">+${settings.currency}${t.amount}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${t.paymentDate} ${t.paymentTime || ''}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  setupGlobalSearch() {
    const searchInputs = document.querySelectorAll('.global-search-trigger');
    searchInputs.forEach(input => {
      input.addEventListener('focus', () => {
        this.openModal('modal-quick-search');
        setTimeout(() => {
          const mainSearch = document.getElementById('quick-search-box-input');
          if (mainSearch) mainSearch.focus();
        }, 100);
      });
      // Click for buttons or icons
      input.addEventListener('click', () => {
        this.openModal('modal-quick-search');
        setTimeout(() => {
          const mainSearch = document.getElementById('quick-search-box-input');
          if (mainSearch) mainSearch.focus();
        }, 100);
      });
    });

    // Keyboard shortcut (Ctrl/Cmd + K)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openModal('modal-quick-search');
        setTimeout(() => {
          const mainSearch = document.getElementById('quick-search-box-input');
          if (mainSearch) mainSearch.focus();
        }, 100);
      }
    });

    const searchInput = document.getElementById('quick-search-box-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleGlobalSearch(e.target.value.toLowerCase());
      });
    }
  },

  handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('quick-search-results-list');
    if (!resultsContainer) return;

    if (!query) {
      resultsContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Type to search students, seats, or payment receipts...</div>';
      return;
    }

    const members = window.appState.getMembers().filter(m => 
      (m.name && m.name.toLowerCase().includes(query)) || 
      (m.phone && m.phone.includes(query)) || 
      (m.id && m.id.toLowerCase().includes(query))
    );
    
    const txs = window.appState.getTransactions().filter(t => 
      (t.receiptNo && t.receiptNo.toLowerCase().includes(query)) || 
      (t.studentName && t.studentName.toLowerCase().includes(query)) ||
      (t.collectedBy && t.collectedBy.toLowerCase().includes(query)) ||
      (t.paymentMode && t.paymentMode.toLowerCase().includes(query))
    );

    let html = '';

    if (members.length > 0) {
      html += '<div class="search-result-group-title">Students & Admissions</div>';
      html += members.slice(0, 4).map(m => `
        <div class="search-result-item" onclick="App.closeModal('modal-quick-search'); MemberManager.openMemberDetails('${m.id}')">
          <div>
            <div style="font-weight: 600; font-size: 0.88rem;">${m.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${m.id} &bull; ${m.phone} &bull; Seat: ${m.seatId || 'None'}</div>
          </div>
          <span class="badge">View Profile</span>
        </div>
      `).join('');
    }

    if (txs.length > 0) {
      html += '<div class="search-result-group-title">Fee Receipts & Audit Logs</div>';
      html += txs.slice(0, 4).map(t => `
        <div class="search-result-item" onclick="App.closeModal('modal-quick-search'); FeeManager.openReceiptModal('${t.receiptNo}')">
          <div>
            <div style="font-weight: 600; font-size: 0.88rem;">${t.receiptNo} - ${t.studentName}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${t.paymentDate} &bull; ₹${t.amount} &bull; Method: <strong>${t.paymentMode}</strong> &bull; By: <strong>${t.collectedBy || 'Admin'}</strong></div>
          </div>
          <span class="badge">View Receipt</span>
        </div>
      `).join('');
    }

    if (!html) {
      html = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No matching records found for "' + query + '".</div>';
    }

    resultsContainer.innerHTML = html;
  },

  setupModals() {
    // Backdrop click close
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    });

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-close-modal');
        this.closeModal(modalId);
      });
    });

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
      }
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="font-weight: 600;">${message}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.App = App;
