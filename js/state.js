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
  members: [
    {
      id: 'GL-2026-001',
      name: 'Rahul Kumar Gupta',
      phone: '9835012345',
      email: 'rahul.gopalganj@gmail.com',
      gender: 'Male',
      address: 'Sasamusa Bazar, Gopalganj',
      examTarget: 'BPSC (Civil Services)',
      seatId: 'G4',
      hall: 'Ground Floor',
      shift: 'Full Day (06:00 AM - 10:00 PM)',
      monthlyFee: 800,
      joiningDate: '2026-01-10',
      validTill: '2026-09-10',
      status: 'Active',
      dues: 0,
      avatarColor: '#4338ca'
    },
    {
      id: 'GL-2026-002',
      name: 'Priya Singh',
      phone: '9708145678',
      email: 'priya.singh@gmail.com',
      gender: 'Female',
      address: 'Thawe, Gopalganj',
      examTarget: 'SSC CGL',
      seatId: 'G8',
      hall: 'Ground Floor',
      shift: 'Morning (06:00 AM - 12:00 PM)',
      monthlyFee: 500,
      joiningDate: '2026-02-01',
      validTill: '2026-09-01',
      status: 'Active',
      dues: 0,
      avatarColor: '#059669'
    },
    {
      id: 'GL-2026-003',
      name: 'Amit Kumar Tiwari',
      phone: '9122334455',
      email: 'amit.tiwari@outlook.com',
      gender: 'Male',
      address: 'Kuchaikote, Gopalganj',
      examTarget: 'UPSC CSE',
      seatId: 'G12',
      hall: 'Ground Floor',
      shift: 'Evening (04:00 PM - 10:00 PM)',
      monthlyFee: 500,
      joiningDate: '2026-01-15',
      validTill: '2026-08-15',
      status: 'Due',
      dues: 500,
      avatarColor: '#d97706'
    },
    {
      id: 'GL-2026-004',
      name: 'Anjali Kumari',
      phone: '9631256789',
      email: 'anjali.gkp@gmail.com',
      gender: 'Female',
      address: 'Sasamusa, Bihar - 841505',
      examTarget: 'Bihar Daroga / SI',
      seatId: 'A2',
      hall: 'First Floor',
      shift: 'Full Day (06:00 AM - 10:00 PM)',
      monthlyFee: 800,
      joiningDate: '2026-03-05',
      validTill: '2026-09-05',
      status: 'Active',
      dues: 0,
      avatarColor: '#7c3aed'
    },
    {
      id: 'GL-2026-005',
      name: 'Vikash Yadav',
      phone: '9934112233',
      email: 'vikash.yadav@gmail.com',
      gender: 'Male',
      address: 'Manjha Garh, Gopalganj',
      examTarget: 'Railway RRB NTPC',
      seatId: 'A9',
      hall: 'First Floor',
      shift: 'Morning (06:00 AM - 12:00 PM)',
      monthlyFee: 500,
      joiningDate: '2026-02-12',
      validTill: '2026-08-12',
      status: 'Due',
      dues: 500,
      avatarColor: '#dc2626'
    },
    {
      id: 'GL-2026-006',
      name: 'Sneha Mishra',
      phone: '9570112244',
      email: 'sneha.mishra@gmail.com',
      gender: 'Female',
      address: 'Hathwa, Gopalganj',
      examTarget: 'Banking (IBPS PO)',
      seatId: 'G15',
      hall: 'Ground Floor',
      shift: 'Afternoon (12:00 PM - 06:00 PM)',
      monthlyFee: 500,
      joiningDate: '2026-04-01',
      validTill: '2026-10-01',
      status: 'Active',
      dues: 0,
      avatarColor: '#0284c7'
    },
    {
      id: 'GL-2026-007',
      name: 'Roshan Verma',
      phone: '9471889900',
      email: 'roshan.verma@gmail.com',
      gender: 'Male',
      address: 'Sasamusa Station Road',
      examTarget: 'SSC GD & Defence',
      seatId: 'A14',
      hall: 'First Floor',
      shift: 'Full Day (06:00 AM - 10:00 PM)',
      monthlyFee: 800,
      joiningDate: '2026-02-20',
      validTill: '2026-09-20',
      status: 'Active',
      dues: 0,
      avatarColor: '#0891b2'
    },
    {
      id: 'GL-2026-008',
      name: 'Pooja Pandey',
      phone: '9304123987',
      email: 'pooja.pandey@gmail.com',
      gender: 'Female',
      address: 'Barauli, Gopalganj',
      examTarget: 'BPSC Teacher TRE',
      seatId: 'G20',
      hall: 'Ground Floor',
      shift: 'Morning (06:00 AM - 12:00 PM)',
      monthlyFee: 500,
      joiningDate: '2026-05-10',
      validTill: '2026-09-10',
      status: 'Active',
      dues: 0,
      avatarColor: '#be185d'
    }
  ],
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

    // Map initial occupants
    const setOcc = (seatId, studentId, studentName, shift) => {
      const s = list.find(x => x.id === seatId);
      if (s) {
        s.status = 'Occupied';
        s.studentId = studentId;
        s.studentName = studentName;
        s.shift = shift;
      }
    };

    setOcc('G4', 'GL-2026-001', 'Rahul Kumar Gupta', 'Full Day');
    setOcc('G8', 'GL-2026-002', 'Priya Singh', 'Morning');
    setOcc('G12', 'GL-2026-003', 'Amit Kumar Tiwari', 'Evening');
    setOcc('A2', 'GL-2026-004', 'Anjali Kumari', 'Full Day');
    setOcc('A9', 'GL-2026-005', 'Vikash Yadav', 'Morning');
    setOcc('G15', 'GL-2026-006', 'Sneha Mishra', 'Afternoon');
    setOcc('A14', 'GL-2026-007', 'Roshan Verma', 'Full Day');
    setOcc('G20', 'GL-2026-008', 'Pooja Pandey', 'Morning');

    const m = list.find(x => x.id === 'G11');
    if (m) m.status = 'Maintenance';

    return list;
  })(),
  transactions: [
    {
      receiptNo: 'GL-2026-1001',
      studentId: 'GL-2026-001',
      studentName: 'Rahul Kumar Gupta',
      phone: '9835012345',
      seatId: 'G4',
      shift: 'Full Day',
      amount: 800,
      paymentMode: 'UPI (PhonePe)',
      paymentDate: '2026-08-10',
      paymentTime: '10:30 AM',
      period: 'Aug 2026 - Sep 2026',
      collectedBy: 'Ankit Gupta (Admin)',
      status: 'Paid',
      remarks: 'Monthly renewal fee'
    },
    {
      receiptNo: 'GL-2026-1002',
      studentId: 'GL-2026-002',
      studentName: 'Priya Singh',
      phone: '9708145678',
      seatId: 'G8',
      shift: 'Morning',
      amount: 500,
      paymentMode: 'Cash at Counter',
      paymentDate: '2026-08-01',
      paymentTime: '08:15 AM',
      period: 'Aug 2026 - Sep 2026',
      collectedBy: 'Ankit Gupta (Admin)',
      status: 'Paid',
      remarks: 'Monthly study subscription'
    },
    {
      receiptNo: 'GL-2026-1003',
      studentId: 'GL-2026-004',
      studentName: 'Anjali Kumari',
      phone: '9631256789',
      seatId: 'A2',
      shift: 'Full Day',
      amount: 800,
      paymentMode: 'UPI (Google Pay)',
      paymentDate: '2026-08-05',
      paymentTime: '11:45 AM',
      period: 'Aug 2026 - Sep 2026',
      collectedBy: 'Ankit Gupta (Admin)',
      status: 'Paid',
      remarks: 'Monthly seat fee'
    },
    {
      receiptNo: 'GL-2026-1004',
      studentId: 'GL-2026-006',
      studentName: 'Sneha Mishra',
      phone: '9570112244',
      seatId: 'G15',
      shift: 'Afternoon',
      amount: 500,
      paymentMode: 'UPI (Paytm)',
      paymentDate: '2026-08-01',
      paymentTime: '01:20 PM',
      period: 'Aug 2026 - Sep 2026',
      collectedBy: 'Ankit Gupta (Admin)',
      status: 'Paid',
      remarks: 'Monthly subscription'
    },
    {
      receiptNo: 'GL-2026-1005',
      studentId: 'GL-2026-007',
      studentName: 'Roshan Verma',
      phone: '9471889900',
      seatId: 'A14',
      shift: 'Full Day',
      amount: 800,
      paymentMode: 'Cash at Counter',
      paymentDate: '2026-08-15',
      paymentTime: '05:10 PM',
      period: 'Aug 2026 - Sep 2026',
      collectedBy: 'Ankit Gupta (Admin)',
      status: 'Paid',
      remarks: 'Monthly library pass'
    },
    {
      receiptNo: 'GL-2026-1006',
      studentId: 'GL-2026-008',
      studentName: 'Pooja Pandey',
      phone: '9304123987',
      seatId: 'G20',
      shift: 'Morning',
      amount: 500,
      paymentMode: 'UPI (BHIM / Direct QR)',
      paymentDate: '2026-08-10',
      paymentTime: '09:05 AM',
      period: 'Aug 2026 - Sep 2026',
      collectedBy: 'Ankit Gupta (Admin)',
      status: 'Paid',
      remarks: 'Monthly fee'
    }
  ],
  books: [
    {
      id: 'BK-101',
      title: 'Indian Polity (6th Edition)',
      author: 'M. Laxmikanth',
      category: 'UPSC / BPSC GS',
      isbn: '978-9352603633',
      shelf: 'Shelf A-1',
      totalCopies: 4,
      availableCopies: 3,
      status: 'Available'
    },
    {
      id: 'BK-102',
      title: 'Lucent General Knowledge 2026',
      author: 'Dr. Binay Karna',
      category: 'General Competition',
      isbn: '978-8194489818',
      shelf: 'Shelf A-2',
      totalCopies: 6,
      availableCopies: 4,
      status: 'Available'
    },
    {
      id: 'BK-103',
      title: 'Quantitative Aptitude for Competitive Examinations',
      author: 'Dr. R.S. Aggarwal',
      category: 'Mathematics',
      isbn: '978-9352534029',
      shelf: 'Shelf B-1',
      totalCopies: 5,
      availableCopies: 5,
      status: 'Available'
    },
    {
      id: 'BK-104',
      title: 'Bihar Ek Parichay (Bihar Special GK)',
      author: 'Imtiaz Ahmad & Rajnish Kumar',
      category: 'BPSC / Bihar Special',
      isbn: '978-9389278019',
      shelf: 'Shelf A-3',
      totalCopies: 4,
      availableCopies: 2,
      status: 'Available'
    },
    {
      id: 'BK-105',
      title: 'A Brief History of Modern India (Spectrum)',
      author: 'Rajiv Ahir (IPS)',
      category: 'History',
      isbn: '978-8179307731',
      shelf: 'Shelf A-1',
      totalCopies: 3,
      availableCopies: 1,
      status: 'Available'
    },
    {
      id: 'BK-106',
      title: 'A Modern Approach to Verbal & Non-Verbal Reasoning',
      author: 'Dr. R.S. Aggarwal',
      category: 'Reasoning',
      isbn: '978-9352534326',
      shelf: 'Shelf B-2',
      totalCopies: 4,
      availableCopies: 4,
      status: 'Available'
    },
    {
      id: 'BK-107',
      title: 'Word Power Made Easy',
      author: 'Norman Lewis',
      category: 'English Vocabulary',
      isbn: '978-0143424680',
      shelf: 'Shelf B-3',
      totalCopies: 5,
      availableCopies: 3,
      status: 'Available'
    },
    {
      id: 'BK-108',
      title: 'NCERT Class 6 to 12 Indian History Summary',
      author: 'Disha Experts',
      category: 'NCERT Reference',
      isbn: '978-9389986341',
      shelf: 'Shelf A-4',
      totalCopies: 3,
      availableCopies: 3,
      status: 'Available'
    }
  ],
  issuedBooks: [
    {
      id: 'ISS-201',
      bookId: 'BK-104',
      bookTitle: 'Bihar Ek Parichay (Bihar Special GK)',
      studentId: 'GL-2026-001',
      studentName: 'Rahul Kumar Gupta',
      issueDate: '2026-08-08',
      dueDate: '2026-08-22',
      returnDate: null,
      status: 'Issued'
    },
    {
      id: 'ISS-202',
      bookId: 'BK-105',
      bookTitle: 'A Brief History of Modern India (Spectrum)',
      studentId: 'GL-2026-003',
      studentName: 'Amit Kumar Tiwari',
      issueDate: '2026-07-28',
      dueDate: '2026-08-11',
      returnDate: null,
      status: 'Overdue'
    }
  ]
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
