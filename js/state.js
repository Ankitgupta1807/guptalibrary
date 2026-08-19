/**
 * GUPTA LIBRARY - STATE MANAGEMENT & DATA STORE
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 * Email: guptalibraryy@gmail.com
 */

const STORAGE_KEY = 'gupta_library_app_state_v1';

// Default initial state
const defaultState = {
  settings: {
    name: 'Gupta Library',
    email: 'guptalibraryy@gmail.com',
    phone: '+91 94312 88990',
    address: 'Sasamusa, Gopalganj, Bihar - 841505',
    landmark: 'Near Sasamusa High School, Main Road',
    established: '2022',
    currency: '₹',
    monthlyPlanFullDay: 800,
    monthlyPlanShift: 500,
    receiptFooterNote: 'Thank you for choosing Gupta Library. Fees once paid are non-refundable. Maintain discipline and silence in the study hall.',
    theme: 'light'
  },
  adminProfile: {
    name: 'Admin - Gupta Library',
    role: 'Library Director',
    email: 'guptalibraryy@gmail.com',
    phone: '+91 94312 88990',
    branch: 'Sasamusa, Gopalganj Branch'
  },
  members: [],
  seats: (function() {
    const list = [];
    // Ground Floor: 44 Seats (G1 to G44)
    for (let i = 1; i <= 44; i++) {
      const id = `G${i}`;
      let type = (i <= 14) ? 'Cabin Seat' : ((i >= 36) ? 'Quiet Corner' : 'Standard Desk');
      list.push({
        id: id,
        hall: 'Ground Floor',
        type: type,
        status: 'Vacant',
        studentId: null,
        studentName: null,
        shift: null
      });
    }
    // First Floor: 50 Seats (A1 to A50)
    for (let i = 1; i <= 50; i++) {
      const id = `A${i}`;
      let type = (i <= 16) ? 'Cabin Seat' : ((i >= 40) ? 'Quiet Corner' : 'Standard Desk');
      list.push({
        id: id,
        hall: 'First Floor',
        type: type,
        status: 'Vacant',
        studentId: null,
        studentName: null,
        shift: null
      });
    }
    return list;
  })(),
  transactions: [],
  books: [],
  issuedBooks: []
};

