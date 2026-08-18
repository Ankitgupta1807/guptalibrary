/**
 * GUPTA LIBRARY - FEES, BILLING & AUDIT LOGGED RECEIPT GENERATOR
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 * Email: guptalibraryy@gmail.com
 */

const FeeManager = {
  searchQuery: '',
  filterMode: 'all',

  init() {
    this.render();
    this.attachEvents();
  },

  attachEvents() {
    const searchInput = document.getElementById('fee-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    const filterMode = document.getElementById('fee-mode-filter');
    if (filterMode) {
      filterMode.addEventListener('change', (e) => {
        this.filterMode = e.target.value;
        this.render();
      });
    }

    // Collect Fee Form
    const form = document.getElementById('form-collect-fee');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCollectFee(e.target);
      });
    }
  },

  render() {
    const tableBody = document.getElementById('fees-table-body');
    if (!tableBody) return;

    let transactions = window.appState.getTransactions();
    const settings = window.appState.getSettings();

    if (this.searchQuery) {
      transactions = transactions.filter(t => 
        (t.receiptNo && t.receiptNo.toLowerCase().includes(this.searchQuery)) ||
        (t.studentName && t.studentName.toLowerCase().includes(this.searchQuery)) ||
        (t.phone && t.phone.includes(this.searchQuery)) ||
        (t.collectedBy && t.collectedBy.toLowerCase().includes(this.searchQuery)) ||
        (t.paymentMode && t.paymentMode.toLowerCase().includes(this.searchQuery))
      );
    }

    if (this.filterMode !== 'all') {
      transactions = transactions.filter(t => 
        t.paymentMode && t.paymentMode.toLowerCase().includes(this.filterMode.toLowerCase())
      );
    }

    if (transactions.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No fee payment records found matching "${this.searchQuery || 'selected filter'}".
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = transactions.map(t => {
      // Payment method visual styling
      let modeBadgeClass = 'active';
      let modeIcon = '💳';
      const m = (t.paymentMode || '').toLowerCase();
      if (m.includes('cash')) { modeBadgeClass = 'paid'; modeIcon = '💵'; }
      else if (m.includes('phonepe') || m.includes('gpay') || m.includes('upi') || m.includes('paytm')) { modeBadgeClass = 'active'; modeIcon = '📱'; }
      else if (m.includes('card') || m.includes('bank')) { modeBadgeClass = 'partial'; modeIcon = '🏦'; }

      const collector = t.collectedBy || 'Admin - Gupta Library';
      const collectorInitials = collector.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

      return `
        <tr>
          <td>
            <div style="font-weight: 800; color: var(--primary); font-size: 0.9rem;">${t.receiptNo}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
              🗓️ ${t.paymentDate || 'N/A'} ${t.paymentTime ? `&bull; ⏰ ${t.paymentTime}` : ''}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main);">${t.studentName}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">
              <strong>${t.studentId}</strong> &bull; 📞 ${t.phone}
            </div>
          </td>
          <td>
            <div style="font-size: 0.84rem; font-weight: 600;">Seat: ${t.seatId || 'General'}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${t.shift || 'Full Day'}</div>
          </td>
          <td>
            <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">
              ${settings.currency}${t.amount}
            </div>
            <span class="status-pill active" style="font-size: 0.68rem; padding: 0.1rem 0.45rem;">Paid & Verified</span>
          </td>
          <td>
            <div style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; font-weight: 600;">
              <span>${modeIcon}</span>
              <span>${t.paymentMode || 'Cash'}</span>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #e0e7ff; color: #3730a3; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${collectorInitials}
              </div>
              <div>
                <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-main);">${collector}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">${t.remarks || 'Subscription renewal'}</div>
              </div>
            </div>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="FeeManager.openReceiptModal('${t.receiptNo}')" title="Print Official PDF Receipt">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V4a2 2 0 0 1 2-2z"/></svg>
                PDF
              </button>
              <button class="btn btn-secondary btn-sm btn-icon-only" title="Share Receipt on WhatsApp" onclick="FeeManager.shareWhatsApp('${t.receiptNo}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openCollectFeeModal(studentId = null) {
    const studentSelect = document.getElementById('collect-fee-student');
    const members = window.appState.getMembers();

    // Auto populate Current Admin in modal
    const collectorInput = document.getElementById('collect-fee-admin-display');
    const currentAdmin = window.AuthManager && window.AuthManager.currentAdmin ? window.AuthManager.currentAdmin : null;
    if (collectorInput) {
      collectorInput.value = currentAdmin ? `${currentAdmin.name} (${currentAdmin.email})` : 'Ankit Gupta (Admin)';
    }

    if (studentSelect) {
      studentSelect.innerHTML = `
        <option value="">-- Select Student --</option>
        ${members.map(m => `
          <option value="${m.id}" ${m.id === studentId ? 'selected' : ''} data-fee="${m.monthlyFee || 500}" data-seat="${m.seatId || 'N/A'}" data-shift="${m.shift || 'Standard'}">
            ${m.name} (${m.id} - ${m.phone}) ${m.dues > 0 ? `[Due: ₹${m.dues}]` : ''}
          </option>
        `).join('')}
      `;

      // Auto update amount on student select
      studentSelect.onchange = () => {
        const opt = studentSelect.selectedOptions[0];
        if (opt && opt.dataset.fee) {
          const amountInput = document.getElementById('collect-fee-amount');
          if (amountInput) amountInput.value = opt.dataset.fee;
        }
      };

      if (studentId) {
        studentSelect.dispatchEvent(new Event('change'));
      }
    }

    window.App.openModal('modal-collect-fee');
  },

  handleCollectFee(form) {
    const formData = new FormData(form);
    const studentId = formData.get('studentId');
    const student = window.appState.getMemberById(studentId);
    if (!student) {
      window.App.showToast('Please select a valid student.', 'warning');
      return;
    }

    const months = Number(formData.get('months')) || 1;
    const amount = Number(formData.get('amount'));
    const paymentMode = formData.get('paymentMode') || 'UPI (PhonePe)';
    const remarks = formData.get('remarks') || 'Monthly study membership fee';

    // Current Admin who collected the fee
    const currentAdmin = window.AuthManager && window.AuthManager.currentAdmin ? window.AuthManager.currentAdmin : null;
    const collectedBy = currentAdmin ? `${currentAdmin.name}` : 'Admin - Gupta Library';

    const now = new Date();
    const paymentDate = now.toISOString().split('T')[0];
    const paymentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Extend validity
    const d = new Date(student.validTill || Date.now());
    d.setMonth(d.getMonth() + months);
    student.validTill = d.toISOString().split('T')[0];
    student.status = 'Active';
    student.dues = 0;

    const tx = window.appState.addTransaction({
      studentId: student.id,
      studentName: student.name,
      phone: student.phone,
      seatId: student.seatId || 'N/A',
      shift: student.shift || 'Standard',
      amount: amount,
      paymentMode: paymentMode,
      paymentDate: paymentDate,
      paymentTime: paymentTime,
      collectedBy: collectedBy,
      period: `${months} Month(s) (${paymentDate} to ${student.validTill})`,
      remarks: remarks
    });

    form.reset();
    window.App.closeModal('modal-collect-fee');
    this.render();
    window.MemberManager.render();
    window.App.updateDashboardStats();

    window.App.showToast(`Fee of ₹${amount} collected by ${collectedBy} via ${paymentMode}!`, 'success');
    
    // Automatically preview official PDF payment receipt
    setTimeout(() => {
      this.openReceiptModal(tx.receiptNo);
    }, 400);
  },

  openReceiptModal(receiptNo) {
    const tx = window.appState.getTransactions().find(t => t.receiptNo === receiptNo);
    if (!tx) return;

    const settings = window.appState.getSettings();
    const student = window.appState.getMemberById(tx.studentId);
    const container = document.getElementById('receipt-modal-content');
    if (!container) return;

    container.innerHTML = `
      <div class="printable-area thermal-receipt" style="margin: 0 auto; background: white; color: #0f172a; padding: 1.5rem; border-radius: 8px; border: 1px dashed #94a3b8; font-family: 'Plus Jakarta Sans', sans-serif;">
        <!-- Official Header with Gupta Library Metadata -->
        <div style="text-align: center; border-bottom: 2px dashed #64748b; padding-bottom: 0.85rem; margin-bottom: 0.85rem;">
          <div style="font-size: 1.35rem; font-weight: 900; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.04em;">${settings.name}</div>
          <div style="font-size: 0.78rem; font-weight: 600; color: #334155; margin-top: 0.15rem;">${settings.address}</div>
          <div style="font-size: 0.74rem; color: #64748b; margin-top: 0.1rem;">
            Email: <strong>${settings.email}</strong> &bull; Contact: <strong>${settings.phone}</strong>
          </div>
          <div style="margin-top: 0.5rem;">
            <span style="background: #e0e7ff; color: #3730a3; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px;">OFFICIAL PAYMENT RECEIPT</span>
          </div>
        </div>

        <!-- Meta Details with Collector & Method -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; font-size: 0.78rem; gap: 0.35rem; margin-bottom: 0.85rem; padding-bottom: 0.65rem; border-bottom: 1px solid #e2e8f0;">
          <div>Receipt No: <strong style="color: #4338ca;">${tx.receiptNo}</strong></div>
          <div style="text-align: right;">Date & Time: <strong>${tx.paymentDate} ${tx.paymentTime || ''}</strong></div>
          <div>Student ID: <strong>${tx.studentId}</strong></div>
          <div style="text-align: right;">Payment Mode: <strong style="color: #047857;">${tx.paymentMode}</strong></div>
          <div style="grid-column: 1 / -1; margin-top: 0.2rem; background: #f1f5f9; padding: 0.35rem 0.6rem; border-radius: 4px; font-size: 0.74rem;">
            Collected By: <strong style="color: #1e1b4b;">${tx.collectedBy || 'Admin - Gupta Library'}</strong>
          </div>
        </div>

        <!-- Student & Shift Details -->
        <div style="background: #f8fafc; padding: 0.65rem; border-radius: 6px; font-size: 0.78rem; margin-bottom: 0.85rem; border: 1px solid #e2e8f0;">
          <div style="font-size: 0.92rem; font-weight: 800; color: #0f172a;">${tx.studentName}</div>
          <div style="color: #475569; margin-top: 0.2rem;">Phone: <strong>${tx.phone}</strong></div>
          <div style="color: #475569;">Assigned Seat: <strong>${tx.seatId || 'General Desk'}</strong> &bull; Shift: <strong>${tx.shift || 'Full Day'}</strong></div>
          ${student && student.validTill ? `<div style="color: #047857; font-weight: 600; margin-top: 0.2rem;">Membership Valid Till: ${student.validTill}</div>` : ''}
        </div>

        <!-- Itemized Amount Table -->
        <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse; margin-bottom: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid #cbd5e1; text-align: left;">
              <th style="padding: 0.3rem 0; color: #475569;">Description</th>
              <th style="padding: 0.3rem 0; text-align: right; color: #475569;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 0.4rem 0;">${tx.remarks || 'Monthly Library Study Pass'}</td>
              <td style="padding: 0.4rem 0; text-align: right; font-weight: 700;">${settings.currency}${tx.amount}</td>
            </tr>
          </tbody>
        </table>

        <!-- Total Box -->
        <div style="border-top: 2px solid #0f172a; padding-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
          <span style="font-weight: 800; font-size: 0.88rem; text-transform: uppercase;">Total Received:</span>
          <span style="font-weight: 900; font-size: 1.25rem; color: #4338ca;">${settings.currency}${tx.amount}.00</span>
        </div>

        <!-- Verification & Signature -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 0.65rem; border-top: 1px dashed #cbd5e1; font-size: 0.68rem; color: #64748b;">
          <div>
            <div style="width: 48px; height: 48px; border: 1px solid #cbd5e1; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: bold; border-radius: 4px;">
              QR VERIFIED
            </div>
            <div style="margin-top: 0.2rem;">Generated: ${new Date().toLocaleTimeString()}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: cursive; font-size: 0.85rem; color: #1e1b4b; margin-bottom: 0.2rem;">Gupta Library</div>
            <div style="font-weight: 700; color: #334155;">Authorized Signature</div>
            <div style="font-size: 0.65rem; color: #64748b;">Collector: ${tx.collectedBy || 'Admin'}</div>
          </div>
        </div>

        <!-- Footer Terms -->
        <div style="text-align: center; margin-top: 0.85rem; padding-top: 0.5rem; border-top: 1px dotted #cbd5e1; font-size: 0.66rem; color: #64748b; line-height: 1.3;">
          ${settings.receiptFooterNote}
        </div>
      </div>
    `;

    this.activeReceiptNo = receiptNo;
    window.App.openModal('modal-receipt-preview');
  },

  printReceipt() {
    window.print();
  },

  shareWhatsApp(receiptNo) {
    const tx = window.appState.getTransactions().find(t => t.receiptNo === receiptNo);
    if (!tx) return;

    const settings = window.appState.getSettings();
    const msg = `*${settings.name} - Payment Receipt*\n\n` +
      `Receipt No: *${tx.receiptNo}*\n` +
      `Student Name: *${tx.studentName}*\n` +
      `Assigned Seat: *${tx.seatId || 'General'}*\n` +
      `Amount Paid: *${settings.currency}${tx.amount}*\n` +
      `Payment Mode: *${tx.paymentMode}*\n` +
      `Collected By: *${tx.collectedBy || 'Admin'}*\n` +
      `Date & Time: *${tx.paymentDate} ${tx.paymentTime || ''}*\n` +
      `Period: ${tx.period}\n\n` +
      `*Address:* ${settings.address}\n` +
      `*Contact:* ${settings.phone} / ${settings.email}\n\n` +
      `Thank you for studying with us!`;

    const cleanPhone = (tx.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
};

window.FeeManager = FeeManager;
