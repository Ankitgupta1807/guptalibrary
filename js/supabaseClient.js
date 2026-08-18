/**
 * GUPTA LIBRARY - SUPABASE POSTGRESQL CLIENT & CLOUD SYNC
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 * Email: guptalibraryy@gmail.com
 */

const DEFAULT_SUPABASE_URL = 'https://ynoqrhqqrifhrphonrxc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlub3FyaHFxcmlmaHJwaG9ucnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzU2MDMsImV4cCI6MjEwMjU1MTYwM30.xyrfCOwZDnXVMrBG-3nFienQz0k9yjipxewp-9HRNG4';

const SupabaseManager = {
  client: null,
  isConnected: false,

  normalizeUrl(rawUrl) {
    if (!rawUrl) return '';
    let url = rawUrl.trim();
    url = url.replace(/\/rest\/v1\/?$/, '');
    return url.replace(/\/+$/, '');
  },

  init() {
    const config = this.getConfig();
    const cleanUrl = this.normalizeUrl(config.url);
    const cleanKey = (config.anonKey || '').trim();

    if (cleanUrl && cleanKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(cleanUrl, cleanKey);
        this.isConnected = true;
        console.log('⚡ Supabase PostgreSQL initialized successfully for Gupta Library:', cleanUrl);
      } catch (err) {
        console.warn('Could not initialize Supabase client:', err);
      }
    }
    this.updateStatusBadge();
  },

  getConfig() {
    try {
      const saved = localStorage.getItem('gupta_library_supabase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey) return parsed;
      }
    } catch (e) {}
    return {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_ANON_KEY
    };
  },

  saveConfig(url, anonKey) {
    const cleanUrl = this.normalizeUrl(url);
    const cleanKey = (anonKey || '').trim();
    localStorage.setItem('gupta_library_supabase_config', JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
    this.init();
  },

  updateStatusBadge() {
    const badge = document.getElementById('supabase-status-badge');
    if (badge) {
      if (this.isConnected) {
        badge.innerHTML = `<span class="status-dot" style="background: var(--success); box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);"></span> <span style="color: var(--success-dark); font-weight:600;">Supabase Connected (Live Auth & DB)</span>`;
      } else {
        badge.innerHTML = `<span class="status-dot" style="background: var(--warning);"></span> <span style="color: var(--warning-dark);">Local Database Engine</span>`;
      }
    }
  },

  async testConnection(url, anonKey) {
    if (!window.supabase) {
      return { success: false, message: 'Supabase JS library not loaded. Check your internet connection.' };
    }
    try {
      const cleanUrl = this.normalizeUrl(url);
      const cleanKey = (anonKey || '').trim();
      const tempClient = window.supabase.createClient(cleanUrl, cleanKey);
      const { data, error } = await tempClient.from('library_settings').select('*').limit(1);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Connection successful! PostgreSQL tables verified.' };
    } catch (e) {
      return { success: false, message: e.message || 'Unknown network error.' };
    }
  },

  // Pull all tables from Supabase PostgreSQL into appState
  async syncFromCloud() {
    if (!this.client || !this.isConnected) return;

    try {
      // 1. Members
      const { data: members, error: mErr } = await this.client.from('members').select('*');
      if (!mErr && members && members.length > 0) {
        window.appState.state.members = members.map(m => ({
          id: m.id,
          name: m.name,
          phone: m.phone,
          email: m.email,
          gender: m.gender,
          address: m.address,
          examTarget: m.exam_target,
          seatId: m.seat_id,
          hall: m.hall,
          shift: m.shift,
          monthlyFee: Number(m.monthly_fee),
          joiningDate: m.joining_date,
          validTill: m.valid_till,
          status: m.status,
          dues: Number(m.dues || 0),
          avatarColor: m.avatar_color
        }));
      }

      // 2. Seats
      const { data: seats, error: sErr } = await this.client.from('seats').select('*');
      if (!sErr && seats && seats.length > 0) {
        window.appState.state.seats = seats.map(s => ({
          id: s.id,
          hall: s.hall,
          type: s.type,
          status: s.status,
          studentId: s.student_id,
          studentName: s.student_name,
          shift: s.shift
        }));
      }

      // 3. Transactions
      const { data: txs, error: tErr } = await this.client.from('transactions').select('*').order('created_at', { ascending: false });
      if (!tErr && txs && txs.length > 0) {
        window.appState.state.transactions = txs.map(t => ({
          receiptNo: t.receipt_no,
          studentId: t.student_id,
          studentName: t.student_name,
          phone: t.phone,
          seatId: t.seat_id,
          shift: t.shift,
          amount: Number(t.amount),
          paymentMode: t.payment_mode,
          paymentDate: t.payment_date,
          period: t.period,
          collectedBy: t.collected_by,
          status: t.status,
          remarks: t.remarks
        }));
      }

      // 4. Books
      const { data: books, error: bErr } = await this.client.from('books').select('*');
      if (!bErr && books && books.length > 0) {
        window.appState.state.books = books.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          category: b.category,
          isbn: b.isbn,
          shelf: b.shelf,
          totalCopies: Number(b.total_copies),
          availableCopies: Number(b.available_copies),
          status: b.status
        }));
      }

      // Save synced state to local mirror and re-render views
      window.appState.saveState();
      if (window.App) {
        window.App.updateDashboardStats();
        if (window.SeatManager) window.SeatManager.render();
        if (window.MemberManager) window.MemberManager.render();
        if (window.FeeManager) window.FeeManager.render();
        if (window.BookManager) window.BookManager.render();
      }
      console.log('⚡ Synced fresh state from Supabase PostgreSQL database.');
    } catch (e) {
      console.warn('Supabase cloud sync notification:', e);
    }
  },

  // Push Member changes to Supabase
  async upsertMember(member) {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.from('members').upsert({
        id: member.id,
        name: member.name,
        phone: member.phone,
        email: member.email,
        address: member.address,
        exam_target: member.examTarget,
        seat_id: member.seatId || null,
        hall: member.hall,
        shift: member.shift,
        monthly_fee: member.monthlyFee,
        joining_date: member.joiningDate,
        valid_till: member.validTill,
        status: member.status,
        dues: member.dues,
        avatar_color: member.avatarColor,
        updated_at: new Date()
      });
    } catch (e) {
      console.error('Failed to sync member to Supabase:', e);
    }
  },

  // Delete Member from Supabase
  async deleteMemberFromCloud(memberId) {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.from('members').delete().eq('id', memberId);
    } catch (e) {
      console.error('Failed to delete member from Supabase:', e);
    }
  },

  // Push Seat changes to Supabase
  async updateSeat(seat) {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.from('seats').upsert({
        id: seat.id,
        hall: seat.hall,
        type: seat.type,
        status: seat.status,
        student_id: seat.studentId || null,
        student_name: seat.studentName || null,
        shift: seat.shift || null,
        updated_at: new Date()
      });
    } catch (e) {
      console.error('Failed to sync seat to Supabase:', e);
    }
  },

  // Push Transaction / Receipt to Supabase
  async insertTransaction(tx) {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.from('transactions').insert({
        receipt_no: tx.receiptNo,
        student_id: tx.studentId,
        student_name: tx.studentName,
        phone: tx.phone,
        seat_id: tx.seatId,
        shift: tx.shift,
        amount: tx.amount,
        payment_mode: tx.paymentMode,
        payment_date: tx.paymentDate,
        period: tx.period,
        collected_by: tx.collectedBy,
        status: tx.status,
        remarks: tx.remarks
      });
    } catch (e) {
      console.error('Failed to sync transaction to Supabase:', e);
    }
  },

  // Push Book to Supabase
  async insertBook(book) {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.from('books').upsert({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        isbn: book.isbn,
        shelf: book.shelf,
        total_copies: book.totalCopies,
        available_copies: book.availableCopies,
        status: book.status
      });
    } catch (e) {
      console.error('Failed to sync book to Supabase:', e);
    }
  }
};

window.SupabaseManager = SupabaseManager;