// Global App State Object
class StateManager {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);

        // Auto-purge legacy demo members if previously stored
        if (parsed && parsed.members && parsed.members.some(m => m.name === 'Rahul Kumar Gupta' || m.name === 'Priya Singh' || m.id === 'GL-2026-001')) {
          console.log('🧹 Purging legacy demo data permanently from local storage...');
          localStorage.removeItem(STORAGE_KEY);
          return JSON.parse(JSON.stringify(defaultState));
        }

        // Normalize seats to exactly 94 seats (44 Ground Floor + 50 First Floor)
        if (parsed && parsed.seats) {
          const validSeats = parsed.seats.filter(s => 
            (s.hall === 'Ground Floor' && /^G([1-9]|[1-3][0-9]|4[0-4])$/.test(s.id)) ||
            (s.hall === 'First Floor' && /^A([1-9]|[1-4][0-9]|50)$/.test(s.id))
          );
          if (validSeats.length === 94) {
            parsed.seats = validSeats;
          } else {
            // Restore default 94 seats structure while preserving active member seat assignments
            const defaultSeats = JSON.parse(JSON.stringify(defaultState.seats));
            parsed.seats.forEach(oldSeat => {
              const target = defaultSeats.find(s => s.id === oldSeat.id);
              if (target && oldSeat.status === 'Occupied') {
                target.status = 'Occupied';
                target.studentId = oldSeat.studentId;
                target.studentName = oldSeat.studentName;
                target.shift = oldSeat.shift;
              }
            });
            parsed.seats = defaultSeats;
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read state from localStorage', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this.saveState();
    return this.state;
  }

  clearAllData() {
    this.state.members = [];
    this.state.transactions = [];
    this.state.issuedBooks = [];
    if (this.state.seats) {
      this.state.seats.forEach(s => {
        s.status = 'Vacant';
        s.studentId = null;
        s.studentName = null;
        s.shift = null;
      });
    }
    this.saveState();
    return this.state;
  }

  // Settings getters & setters
  getSettings() {
    return this.state.settings;
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveState();
  }

  // Members methods
  getMembers() {
    return this.state.members;
  }

  getMemberById(id) {
    return this.state.members.find(m => m.id === id);
  }

  addMember(memberData) {
    const nextNum = (this.state.members.length + 1).toString().padStart(3, '0');
    const newMember = {
      id: `GL-2026-${nextNum}`,
      ...memberData,
      avatarColor: this.getRandomColor()
    };
    this.state.members.unshift(newMember);

    // If seat assigned, update seat status
    if (newMember.seatId) {
      this.assignSeat(newMember.seatId, newMember.id, newMember.name, newMember.shift);
    }

    this.saveState();

    // Supabase Cloud Sync
    if (window.SupabaseManager && window.SupabaseManager.isConnected) {
      window.SupabaseManager.upsertMember(newMember);
    }

    return newMember;
  }

  updateMember(id, updatedFields) {
    const idx = this.state.members.findIndex(m => m.id === id);
    if (idx !== -1) {
      const oldMember = this.state.members[idx];
      // If seat changed
      if (oldMember.seatId && oldMember.seatId !== updatedFields.seatId) {
        this.vacateSeat(oldMember.seatId);
      }
      if (updatedFields.seatId) {
        this.assignSeat(updatedFields.seatId, id, updatedFields.name, updatedFields.shift);
      }
      this.state.members[idx] = { ...oldMember, ...updatedFields };
      this.saveState();

      if (window.SupabaseManager && window.SupabaseManager.isConnected) {
        window.SupabaseManager.upsertMember(this.state.members[idx]);
      }
    }
  }

  deleteMember(id) {
    const member = this.getMemberById(id);
    if (member && member.seatId) {
      this.vacateSeat(member.seatId);
    }
    this.state.members = this.state.members.filter(m => m.id !== id);
    this.saveState();
  }

  // Seat Methods
  getSeats() {
    return this.state.seats;
  }

  assignSeat(seatId, studentId, studentName, shift) {
    const seat = this.state.seats.find(s => s.id === seatId);
    if (seat) {
      seat.status = 'Occupied';
      seat.studentId = studentId;
      seat.studentName = studentName;
      seat.shift = shift;
      this.saveState();

      if (window.SupabaseManager && window.SupabaseManager.isConnected) {
        window.SupabaseManager.updateSeat(seat);
      }
    }
  }

  vacateSeat(seatId) {
    const seat = this.state.seats.find(s => s.id === seatId);
    if (seat) {
      seat.status = 'Vacant';
      seat.studentId = null;
      seat.studentName = null;
      seat.shift = null;
      this.saveState();

      if (window.SupabaseManager && window.SupabaseManager.isConnected) {
        window.SupabaseManager.updateSeat(seat);
      }
    }
  }

  setSeatMaintenance(seatId, isMaintenance) {
    const seat = this.state.seats.find(s => s.id === seatId);
    if (seat) {
      seat.status = isMaintenance ? 'Maintenance' : 'Vacant';
      if (isMaintenance) {
        seat.studentId = null;
        seat.studentName = null;
      }
      this.saveState();

      if (window.SupabaseManager && window.SupabaseManager.isConnected) {
        window.SupabaseManager.updateSeat(seat);
      }
    }
  }

  // Transactions / Billing
  getTransactions() {
    return this.state.transactions;
  }

  addTransaction(txData) {
    const count = this.state.transactions.length + 1001;
    const newTx = {
      receiptNo: `GL-2026-${count}`,
      paymentDate: new Date().toISOString().split('T')[0],
      collectedBy: this.state.adminProfile.name || 'Admin - Gupta Library',
      status: 'Paid',
      ...txData
    };
    this.state.transactions.unshift(newTx);

    // Update student's dues / validity if provided
    if (newTx.studentId) {
      const member = this.getMemberById(newTx.studentId);
      if (member) {
        member.dues = 0;
        member.status = 'Active';
        if (window.SupabaseManager && window.SupabaseManager.isConnected) {
          window.SupabaseManager.upsertMember(member);
        }
      }
    }

    this.saveState();

    if (window.SupabaseManager && window.SupabaseManager.isConnected) {
      window.SupabaseManager.insertTransaction(newTx);
    }

    return newTx;
  }

  deleteTransaction(receiptNo) {
    this.state.transactions = this.state.transactions.filter(t => t.receiptNo !== receiptNo);
    this.saveState();

    if (window.SupabaseManager && window.SupabaseManager.isConnected) {
      window.SupabaseManager.deleteTransactionFromCloud(receiptNo);
    }
  }

  // Books
  getBooks() {
    return this.state.books;
  }

  addBook(bookData) {
    const newBook = {
      id: `BK-${this.state.books.length + 101}`,
      availableCopies: bookData.totalCopies,
      status: 'Available',
      ...bookData
    };
    this.state.books.unshift(newBook);
    this.saveState();

    if (window.SupabaseManager && window.SupabaseManager.isConnected) {
      window.SupabaseManager.insertBook(newBook);
    }

    return newBook;
  }

  getIssuedBooks() {
    return this.state.issuedBooks;
  }

  issueBook(bookId, studentId, dueDate) {
    const book = this.state.books.find(b => b.id === bookId);
    const member = this.getMemberById(studentId);
    if (!book || !member || book.availableCopies <= 0) return false;

    book.availableCopies -= 1;
    if (book.availableCopies === 0) book.status = 'All Issued';

    const newIssue = {
      id: `ISS-${this.state.issuedBooks.length + 201}`,
      bookId: book.id,
      bookTitle: book.title,
      studentId: member.id,
      studentName: member.name,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      returnDate: null,
      status: 'Issued'
    };

    this.state.issuedBooks.unshift(newIssue);
    this.saveState();

    if (window.SupabaseManager && window.SupabaseManager.isConnected) {
      window.SupabaseManager.insertBook(book);
    }

    return newIssue;
  }

  returnBook(issueId) {
    const issue = this.state.issuedBooks.find(i => i.id === issueId);
    if (issue && !issue.returnDate) {
      issue.returnDate = new Date().toISOString().split('T')[0];
      issue.status = 'Returned';

      const book = this.state.books.find(b => b.id === issue.bookId);
      if (book) {
        book.availableCopies += 1;
        book.status = 'Available';
        if (window.SupabaseManager && window.SupabaseManager.isConnected) {
          window.SupabaseManager.insertBook(book);
        }
      }
      this.saveState();
      return true;
    }
    return false;
  }

  getRandomColor() {
    const colors = ['#4338ca', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0284c7', '#0891b2', '#be185d'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// Export singleton instance
window.appState = new StateManager();
