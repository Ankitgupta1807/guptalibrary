/**
 * GUPTA LIBRARY - SETTINGS & CONFIGURATION MANAGER
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 * Email: guptalibraryy@gmail.com
 */

const SettingsManager = {
  init() {
    this.populateForm();
    this.populateSupabaseConfig();
    this.attachEvents();
  },

  populateForm() {
    const settings = window.appState.getSettings();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined ? val : '';
    };

    setVal('setting-lib-name', settings.name);
    setVal('setting-lib-email', settings.email);
    setVal('setting-lib-phone', settings.phone);
    setVal('setting-lib-address', settings.address);
    setVal('setting-lib-landmark', settings.landmark);
    setVal('setting-fee-fullday', settings.monthlyPlanFullDay);
    setVal('setting-fee-shift', settings.monthlyPlanShift);
    setVal('setting-fee-admission', settings.admissionFee);
    setVal('setting-receipt-note', settings.receiptFooterNote);
  },

  populateSupabaseConfig() {
    if (window.SupabaseManager) {
      const config = window.SupabaseManager.getConfig();
      const urlInput = document.getElementById('setting-supabase-url');
      const keyInput = document.getElementById('setting-supabase-key');
      if (urlInput) urlInput.value = config.url || '';
      if (keyInput) keyInput.value = config.anonKey || '';
    }
  },

  attachEvents() {
    const form = document.getElementById('form-library-settings');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings(e.target);
      });
    }

    // Supabase Connect Form
    const supabaseForm = document.getElementById('form-supabase-config');
    if (supabaseForm) {
      supabaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('setting-supabase-url').value;
        const key = document.getElementById('setting-supabase-key').value;
        
        window.App.showToast('Testing Supabase PostgreSQL connection...', 'info');
        const res = await window.SupabaseManager.testConnection(url, key);
        if (res.success) {
          window.SupabaseManager.saveConfig(url, key);
          window.App.showToast('Supabase PostgreSQL connected successfully!', 'success');
        } else {
          window.App.showToast(`Connection failed: ${res.message}`, 'error');
        }
      });
    }

    const backupExportBtn = document.getElementById('btn-export-backup');
    if (backupExportBtn) {
      backupExportBtn.addEventListener('click', () => this.exportBackupJSON());
    }

    const backupImportInput = document.getElementById('input-import-backup');
    if (backupImportInput) {
      backupImportInput.addEventListener('change', (e) => this.importBackupJSON(e.target.files[0]));
    }

    const resetBtn = document.getElementById('btn-reset-demo-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetDemoData());
    }
  },

  saveSettings(form) {
    const formData = new FormData(form);
    const updated = {
      name: formData.get('name') || 'Gupta Library',
      email: formData.get('email') || 'guptalibraryy@gmail.com',
      phone: formData.get('phone') || '+91 94312 88990',
      address: formData.get('address') || 'Sasamusa, Gopalganj, Bihar - 841505',
      landmark: formData.get('landmark') || 'Near Sasamusa High School, Main Road',
      monthlyPlanFullDay: Number(formData.get('monthlyPlanFullDay')) || 800,
      monthlyPlanShift: Number(formData.get('monthlyPlanShift')) || 500,
      admissionFee: Number(formData.get('admissionFee')) || 200,
      receiptFooterNote: formData.get('receiptFooterNote')
    };

    window.appState.updateSettings(updated);
    window.App.updateAppIdentity();
    window.App.showToast('Library details updated successfully!', 'success');
  },

  exportBackupJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(window.appState.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Gupta_Library_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    window.App.showToast('Backup JSON exported successfully!', 'success');
  },

  importBackupJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && importedData.settings && importedData.members) {
          window.appState.state = importedData;
          window.appState.saveState();
          window.location.reload();
        } else {
          window.App.showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        window.App.showToast('Failed to parse backup JSON.', 'error');
      }
    };
    reader.readAsText(file);
  },

  resetDemoData() {
    if (confirm('Are you sure you want to reset all data back to Gupta Library demo dataset? Any custom entries will be restored to initial state.')) {
      window.appState.resetToDefault();
      window.location.reload();
    }
  }
};

window.SettingsManager = SettingsManager;
