import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchBooks();
  }, [currentPage]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/books?page=${currentPage}`);
      let data = response.data.books || [];
      // client-side search
      const q = query.trim().toLowerCase();
      if (q) {
        data = data.filter(b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
        );
      }
      // client-side sort
      if (sortBy === 'year') {
        data = [...data].sort((a,b) => (a.year||0) - (b.year||0));
      } else if (sortBy === 'title') {
        data = [...data].sort((a,b) => a.title.localeCompare(b.title));
      }
      setBooks(data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="space-between mb-6">
        <h1 className="page-title">All Books</h1>
        <Link 
          to="/add-book" 
          className="btn btn-primary"
        >
          Add New Book
        </Link>
      </div>

      <div className="space-between mb-4">
        <input
          type="text"
          placeholder="Search by title or author"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className=""
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="">
          <option value="createdAt">Newest</option>
          <option value="title">Title</option>
          <option value="year">Published Year</option>
        </select>
        <button onClick={fetchBooks} className="btn btn-secondary">Apply</button>
      </div>

      <div className="grid grid-3">
        {books.map((book) => (
          <div key={book._id} className="card">
            <div className="space-between">
              <h2 className="card-title">{book.title}</h2>
              <span className="muted">{(book.avgRating ?? 0).toFixed(1)}★</span>
            </div>
            <p className="muted">by {book.author}</p>
            <p className="muted">{book.genre} • {book.year}</p>
            <p className="mt-2">{book.description}</p>
            <div className="space-between mt-2">
              <span className="muted">Added by {book.addedBy.name}</span>
              <Link 
                to={`/book/${book._id}`}
                className="nav-link"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="btn btn-secondary">Previous</button>
        <span className="pagination-label">Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="btn btn-secondary">Next</button>
      </div>
    </div>
  );
};

export default BookList;