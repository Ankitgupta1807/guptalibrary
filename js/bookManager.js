/**
 * GUPTA LIBRARY - BOOK INVENTORY & CIRCULATION MANAGER
 * Location: Sasamusa, Gopalganj, Bihar - 841505
 */

const BookManager = {
  searchQuery: '',
  selectedCategory: 'all',

  init() {
    this.render();
    this.renderIssued();
    this.attachEvents();
  },

  attachEvents() {
    const searchInput = document.getElementById('book-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }

    const catFilter = document.getElementById('book-category-filter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.render();
      });
    }

    // Add Book Form
    const formAddBook = document.getElementById('form-add-book');
    if (formAddBook) {
      formAddBook.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddBook(e.target);
      });
    }

    // Issue Book Form
    const formIssueBook = document.getElementById('form-issue-book');
    if (formIssueBook) {
      formIssueBook.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleIssueBook(e.target);
      });
    }
  },

  render() {
    const tableBody = document.getElementById('books-table-body');
    if (!tableBody) return;

    let books = window.appState.getBooks();

    if (this.searchQuery) {
      books = books.filter(b => 
        b.title.toLowerCase().includes(this.searchQuery) ||
        b.author.toLowerCase().includes(this.searchQuery) ||
        b.shelf.toLowerCase().includes(this.searchQuery) ||
        b.isbn.toLowerCase().includes(this.searchQuery)
      );
    }

    if (this.selectedCategory !== 'all') {
      books = books.filter(b => b.category.toLowerCase().includes(this.selectedCategory.toLowerCase()));
    }

    const countElem = document.getElementById('books-count-badge');
    if (countElem) countElem.textContent = `${books.length} Titles`;

    if (books.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No books found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = books.map(b => {
      const isAvailable = b.availableCopies > 0;
      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">${b.title}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Author: ${b.author} &bull; ISBN: ${b.isbn}</div>
          </td>
          <td>
            <span class="status-pill active" style="font-size: 0.74rem; background: var(--bg-subtle); color: var(--text-main); border: 1px solid var(--border-light);">
              ${b.category}
            </span>
          </td>
          <td><strong style="color: var(--primary);">${b.shelf}</strong></td>
          <td>
            <div style="font-weight: 700; font-size: 0.95rem; color: ${isAvailable ? 'var(--success-dark)' : 'var(--danger-dark)'};">
              ${b.availableCopies} / ${b.totalCopies} Available
            </div>
          </td>
          <td>
            <span class="status-pill ${isAvailable ? 'active' : 'overdue'}">${isAvailable ? 'In Stock' : 'All Borrowed'}</span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-primary btn-sm" ${!isAvailable ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="BookManager.openIssueModal('${b.id}')">
              Issue Book
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderIssued() {
    const tableBody = document.getElementById('issued-books-table-body');
    if (!tableBody) return;

    const issued = window.appState.getIssuedBooks();

    if (issued.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color: var(--text-muted);">No books currently issued.</td></tr>`;
      return;
    }

    tableBody.innerHTML = issued.map(item => {
      const isOverdue = item.status === 'Overdue' || (!item.returnDate && new Date(item.dueDate) < new Date());
      return `
        <tr>
          <td>
            <div style="font-weight: 600;">${item.bookTitle}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">ID: ${item.id}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${item.studentName}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${item.studentId}</div>
          </td>
          <td>${item.issueDate}</td>
          <td>
            <div style="font-weight: 600; color: ${isOverdue ? 'var(--danger)' : 'var(--text-main)'};">${item.dueDate}</div>
            ${isOverdue && !item.returnDate ? '<span style="font-size:0.68rem; color:var(--danger); font-weight:700;">OVERDUE</span>' : ''}
          </td>
          <td>
            <span class="status-pill ${item.returnDate ? 'active' : (isOverdue ? 'overdue' : 'pending')}">
              ${item.returnDate ? `Returned on ${item.returnDate}` : (isOverdue ? 'Overdue' : 'Issued')}
            </span>
          </td>
          <td style="text-align: right;">
            ${!item.returnDate ? `
              <button class="btn btn-secondary btn-sm" onclick="BookManager.handleReturn('${item.id}')">Return Book</button>
            ` : '<span style="color:var(--text-subtle); font-size:0.8rem;">Completed</span>'}
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddBookModal() {
    window.App.openModal('modal-add-book');
  },

  handleAddBook(form) {
    const formData = new FormData(form);
    const title = formData.get('title');
    const author = formData.get('author');
    const category = formData.get('category');
    const shelf = formData.get('shelf') || 'Shelf A-1';
    const isbn = formData.get('isbn') || `978-GL-${Date.now().toString().slice(-6)}`;
    const totalCopies = Number(formData.get('totalCopies')) || 1;

    window.appState.addBook({
      title,
      author,
      category,
      shelf,
      isbn,
      totalCopies
    });

    form.reset();
    window.App.closeModal('modal-add-book');
    this.render();
    window.App.updateDashboardStats();
    window.App.showToast(`Book "${title}" added to catalog!`, 'success');
  },

  openIssueModal(bookId) {
    const bookSelect = document.getElementById('issue-book-select');
    const studentSelect = document.getElementById('issue-student-select');

    if (bookSelect) {
      const books = window.appState.getBooks().filter(b => b.availableCopies > 0);
      bookSelect.innerHTML = books.map(b => `<option value="${b.id}" ${b.id === bookId ? 'selected' : ''}>${b.title} (${b.availableCopies} available)</option>`).join('');
    }

    if (studentSelect) {
      const members = window.appState.getMembers();
      studentSelect.innerHTML = members.map(m => `<option value="${m.id}">${m.name} (${m.id} - ${m.phone})</option>`).join('');
    }

    // Default due date to 14 days later
    const dueInput = document.getElementById('issue-due-date');
    if (dueInput) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      dueInput.value = d.toISOString().split('T')[0];
    }

    window.App.openModal('modal-issue-book');
  },

  handleIssueBook(form) {
    const formData = new FormData(form);
    const bookId = formData.get('bookId');
    const studentId = formData.get('studentId');
    const dueDate = formData.get('dueDate');

    const result = window.appState.issueBook(bookId, studentId, dueDate);
    if (!result) {
      window.App.showToast('Could not issue book. Check stock.', 'error');
      return;
    }

    form.reset();
    window.App.closeModal('modal-issue-book');
    this.render();
    this.renderIssued();
    window.App.updateDashboardStats();
    window.App.showToast('Book issued successfully!', 'success');
  },

  handleReturn(issueId) {
    const success = window.appState.returnBook(issueId);
    if (success) {
      this.render();
      this.renderIssued();
      window.App.updateDashboardStats();
      window.App.showToast('Book marked as returned.', 'success');
    }
  }
};

window.BookManager = BookManager;
