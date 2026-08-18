/**
 * GUPTA LIBRARY - ADMIN CREATION & TEAM MANAGER
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 * Email: guptalibraryy@gmail.com
 */

const AdminManager = {
  adminsList: [],

  init() {
    this.attachEvents();
    this.render();
  },

  attachEvents() {
    const form = document.getElementById('form-create-admin');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateAdmin(e.target);
      });
    }
  },

  async render() {
    const tableBody = document.getElementById('admins-table-body');
    if (!tableBody) return;

    if (window.SupabaseManager && window.SupabaseManager.client) {
      try {
        const { data, error } = await window.SupabaseManager.client
          .from('admin_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          this.adminsList = data;
        }
      } catch (err) {
        console.warn('Could not fetch admins:', err);
      }
    }

    // If list is empty, display current admin as fallback
    if (this.adminsList.length === 0 && window.AuthManager && window.AuthManager.currentAdmin) {
      this.adminsList = [{
        name: window.AuthManager.currentAdmin.name,
        email: window.AuthManager.currentAdmin.email,
        role: 'admin',
        created_at: new Date().toISOString()
      }];
    }

    const countBadge = document.getElementById('admin-count-badge');
    if (countBadge) countBadge.textContent = `${this.adminsList.length} Active Admins`;

    tableBody.innerHTML = this.adminsList.map(admin => {
      const isCurrent = window.AuthManager.currentAdmin && window.AuthManager.currentAdmin.email === admin.email;
      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar" style="background: linear-gradient(135deg, #4338ca, #3b82f6); color: white;">
                ${(admin.name || 'Admin').substring(0,2).toUpperCase()}
              </div>
              <div>
                <div class="user-meta-name">
                  ${admin.name} ${isCurrent ? '<span style="font-size:0.7rem; color:var(--primary); font-weight:700;">(You)</span>' : ''}
                </div>
                <div class="user-meta-id">${admin.email}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="status-pill active" style="font-size: 0.75rem; text-transform: uppercase;">
              🛡️ ${admin.role || 'Admin'}
            </span>
          </td>
          <td>
            <div style="font-size: 0.82rem; color: var(--text-muted);">
              ${admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'Active'}
            </div>
          </td>
          <td>
            <span class="status-pill active" style="font-size: 0.72rem;">Authorized</span>
          </td>
        </tr>
      `;
    }).join('');
  },

  async handleCreateAdmin(form) {
    const nameInput = document.getElementById('new-admin-name');
    const emailInput = document.getElementById('new-admin-email');
    const passInput = document.getElementById('new-admin-password');
    const confirmInput = document.getElementById('new-admin-confirm-password');
    const submitBtn = document.getElementById('btn-create-admin-submit');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passInput ? passInput.value : '';
    const confirmPassword = confirmInput ? confirmInput.value : '';

    if (!name || !email || !password) {
      window.App.showToast('Please fill out all required fields.', 'warning');
      return;
    }

    if (password.length < 6) {
      window.App.showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      window.App.showToast('Passwords do not match. Please re-check.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> Creating Admin Account...`;
    }

    try {
      if (!window.SupabaseManager || !window.SupabaseManager.client) {
        throw new Error('Supabase client not connected.');
      }

      // Call secure server-side RPC function create_new_admin
      const { data, error } = await window.SupabaseManager.client.rpc('create_new_admin', {
        admin_name: name,
        admin_email: email,
        admin_password: password
      });

      if (error) {
        throw error;
      }

      window.App.showToast(`Admin account for "${name}" created successfully!`, 'success');
      form.reset();
      await this.render();
    } catch (err) {
      console.error('Create admin error:', err);
      window.App.showToast(`Failed to create admin: ${err.message || 'Server error'}`, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Create & Authorize Admin`;
      }
    }
  }
};

window.AdminManager = AdminManager;
