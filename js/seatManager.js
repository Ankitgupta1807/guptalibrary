/**
 * GUPTA LIBRARY - SEAT & FLOOR MATRIX MANAGER
 * Ground Floor: 44 Seats (G1 to G44)
 * First Floor: 50 Seats (A1 to A50)
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 */

const SeatManager = {
  currentHall: 'Ground Floor',
  currentShiftFilter: 'all',

  init() {
    this.render();
    this.attachEvents();
  },

  attachEvents() {
    // Floor Switchers (Ground Floor / First Floor)
    document.querySelectorAll('.hall-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.hall-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentHall = e.currentTarget.dataset.hall;
        this.render();
      });
    });

    // Shift Filter Selector
    const shiftFilterSelect = document.getElementById('seat-shift-filter');
    if (shiftFilterSelect) {
      shiftFilterSelect.addEventListener('change', (e) => {
        this.currentShiftFilter = e.target.value;
        this.render();
      });
    }
  },

  render() {
    const container = document.getElementById('seat-grid');
    if (!container) return;

    const allSeats = window.appState.getSeats();
    const hallSeats = allSeats.filter(s => s.hall === this.currentHall);

    // Filter by shift if specified
    const filteredSeats = hallSeats.filter(s => {
      if (this.currentShiftFilter === 'all') return true;
      if (this.currentShiftFilter === 'vacant') return s.status === 'Vacant';
      if (this.currentShiftFilter === 'maintenance') return s.status === 'Maintenance';
      return s.shift && s.shift.toLowerCase().includes(this.currentShiftFilter.toLowerCase());
    });

    // Update Floor Stats
    const total = hallSeats.length;
    const occupied = hallSeats.filter(s => s.status === 'Occupied').length;
    const vacant = hallSeats.filter(s => s.status === 'Vacant').length;
    const maintenance = hallSeats.filter(s => s.status === 'Maintenance').length;

    const statsElem = document.getElementById('hall-seat-stats');
    if (statsElem) {
      statsElem.innerHTML = `
        <span>Total: <strong>${total} Seats</strong></span> &bull; 
        <span style="color: var(--success)">Vacant: <strong>${vacant}</strong></span> &bull; 
        <span style="color: var(--primary)">Occupied: <strong>${occupied}</strong></span>
        ${maintenance > 0 ? ` &bull; <span style="color: var(--danger)">Maintenance: <strong>${maintenance}</strong></span>` : ''}
      `;
    }

    if (filteredSeats.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">No seats match the selected filter on ${this.currentHall}.</div>`;
      return;
    }

    container.innerHTML = filteredSeats.map(seat => {
      let statusClass = 'vacant';
      let badgeHtml = '<span class="seat-shift-badge vacant">Vacant</span>';

      if (seat.status === 'Maintenance') {
        statusClass = 'maintenance';
        badgeHtml = '<span class="seat-shift-badge maintenance" style="background:#fee2e2; color:#b91c1c;">Repair</span>';
      } else if (seat.status === 'Occupied') {
        const sLower = (seat.shift || '').toLowerCase();
        if (sLower.includes('morning')) {
          statusClass = 'occupied-morning';
          badgeHtml = '<span class="seat-shift-badge morning">Morning</span>';
        } else if (sLower.includes('afternoon')) {
          statusClass = 'occupied-evening';
          badgeHtml = '<span class="seat-shift-badge afternoon">Afternoon</span>';
        } else if (sLower.includes('evening')) {
          statusClass = 'occupied-evening';
          badgeHtml = '<span class="seat-shift-badge evening">Evening</span>';
        } else {
          statusClass = 'occupied-fullday';
          badgeHtml = '<span class="seat-shift-badge fullday">Full Day</span>';
        }
      }

      return `
        <div class="seat-card-item ${statusClass}" onclick="SeatManager.openSeatModal('${seat.id}')">
          <div class="seat-num">
            <span>${seat.id}</span>
            <span class="seat-type-tag">${seat.type === 'Cabin Seat' ? 'Cabin' : 'Desk'}</span>
          </div>
          <div class="seat-student-info">
            <div class="seat-student-name">${seat.studentName || 'Available'}</div>
            ${badgeHtml}
          </div>
        </div>
      `;
    }).join('');
  },

  openSeatModal(seatId) {
    const seat = window.appState.getSeats().find(s => s.id === seatId);
    if (!seat) return;

    const modalBody = document.getElementById('seat-action-modal-body');
    const modalTitle = document.getElementById('seat-action-modal-title');
    
    if (modalTitle) modalTitle.textContent = `Seat Details - ${seat.id} (${seat.hall})`;

    let html = `
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem; padding: 1rem; background: var(--bg-subtle); border-radius: var(--radius-md);">
        <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">${seat.id}</div>
        <div>
          <div style="font-weight: 700; color: var(--text-main);">${seat.hall} &bull; ${seat.type}</div>
          <div style="font-size: 0.82rem; color: var(--text-muted);">Current Status: <strong>${seat.status}</strong> ${seat.shift ? `(${seat.shift})` : ''}</div>
        </div>
      </div>
    `;

    if (seat.status === 'Occupied') {
      const student = window.appState.getMemberById(seat.studentId);
      html += `
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-muted);">Occupant Information</h4>
          <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem;">
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">${seat.studentName}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">Admission ID: <strong>${seat.studentId}</strong></div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Phone: <strong>${student ? student.phone : 'N/A'}</strong></div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Shift: <strong>${seat.shift}</strong></div>
            ${student ? `<div style="font-size: 0.82rem; color: var(--text-muted);">Valid Till: <strong>${student.validTill}</strong></div>` : ''}
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick="MemberManager.openMemberDetails('${seat.studentId}')">View Member Profile</button>
          <button class="btn btn-danger" style="background: var(--danger); color: white;" onclick="SeatManager.handleVacateSeat('${seat.id}')">Vacate Seat</button>
        </div>
      `;
    } else {
      const membersWithoutSeat = window.appState.getMembers().filter(m => !m.seatId || m.seatId === '');
      html += `
        <div class="form-group">
          <label class="form-label">Assign to Student</label>
          <select id="assign-seat-student" class="form-select">
            <option value="">-- Select Student --</option>
            ${membersWithoutSeat.map(m => `<option value="${m.id}">${m.name} (${m.id} - ${m.phone})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Shift</label>
          <select id="assign-seat-shift" class="form-select">
            <option value="Morning (06:00 AM - 12:00 PM)">Morning (06:00 AM - 12:00 PM)</option>
            <option value="Afternoon (12:00 PM - 06:00 PM)">Afternoon (12:00 PM - 06:00 PM)</option>
            <option value="Evening (04:00 PM - 10:00 PM)">Evening (04:00 PM - 10:00 PM)</option>
            <option value="Full Day (06:00 AM - 10:00 PM)" selected>Full Day (06:00 AM - 10:00 PM)</option>
          </select>
        </div>
        <div style="display: flex; gap: 0.75rem; justify-content: space-between; margin-top: 1.5rem; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick="SeatManager.toggleMaintenance('${seat.id}', ${seat.status !== 'Maintenance'})">
            ${seat.status === 'Maintenance' ? 'Mark Available' : 'Mark Under Maintenance'}
          </button>
          <button class="btn btn-primary" onclick="SeatManager.handleAssignSeat('${seat.id}')">Assign Seat</button>
        </div>
      `;
    }

    if (modalBody) modalBody.innerHTML = html;
    window.App.openModal('modal-seat-action');
  },

  handleAssignSeat(seatId) {
    const studentSelect = document.getElementById('assign-seat-student');
    const shiftSelect = document.getElementById('assign-seat-shift');
    if (!studentSelect || !studentSelect.value) {
      window.App.showToast('Please select a student to assign.', 'warning');
      return;
    }
    const student = window.appState.getMemberById(studentSelect.value);
    if (!student) return;

    window.appState.assignSeat(seatId, student.id, student.name, shiftSelect.value);
    student.seatId = seatId;
    student.shift = shiftSelect.value;
    window.appState.saveState();

    window.App.closeModal('modal-seat-action');
    this.render();
    window.MemberManager.render();
    window.App.showToast(`Seat ${seatId} successfully assigned to ${student.name}`, 'success');
  },

  handleVacateSeat(seatId) {
    const seat = window.appState.getSeats().find(s => s.id === seatId);
    if (!seat) return;

    if (seat.studentId) {
      const student = window.appState.getMemberById(seat.studentId);
      if (student) {
        student.seatId = null;
      }
    }

    window.appState.vacateSeat(seatId);
    window.App.closeModal('modal-seat-action');
    this.render();
    window.MemberManager.render();
    window.App.showToast(`Seat ${seatId} has been vacated.`, 'success');
  },

  toggleMaintenance(seatId, isMaintenance) {
    window.appState.setSeatMaintenance(seatId, isMaintenance);
    window.App.closeModal('modal-seat-action');
    this.render();
    window.App.showToast(`Seat ${seatId} status updated.`, 'success');
  }
};

window.SeatManager = SeatManager;
