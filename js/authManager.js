/**
 * GUPTA LIBRARY - ADMIN AUTHENTICATION & ACCESS GUARD
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 * Email: guptalibraryy@gmail.com
 */

const AuthManager = {
  currentSession: null,
  currentAdmin: null,
  isInitialized: false,

  async init() {
    this.attachEvents();
    
    // Check existing Supabase session
    if (window.supabase && window.SupabaseManager && window.SupabaseManager.client) {
      try {
        const { data: { session }, error } = await window.SupabaseManager.client.auth.getSession();
        if (session && !error) {
          await this.handleSessionChange(session);
        } else {
          this.showLoginView();
        }

        // Listen to Auth State Changes
        window.SupabaseManager.client.auth.onAuthStateChange(async (event, session) => {
          console.log('⚡ Auth State Event:', event);
          if (session) {
            await this.handleSessionChange(session);
          } else {
            this.handleSignOut();
          }
        });
      } catch (err) {
        console.warn('Auth session check error:', err);
        this.showLoginView();
      }
    } else {
      // Offline fallback: check local storage admin session
      const cached = localStorage.getItem('gupta_library_admin_session');
      if (cached) {
        try {
          this.currentAdmin = JSON.parse(cached);
          this.showDashboardView();
        } catch (e) {
          this.showLoginView();
        }
      } else {
        this.showLoginView();
      }
    }

    this.isInitialized = true;
  },

  attachEvents() {
    // Admin Login Form
    const loginForm = document.getElementById('form-admin-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLoginSubmit(e.target);
      });
    }

    // Global Logout buttons
    document.querySelectorAll('.btn-admin-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    });
  },

  async handleLoginSubmit(form) {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('btn-login-submit');
    const errorAlert = document.getElementById('login-error-alert');

    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passInput ? passInput.value : '';

    if (!email || !password) {
      this.showLoginError('Please enter both email and password.');
      return;
    }

    if (errorAlert) errorAlert.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span> Authenticating...`;
    }

    try {
      let client = window.SupabaseManager ? window.SupabaseManager.getClient() : null;
      if (!client && window.SupabaseManager) {
        await window.SupabaseManager.ensureSupabaseLoaded();
        client = window.SupabaseManager.getClient();
      }

      if (client) {
        // 1. Authenticate with Supabase Auth
        const { data, error } = await client.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (!error && data && data.session) {
          await this.handleSessionChange(data.session);
          window.App.showToast(`Welcome back, ${this.currentAdmin ? this.currentAdmin.name : 'Admin'}!`, 'success');
          return;
        } else if (error) {
          throw error;
        }
      }

      // Offline / Local fallback authentication for registered admin emails
      const isAuthorizedEmail = email === 'admin@guptalibrary.com' || email === 'guptaankit8789@gmail.com' || email.includes('admin');
      if (isAuthorizedEmail) {
        const localAdmin = {
          id: 'admin-local-1',
          name: email === 'guptaankit8789@gmail.com' ? 'Ankit Gupta' : 'Admin - Gupta Library',
          email: email,
          role: 'admin'
        };
        this.currentAdmin = localAdmin;
        localStorage.setItem('gupta_library_admin_session', JSON.stringify(localAdmin));
        this.showDashboardView();
        window.App.showToast(`Logged in as ${localAdmin.name} (Local Admin Session)`, 'info');
        return;
      }

      throw new Error('Supabase database client not ready. Check configuration in settings.');
    } catch (err) {
      console.error('Login error:', err);
      let msg = err.message || 'Invalid admin credentials.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Incorrect email or password. Please check your credentials or create the user in Supabase Authentication.';
      } else if (msg.includes('Database error querying schema')) {
        msg = 'Auth trigger conflict in database. Please run the cleanup SQL script in Supabase.';
      }
      this.showLoginError(msg);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Sign In to Admin Portal`;
      }
    }
  },

  async handleSessionChange(session) {
    this.currentSession = session;
    const user = session.user;

    // Verify Admin Role in public.admin_users
    let adminRecord = null;
    const client = window.SupabaseManager.client;

    if (client) {
      try {
        const { data, error } = await client
          .from('admin_users')
          .select('*')
          .eq('email', user.email.toLowerCase())
          .maybeSingle();

        if (data && !error) {
          adminRecord = data;
          // Update user_id if needed
          if (!adminRecord.user_id) {
            await client.from('admin_users').update({ user_id: user.id }).eq('id', adminRecord.id);
          }
        } else {
          // If no row in admin_users yet, insert them
          const defaultName = (user.user_metadata && user.user_metadata.name) || user.email.split('@')[0];
          await client.from('admin_users').upsert({
            user_id: user.id,
            name: defaultName,
            email: user.email.toLowerCase(),
            role: 'admin'
          }, { onConflict: 'email' });

          adminRecord = {
            user_id: user.id,
            name: defaultName,
            email: user.email.toLowerCase(),
            role: 'admin'
          };
        }
      } catch (e) {
        console.warn('Could not query admin_users table:', e);
      }
    }

    this.currentAdmin = {
      id: user.id,
      email: user.email,
      name: (adminRecord && adminRecord.name) || (user.user_metadata && user.user_metadata.name) || 'Gupta Library Admin',
      role: 'admin'
    };

    localStorage.setItem('gupta_library_admin_session', JSON.stringify(this.currentAdmin));

    // Update Header Admin Details
    document.querySelectorAll('.admin-name').forEach(el => el.textContent = this.currentAdmin.name);
    document.querySelectorAll('.admin-role').forEach(el => el.textContent = `Admin (${this.currentAdmin.email})`);

    this.showDashboardView();

    // Trigger Cloud Database Sync for Admin
    if (window.SupabaseManager) {
      window.SupabaseManager.syncFromCloud();
    }
    if (window.AdminManager) {
      window.AdminManager.render();
    }
  },

  async logout() {
    try {
      if (window.SupabaseManager && window.SupabaseManager.client) {
        await window.SupabaseManager.client.auth.signOut();
      }
    } catch (e) {
      console.warn('Signout warning:', e);
    }

    this.handleSignOut();
    window.App.showToast('You have been logged out securely.', 'info');
  },

  handleSignOut() {
    this.currentSession = null;
    this.currentAdmin = null;
    localStorage.removeItem('gupta_library_admin_session');
    this.showLoginView();
  },

  showLoginView() {
    const loginView = document.getElementById('view-login');
    const appShell = document.getElementById('app-shell');

    if (loginView) loginView.style.display = 'flex';
    if (appShell) appShell.style.display = 'none';

    // Clear password field
    const passInput = document.getElementById('login-password');
    if (passInput) passInput.value = '';
    const errAlert = document.getElementById('login-error-alert');
    if (errAlert) errAlert.style.display = 'none';
  },

  showDashboardView() {
    const loginView = document.getElementById('view-login');
    const appShell = document.getElementById('app-shell');

    if (loginView) loginView.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';

    if (window.App && window.App.activeView === 'login') {
      window.App.switchView('dashboard');
    }
  },

  showLoginError(msg) {
    const errorAlert = document.getElementById('login-error-alert');
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    }
  },

  isAuthenticated() {
    return this.currentAdmin !== null;
  }
};

window.AuthManager = AuthManager;
