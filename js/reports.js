/**
 * GUPTA LIBRARY - REPORTS, ANALYTICS & EXPORT
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 */

const ReportsManager = {
  init() {
    this.renderDefaulters();
    this.renderShiftAnalytics();
  },

  renderDefaulters() {
    const tableBody = document.getElementById('defaulters-table-body');
    if (!tableBody) return;

    const members = window.appState.getMembers();
    const settings = window.appState.getSettings();
    const duesList = members.filter(m => m.status === 'Due' || m.dues > 0);

    const countElem = document.getElementById('defaulters-count-badge');
    if (countElem) countElem.textContent = `${duesList.length} Students Pending`;

    if (duesList.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--success-dark);">No pending fee dues. All students are up-to-date!</td></tr>`;
      return;
    }

    tableBody.innerHTML = duesList.map(m => {
      return `
        <tr>
          <td>
            <div style="font-weight: 700;">${m.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${m.id}</div>
          </td>
          <td><strong>${m.phone}</strong></td>
          <td>Seat: <strong>${m.seatId || 'General'}</strong> (${m.shift ? m.shift.split('(')[0] : 'Standard'})</td>
          <td><strong style="color: var(--danger); font-size: 1rem;">${settings.currency}${m.dues || m.monthlyFee}</strong></td>
          <td><span class="status-pill due">Due since ${m.validTill}</span></td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="ReportsManager.sendDuesWhatsApp('${m.id}')" title="Send WhatsApp Due Alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Remind
              </button>
              <button class="btn btn-primary btn-sm" onclick="FeeManager.openCollectFeeModal('${m.id}')">Collect</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderShiftAnalytics() {
    const seats = window.appState.getSeats();
    const total = seats.length;
    const morning = seats.filter(s => s.status === 'Occupied' && (s.shift || '').includes('Morning')).length;
    const afternoon = seats.filter(s => s.status === 'Occupied' && (s.shift || '').includes('Afternoon')).length;
    const evening = seats.filter(s => s.status === 'Occupied' && (s.shift || '').includes('Evening')).length;
    const fullday = seats.filter(s => s.status === 'Occupied' && (s.shift || '').includes('Full')).length;
    const vacant = seats.filter(s => s.status === 'Vacant').length;

    const container = document.getElementById('shift-analytics-bars');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
            <span>Morning Shift (06:00 AM - 12:00 PM)</span>
            <strong>${morning} Seats</strong>
          </div>
          <div style="height: 8px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden;">
            <div style="width: ${(morning / total) * 100}%; height: 100%; background: var(--shift-morning);"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
            <span>Afternoon Shift (12:00 PM - 06:00 PM)</span>
            <strong>${afternoon} Seats</strong>
          </div>
          <div style="height: 8px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden;">
            <div style="width: ${(afternoon / total) * 100}%; height: 100%; background: var(--shift-afternoon);"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
            <span>Evening Shift (04:00 PM - 10:00 PM)</span>
            <strong>${evening} Seats</strong>
          </div>
          <div style="height: 8px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden;">
            <div style="width: ${(evening / total) * 100}%; height: 100%; background: var(--shift-evening);"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
            <span>Full Day Reserved (06:00 AM - 10:00 PM)</span>
            <strong>${fullday} Seats</strong>
          </div>
          <div style="height: 8px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden;">
            <div style="width: ${(fullday / total) * 100}%; height: 100%; background: var(--shift-fullday);"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem;">
            <span>Vacant Desks</span>
            <strong style="color: var(--success);">${vacant} Seats (${Math.round((vacant/total)*100)}%)</strong>
          </div>
          <div style="height: 8px; background: var(--bg-subtle); border-radius: 4px; overflow: hidden;">
            <div style="width: ${(vacant / total) * 100}%; height: 100%; background: var(--success);"></div>
          </div>
        </div>
      </div>
    `;
  },

  sendDuesWhatsApp(studentId) {
    const member = window.appState.getMemberById(studentId);
    if (!member) return;

    const settings = window.appState.getSettings();
    const msg = `Dear *${member.name}*,\n\n` +
      `This is a gentle reminder from *${settings.name}* (${settings.address}).\n` +
      `Your library study subscription fee of *${settings.currency}${member.dues || member.monthlyFee}* for Seat *${member.seatId || 'Assigned'}* was due on *${member.validTill}*.\n\n` +
      `Please renew your seat subscription at the reception or pay online via UPI to avoid seat reallocation.\n\n` +
      `*Library Email:* ${settings.email}\n` +
      `*Helpline:* ${settings.phone}\n` +
      `Thank you!`;

    const cleanPhone = (member.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  },

  exportCSV(type) {
    let filename = '';
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (type === 'transactions') {
      filename = `Gupta_Library_Payments_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += 'ReceiptNo,StudentId,StudentName,Phone,Seat,Shift,Amount,Mode,Date,Period,Remarks\n';
      const txs = window.appState.getTransactions();
      txs.forEach(t => {
        csvContent += `"${t.receiptNo}","${t.studentId}","${t.studentName}","${t.phone}","${t.seatId || ''}","${t.shift || ''}","${t.amount}","${t.paymentMode}","${t.paymentDate}","${t.period}","${t.remarks}"\n`;
      });
    } else if (type === 'members') {
      filename = `Gupta_Library_Students_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent += 'MemberID,Name,Phone,Email,SeatID,Hall,Shift,MonthlyFee,JoiningDate,ValidTill,Status,Dues\n';
      const members = window.appState.getMembers();
      members.forEach(m => {
        csvContent += `"${m.id}","${m.name}","${m.phone}","${m.email || ''}","${m.seatId || ''}","${m.hall || ''}","${m.shift || ''}","${m.monthlyFee}","${m.joiningDate}","${m.validTill}","${m.status}","${m.dues}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.App.showToast(`Exported ${filename} successfully!`, 'success');
  }
};

window.ReportsManager = ReportsManager;
