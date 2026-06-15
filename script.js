// Book Tracker App
class BookTracker {
    constructor() {
        this.books = this.loadBooks();
        this.editingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('bookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook();
        });

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => this.render());
        document.getElementById('statusFilter').addEventListener('change', () => this.render());
    }

    addBook() {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const genre = document.getElementById('genre').value;
        const year = document.getElementById('year').value;
        const status = document.getElementById('status').value;
        const rating = document.getElementById('rating').value;

        const book = {
            id: Date.now(),
            title,
            author,
            genre,
            year: year || 'Unknown',
            status,
            rating: rating ? parseInt(rating) : null
        };

        this.books.push(book);
        this.saveBooks();
        this.clearForm();
        this.render();
    }

    deleteBook(id) {
        if (confirm('Are you sure you want to delete this book?')) {
            this.books = this.books.filter(book => book.id !== id);
            this.saveBooks();
            this.render();
        }
    }

    editBook(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        // Populate form with book data
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('genre').value = book.genre;
        document.getElementById('year').value = book.year === 'Unknown' ? '' : book.year;
        document.getElementById('status').value = book.status;
        document.getElementById('rating').value = book.rating || '';

        this.editingId = id;
        document.querySelector('.btn-add').textContent = 'Update Book';

        // Scroll to form
        document.querySelector('.add-book-section').scrollIntoView({ behavior: 'smooth' });
    }

    saveBooks() {
        localStorage.setItem('books', JSON.stringify(this.books));
    }

    loadBooks() {
        const stored = localStorage.getItem('books');
        return stored ? JSON.parse(stored) : [];
    }

    clearForm() {
        document.getElementById('bookForm').reset();
        this.editingId = null;
        document.querySelector('.btn-add').textContent = 'Add Book';
    }

    getFilteredBooks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        return this.books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
                                book.author.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || book.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }

    render() {
        const container = document.getElementById('booksContainer');
        const filteredBooks = this.getFilteredBooks();

        if (filteredBooks.length === 0) {
            container.innerHTML = '<p class="no-books">No books found. Try adjusting your filters!</p>';
            return;
        }

        container.innerHTML = filteredBooks.map(book => this.createBookCard(book)).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.editBook(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteBook(id);
            });
        });
    }

    createBookCard(book) {
        const statusClass = book.status.toLowerCase().replace(' ', '-');
        const ratingStars = book.rating ? '⭐'.repeat(book.rating) : '<span class="no-rating">Not rated</span>';

        return `
            <div class="book-card">
                <h3>${this.escapeHtml(book.title)}</h3>
                <p class="author">by ${this.escapeHtml(book.author)}</p>
                <p><strong>Year:</strong> ${book.year}</p>
                <div>
                    <span class="genre">${this.escapeHtml(book.genre || 'N/A')}</span>
                    <span class="status ${statusClass}">${book.status}</span>
                </div>
                <div class="rating">${ratingStars}</div>
                <div class="card-actions">
                    <button class="btn-edit" data-id="${book.id}">Edit</button>
                    <button class="btn-delete" data-id="${book.id}">Delete</button>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BookTracker();
});
