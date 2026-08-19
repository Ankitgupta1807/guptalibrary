/**
 * GUPTA LIBRARY - MEMBER & ADMISSIONS MANAGER (ADMIN ONLY)
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 */

const MemberManager = {
  searchQuery: '',
  filterStatus: 'all',
  activeEditStudentId: null,
  activeDeleteStudentId: null,

  init() {
    this.render();
    this.attachEvents();
  },

  attachEvents() {
    const searchInput = document.getElementById('member-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    const filterStatus = document.getElementById('member-status-filter');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        this.filterStatus = e.target.value;
        this.render();
      });
    }

    // New Member Form Submit
    const formNew = document.getElementById('form-new-member');
    if (formNew) {
      formNew.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateMember(e.target);
      });
    }

    // Edit Member Form Submit
    const formEdit = document.getElementById('form-edit-member');
    if (formEdit) {
      formEdit.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUpdateMember(e.target);
      });
    }

    // Confirm Delete Button
    const btnConfirmDelete = document.getElementById('btn-confirm-delete-student');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => {
        this.handleDeleteMemberConfirmed();
      });
    }
  },

  render() {
    const tableBody = document.getElementById('members-table-body');
    if (!tableBody) return;

    let members = window.appState.getMembers();

    // Apply Search (Search by name, phone, admission ID)
    if (this.searchQuery) {
      members = members.filter(m => 
        (m.name && m.name.toLowerCase().includes(this.searchQuery)) ||
        (m.phone && m.phone.includes(this.searchQuery)) ||
        (m.id && m.id.toLowerCase().includes(this.searchQuery)) ||
        (m.seatId && m.seatId.toLowerCase().includes(this.searchQuery))
      );
    }

    // Apply Status Filter
    if (this.filterStatus !== 'all') {
      members = members.filter(m => m.status && m.status.toLowerCase() === this.filterStatus.toLowerCase());
    }

    const countElem = document.getElementById('member-count-badge');
    if (countElem) countElem.textContent = `${members.length} Students`;

    if (members.length === 0) {
      if (this.searchQuery || this.filterStatus !== 'all') {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
              No students found matching "${this.searchQuery || this.filterStatus}".
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎓</div>
              <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.25rem;">No Students Registered Yet</div>
              <div style="font-size: 0.8rem;">Click "+ Take New Admission" to admit your first student.</div>
            </td>
          </tr>
        `;
      }
      return;
    }

    tableBody.innerHTML = members.map(m => {
      const statusClass = m.status === 'Active' ? 'active' : (m.status === 'Due' ? 'due' : 'inactive');
      const initials = (m.name || 'S').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const cleanPhone = (m.phone || '').replace(/[^0-9]/g, '');

      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar" style="background: ${m.avatarColor || '#4338ca'}; color: white;">${initials}</div>
              <div>
                <div class="user-meta-name">${m.name}</div>
                <div class="user-meta-id">
                  <strong style="color:var(--primary);">${m.id}</strong> &bull; 
                  <a href="tel:${cleanPhone}" style="color:var(--text-muted); text-decoration:underline;">📞 ${m.phone}</a>
                </div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${m.seatId ? `<span class="status-pill active" style="font-size:0.75rem;">${m.seatId}</span>` : '<span style="color:var(--text-subtle);">Unassigned</span>'}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${m.shift ? m.shift.split('(')[0] : 'None'}</div>
          </td>
          <td>
            <div style="font-size: 0.84rem; font-weight: 500;">${m.examTarget || 'General Study'}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${m.address || 'Gopalganj'}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${window.appState.getSettings().currency}${m.monthlyFee || 500}/mo</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Joined: ${m.joiningDate || 'N/A'}</div>
          </td>
          <td>
            <span class="status-pill ${statusClass}">${m.status || 'Active'}</span>
            ${m.dues > 0 ? `<div style="font-size:0.7rem; color:var(--danger); font-weight:600; margin-top:2px;">Due: ${window.appState.getSettings().currency}${m.dues}</div>` : ''}
          </td>
          <td>
            <div style="font-size: 0.82rem; font-weight: 500;">${m.validTill || 'N/A'}</div>
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm btn-icon-only" title="Chat on WhatsApp" onclick="MemberManager.sendWhatsApp('${m.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </button>
              <button class="btn btn-secondary btn-sm" title="View Student ID Card" onclick="MemberManager.openIDCard('${m.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                ID
              </button>
              <button class="btn btn-secondary btn-sm" title="Edit Student Details" onclick="MemberManager.openEditModal('${m.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                Edit
              </button>
              <button class="btn btn-secondary btn-sm" style="color: var(--danger-dark); border-color: rgba(239,68,68,0.3);" title="Delete Student" onclick="MemberManager.openDeleteModal('${m.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openNewMemberModal() {
    const seatSelect = document.getElementById('new-member-seat');
    if (seatSelect) {
      const vacantSeats = window.appState.getSeats().filter(s => s.status === 'Vacant');
      seatSelect.innerHTML = `
        <option value="">-- No Desk Assigned (General) --</option>
        ${vacantSeats.map(s => `<option value="${s.id}">${s.id} (${s.hall} - ${s.type})</option>`).join('')}
      `;
    }
    window.App.openModal('modal-new-member');
  },

  handleCreateMember(form) {
    const formData = new FormData(form);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email') || '';
    const address = formData.get('address') || 'Sasamusa, Gopalganj';
    const examTarget = formData.get('examTarget') || 'Competitive Exams';
    const seatId = formData.get('seatId') || null;
    const shift = formData.get('shift');
    const monthlyFee = Number(formData.get('monthlyFee')) || (shift.includes('Full') ? 800 : 500);
    const joiningDate = formData.get('joiningDate') || new Date().toISOString().split('T')[0];

    // Compute Valid Till 1 month forward
    const d = new Date(joiningDate);
    d.setMonth(d.getMonth() + 1);
    const validTill = d.toISOString().split('T')[0];

    const newMember = window.appState.addMember({
      name,
      phone,
      email,
      address,
      examTarget,
      seatId,
      shift,
      monthlyFee,
      joiningDate,
      validTill,
      status: 'Active',
      dues: 0
    });

    // Record First Month Subscription Payment
    const totalPaid = monthlyFee;
    const tx = window.appState.addTransaction({
      studentId: newMember.id,
      studentName: newMember.name,
      phone: newMember.phone,
      seatId: newMember.seatId || 'N/A',
      shift: newMember.shift,
      amount: totalPaid,
      paymentMode: 'Cash / UPI',
      period: `${joiningDate} to ${validTill}`,
      remarks: `1st Month Study Subscription (₹${monthlyFee})`
    });

    form.reset();
    window.App.closeModal('modal-new-member');
    this.render();
    window.SeatManager.render();
    window.FeeManager.render();
    window.App.updateDashboardStats();

    window.App.showToast(`Student "${newMember.name}" admitted successfully!`, 'success');
    
    // Automatically preview official PDF payment receipt for new admission
    setTimeout(() => {
      FeeManager.openReceiptModal(tx.receiptNo);
    }, 400);
  },

  openEditModal(memberId) {
    const member = window.appState.getMemberById(memberId);
    if (!member) return;

    this.activeEditStudentId = memberId;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    setVal('edit-member-id', member.id);
    setVal('edit-member-name', member.name);
    setVal('edit-member-phone', member.phone);
    setVal('edit-member-email', member.email);
    setVal('edit-member-address', member.address);
    setVal('edit-member-exam', member.examTarget);
    setVal('edit-member-fee', member.monthlyFee);
    setVal('edit-member-shift', member.shift || 'Full Day (06:00 AM - 10:00 PM)');
    setVal('edit-member-status', member.status || 'Active');
    setVal('edit-member-validtill', member.validTill);
    setVal('edit-member-dues', member.dues || 0);

    // Populate seat options (current seat + vacant seats)
    const seatSelect = document.getElementById('edit-member-seat');
    if (seatSelect) {
      const vacantSeats = window.appState.getSeats().filter(s => s.status === 'Vacant' || s.id === member.seatId);
      seatSelect.innerHTML = `
        <option value="">-- No Desk Assigned --</option>
        ${vacantSeats.map(s => `
          <option value="${s.id}" ${s.id === member.seatId ? 'selected' : ''}>
            ${s.id} (${s.hall} - ${s.type}) ${s.id === member.seatId ? '[Current]' : ''}
          </option>
        `).join('')}
      `;
    }

    window.App.openModal('modal-edit-member');
  },

  handleUpdateMember(form) {
    if (!this.activeEditStudentId) return;

    const formData = new FormData(form);
    const updated = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || '',
      address: formData.get('address') || 'Sasamusa, Gopalganj',
      examTarget: formData.get('examTarget') || 'Competitive Exams',
      seatId: formData.get('seatId') || null,
      shift: formData.get('shift'),
      monthlyFee: Number(formData.get('monthlyFee')) || 500,
      validTill: formData.get('validTill'),
      status: formData.get('status') || 'Active',
      dues: Number(formData.get('dues')) || 0
    };

    window.appState.updateMember(this.activeEditStudentId, updated);

    window.App.closeModal('modal-edit-member');
    this.render();
    window.SeatManager.render();
    window.App.updateDashboardStats();
    window.App.showToast(`Student details for "${updated.name}" updated!`, 'success');
  },

  openDeleteModal(memberId) {
    const member = window.appState.getMemberById(memberId);
    if (!member) return;

    this.activeDeleteStudentId = memberId;

    const promptText = document.getElementById('delete-student-prompt-text');
    if (promptText) {
      promptText.innerHTML = `Are you sure you want to delete student <strong>${member.name}</strong> (ID: <code>${member.id}</code>)?<br><br>This will vacate seat <strong>${member.seatId || 'N/A'}</strong> and remove their student records.`;
    }

    window.App.openModal('modal-delete-member');
  },

  handleDeleteMemberConfirmed() {
    if (!this.activeDeleteStudentId) return;

    const member = window.appState.getMemberById(this.activeDeleteStudentId);
    const name = member ? member.name : 'Student';

    // Delete locally and from cloud
    window.appState.deleteMember(this.activeDeleteStudentId);
    if (window.SupabaseManager) {
      window.SupabaseManager.deleteMemberFromCloud(this.activeDeleteStudentId);
    }

    window.App.closeModal('modal-delete-member');
    this.activeDeleteStudentId = null;
    this.render();
    window.SeatManager.render();
    window.App.updateDashboardStats();

    window.App.showToast(`Student "${name}" deleted successfully.`, 'info');
  },

  openMemberDetails(memberId) {
    const member = window.appState.getMemberById(memberId);
    if (!member) return;

    const modalBody = document.getElementById('member-details-modal-body');
    const modalTitle = document.getElementById('member-details-modal-title');
    if (modalTitle) modalTitle.textContent = `Student Profile: ${member.name}`;

    const memberTxs = window.appState.getTransactions().filter(t => t.studentId === member.id);

    let html = `
      <div style="display: flex; gap: 1.25rem; align-items: center; padding: 1.25rem; background: var(--bg-subtle); border-radius: var(--radius-lg); margin-bottom: 1.25rem;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: ${member.avatarColor || '#4338ca'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 800;">
          ${(member.name || 'S').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
        </div>
        <div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">${member.name}</div>
          <div style="font-size: 0.84rem; color: var(--text-muted);">
            <strong>${member.id}</strong> &bull; Phone: <strong>${member.phone}</strong> &bull; Target: <strong>${member.examTarget}</strong>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
            Address: ${member.address}
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.85rem;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Seat / Shift</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-top: 0.2rem;">${member.seatId || 'No Seat'} (${member.shift ? member.shift.split('(')[0] : 'N/A'})</div>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.85rem;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Membership Status</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: ${member.status === 'Active' ? 'var(--success)' : 'var(--danger)'}; margin-top: 0.2rem;">
            ${member.status} (Valid: ${member.validTill})
          </div>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 0.85rem;">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Monthly Fee</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin-top: 0.2rem;">${window.appState.getSettings().currency}${member.monthlyFee}/month</div>
        </div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.6rem;">Payment Records</h4>
        <div class="data-table-container" style="max-height: 180px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${memberTxs.length === 0 ? '<tr><td colspan="6" style="text-align:center;">No payment records found.</td></tr>' : 
                memberTxs.map(t => `
                  <tr>
                    <td><strong>${t.receiptNo}</strong></td>
                    <td>${t.paymentDate}</td>
                    <td>${t.period}</td>
                    <td><strong>${window.appState.getSettings().currency}${t.amount}</strong></td>
                    <td>${t.paymentMode}</td>
                    <td><button class="btn btn-secondary btn-sm" onclick="FeeManager.openReceiptModal('${t.receiptNo}')">Receipt</button></td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-secondary" onclick="MemberManager.openIDCard('${member.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            Print ID Card
          </button>
          <button class="btn btn-secondary" onclick="App.closeModal('modal-member-details'); MemberManager.openEditModal('${member.id}')">
            Edit Profile
          </button>
        </div>
        <button class="btn btn-primary" onclick="FeeManager.openCollectFeeModal('${member.id}')">
          Collect Fee / Renew
        </button>
      </div>
    `;

    if (modalBody) modalBody.innerHTML = html;
    window.App.openModal('modal-member-details');
  },

  openIDCard(memberId) {
    const member = window.appState.getMemberById(memberId);
    if (!member) return;

    const settings = window.appState.getSettings();
    const container = document.getElementById('id-card-modal-content');
    if (!container) return;

    const initials = (member.name || 'S').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

    container.innerHTML = `
      <div class="printable-area id-card-print-target">
        <div class="id-card-preview">
          <div class="id-card-header">
            <div class="id-card-lib-name">${settings.name}</div>
            <div class="id-card-lib-address">${settings.address}</div>
            <div style="font-size: 0.65rem; color: #a5b4fc; margin-top: 0.2rem;">Email: ${settings.email} &bull; Ph: ${settings.phone}</div>
            
            <div class="id-card-photo-wrapper">
              <span>${initials}</span>
            </div>
          </div>

          <div class="id-card-body">
            <div>
              <div class="id-student-name">${member.name}</div>
              <div class="id-student-num">Admission ID: ${member.id}</div>
            </div>

            <div class="id-info-grid">
              <div class="info-row">
                <strong>Assigned Seat</strong>
                <span>${member.seatId || 'General'}</span>
              </div>
              <div class="info-row">
                <strong>Shift Timing</strong>
                <span>${member.shift ? member.shift.split('(')[0] : 'Standard'}</span>
              </div>
              <div class="info-row">
                <strong>Target Exam</strong>
                <span>${member.examTarget || 'Civil Services'}</span>
              </div>
              <div class="info-row">
                <strong>Valid Upto</strong>
                <span>${member.validTill || '2026-12-31'}</span>
              </div>
            </div>

            <div class="id-card-footer">
              <div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </div>
              <div style="text-align: right;">
                <div style="font-family: cursive; font-size: 0.85rem; color: #1e1b4b;">Gupta Library</div>
                <div style="font-size: 0.6rem; color: #64748b;">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    window.App.openModal('modal-id-card');
  },

  sendWhatsApp(memberId) {
    const member = window.appState.getMemberById(memberId);
    if (!member) return;
    const settings = window.appState.getSettings();
    const cleanPhone = (member.phone || '').replace(/[^0-9]/g, '');
    const msg = `Hello *${member.name}*,\n\nGreetings from *${settings.name}* (${settings.address}).\n\nYour Admission ID is *${member.id}* and your assigned seat is *${member.seatId || 'General Desk'}*.\n\n*Helpline:* ${settings.phone}\n*Email:* ${settings.email}`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }
};

window.MemberManager = MemberManager;
